import _ from 'lodash'
import PropTypes from 'prop-types'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'
import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'
import { transformStep } from '/client/imports/Joyride/JoyrideSpecialMacros'

import handleFlexPanelChange from '/client/imports/components/SidePanels/handleFlexPanelChange'
import { showToast } from '/client/imports/modules'
import { Store } from '/client/imports/stores'
import { utilPushTo } from '/client/imports/routes/QLink'
import refreshBadgeStatus from '/client/imports/helpers/refreshBadgeStatus'
import { makeTutorialAssetPathFromSkillPath } from '/imports/Skills/SkillNodes/SkillNodes'

const DEFAULT_STATE = {
  debug: false,
  originatingAsset: null,
  isRunning: false,
  skillPathTutorial: null,
  step: null,
  stepIndex: null,
  steps: [],
}

/**
 * @param steps
 * @returns {{ newSteps: Array, errors: Array<{ key: propertyName, val: UnrecognizedMacro }> }}
 */
export const parseStepsWithMacroResults = steps => {
  const errors = []

  const validPositions = [
    'top',
    'top-left',
    'top-right',
    'bottom',
    'bottom-left',
    'bottom-right',
    'right',
    'left',
  ]

  // console.log('parseStepsWithMacroResults steps:', steps)

  const newSteps = []
    .concat(steps)
    .map((step, i) => {
      if (!_.isPlainObject(step) && !_.isString(step)) {
        console.error(
          'parseStepsWithMacroResults() expected all steps in array to be objects or strings.',
          `Step at index ${i} is type "${typeof step}" of value:`,
          step,
        )
      }

      const { notFoundMacros, newStep } = transformStep(step)

      if (!_.isEmpty(notFoundMacros)) {
        console.error(`parseStepsWithMacroResults() steps[${i}] has unknown macros:`, notFoundMacros)
        errors[i] = notFoundMacros
        return null
      }

      // console.log('-- STEP:', newStep.heading || newStep.title, '--------')
      // console.log('SELECTOR BEFORE', newStep.selector)
      // console.log('POSITION BEFORE', newStep.position)

      newStep.selector = newStep.selector || 'body'
      newStep.position = newStep.position || (newStep.selector === 'body' ? 'top' : 'bottom')
      // console.log('SELECTOR AFTER', newStep.selector)
      // console.log('POSITION AFTER', newStep.position)

      if (!newStep.position || !_.includes(validPositions, newStep.position)) {
        console.error(`parseStepsWithMacroResults() has step with invalid position '${newStep.position}'`)
      }

      return newStep
    })
    // remove non-existent steps
    .filter(Boolean)

  // console.log('parseStepsWithMacroResults RESULT:', { newSteps, errors })

  return { newSteps, errors }
}

class JoyrideStore extends Store {
  static storeShape = {
    //
    // API
    //
    // TODO get all methods in here and doc them
    addSteps: PropTypes.func,
    handleCallback: PropTypes.func,
    preparePage: PropTypes.func,
    startSkillPathTutorial: PropTypes.func,
    stop: PropTypes.func,
    setDebug: PropTypes.func,

    //
    // State
    //
    state: PropTypes.shape({
      /** Whether or not there is a tutorial in progress  */
      isRunning: PropTypes.bool.isRequired,

      steps: PropTypes.array.isRequired,

      /**
       * String with skillPath (e.g code.js.foo) if it was started by startSkillPathTutorial
       * i.e. it is an OFFICIAL SKILL TUTORIAL
       */
      skillPathTutorial: PropTypes.string,

      /** The current joyride step. */
      step: PropTypes.object,

      /** Index of the current joyride step. */
      stepIndex: PropTypes.number,

      /**
       * Used to support nice EditTutorial button in fpLearn ONLY.
       * This is not used for load, just for other ui to enable an "Edit Tutorial" button.
       */
      originatingAsset: PropTypes.shape({
        id: PropTypes.string.isRequired,
        ownerName: PropTypes.string.isRequired,
      }),

      /** Enable debug console output */
      debug: PropTypes.bool.isRequired,
    }),
  }

  state = DEFAULT_STATE

  _listeners = {}

  storeWillReceiveState(nextState) {
    this.debug('storeWillReceiveState nextState', nextState)
    this.debug('storeWillReceiveState step 0', JSON.stringify(nextState.steps[0], null, 2))

    //
    // Handle Finished
    //

    // only emit finished once on last step
    if (this.isLastStep(nextState)) {
      this.debug('updated to last step, emit finish')
      this.emit('finish')
    }

    //
    // Handle skipIfUrlAt
    //  - Detect if we're going forward or backward in step index.
    //  - Continue skipping steps in that direction while skipIfUrlAt matches the url.
    //  - When jumping to a specific step, more than +/- 1 index, use a forward direction.
    //
    let nextStepIndex = nextState.stepIndex
    const direction = nextStepIndex - this.state.stepIndex === -1 ? -1 : 1
    let skipIfUrlAt = _.get(nextState.steps[nextStepIndex], 'skipIfUrlAt')

    while (skipIfUrlAt === window.location.pathname) {
      nextStepIndex += direction
      skipIfUrlAt = _.get(nextState.steps[nextStepIndex], 'skipIfUrlAt')
    }

    //
    // New State
    //
    const moreState = {
      step: nextState.steps[nextStepIndex] || null,
      stepIndex: nextStepIndex,
    }

    this.debug('storeWillReceiveState moreState', moreState)
    this.debug('storeWillReceiveState step', JSON.stringify(moreState.step, null, 2))

    return moreState
  }

  storeDidUpdate() {
    // invoke any page preparations
    this.preparePage(_.get(this.state.step, 'preparePage'))
  }

  debug = (...args) => this.state.debug && console.log('JoyrideStore:', ...args)

  // ============================================================
  // Steps
  // ============================================================

  /**
   * This is the React-joyride (user tours) support.
   *
   * @see https://github.com/gilbarbara/react-joyride for background.
   * @see /DeveloperDocs/ReactJoyrideTours.md for our rules/conventions.
   *
   * @param {string|object[]} stepsOrAssetId - An asset id or an array of joyride steps.
   * @param {object} [opts={}]
   * @param {string} [opts.skillPath] - Used by startSkillPathTutorial().
   * @param {object} [opts.origAssetId] - Not used for load, just enables an "Edit Tutorial" button.
   * @param {string} [opts.origAssetId.ownerName] - An asset owner name (e.g. asset.dn_ownerName).
   * @param {string} [opts.origAssetId.id] - An asset id (e.g asset._id).
   */
  addSteps = (stepsOrAssetId, opts = {}) => {
    this.debug('addSteps', stepsOrAssetId)

    return Promise.resolve()
      .then(() => {
        if (_.isString(stepsOrAssetId)) return this.addStepsFromAssetId(stepsOrAssetId, opts)
        if (_.isArray(stepsOrAssetId)) return this.addStepsFromArray(stepsOrAssetId, opts)

        console.error('addSteps() expects an asset id string or an array of steps, got:', stepsOrAssetId)
        throw new Error(
          `addSteps() expects an asset id string or an array of steps, got: ${typeof stepsOrAssetId}`,
        )
      })
      .then(() => {
        this.start()
      })
  }

  addStepsFromArray = (stepsArr, opts) => {
    this.debug('addStepsFromArray', stepsArr)
    const parsedSteps = _.isEmpty(stepsArr) ? [] : parseStepsWithMacroResults(stepsArr).newSteps

    const newState = {
      stepIndex: 0,
      steps: parsedSteps,
      skillPathTutorial: opts.skillPath || null,
    }

    // Just to enable a nice edit Tutorial button in fpLearn
    if (opts.origAssetId) newState.originatingAsset = opts.origAssetId

    this.setState(newState)
  }

  addStepsFromAssetId = (assetId, opts) => {
    this.debug('addStepsFromAssetId', assetId)
    // We interpret this as an asset id, e.g cDutAafswYtN5tmRi, and we expect some JSON..
    const tutorialPath = _.startsWith(assetId, ':') ? `!vault${assetId}` : assetId
    const codeUrl = `/api/asset/tutorial/${tutorialPath}`
    this.debug(`Loading tutorial: '${assetId}' from ${codeUrl}`)

    return fetchAssetByUri(codeUrl)
      .catch(err => {
        console.error(`Failed to fetch tutorial '${assetId}':`, err)
        showToast.error(`Something failed fetching that tutorial. Refresh and try again.`, {
          title: 'Tutorial',
        })
      })
      .then(data => {
        this.debug('Fetched tutorial:', data)
        return JSON.parse(data)
      })
      .catch(err => {
        console.error(`Failed to parse JSON for tutorial at '${codeUrl}:`, err)
        showToast.error('That tutorial is broken :(', { title: 'Tutorial' })
      })
      .then(parsedTutorial => {
        this.debug('Parsed tutorial json:', parsedTutorial)
        if (parsedTutorial && parsedTutorial.steps) {
          return this.addStepsFromArray(parsedTutorial.steps, opts)
        }
      })
      .catch(err => {
        console.error('Failed to add joyride steps for', tutorialPath, err)
        showToast.error("There's something wrong with some of the steps in this tutorial.", {
          title: 'Tutorial',
        })
      })
      .then(() => {
        this.debug('Successfully added joyride steps for tutorial:', tutorialPath)
      })
  }

  getCurrentStep = (state = this.state) => state.steps[state.stepIndex]

  hasSteps = (state = this.state) => !_.isEmpty(state.steps)

  isFirstStep = (state = this.state) => {
    return this.hasSteps(state) && this.getCurrentStep(state) === _.first(state.steps)
  }

  isLastStep = (state = this.state) => {
    return this.hasSteps(state) && this.getCurrentStep(state) === _.last(state.steps)
  }

  isFinished = (state = this.state) => state.stepIndex > state.steps.length - 1

  // ============================================================
  // Playback controls
  // ============================================================

  start = () => {
    this.debug('start')
    this.setState({ isRunning: true })
  }

  startSkillPathTutorial = skillPath => {
    this.debug('startSkillPathTutorial', skillPath)
    const tutPath = makeTutorialAssetPathFromSkillPath(skillPath, 0)
    return this.addSteps(tutPath, { replace: true, skillPath })
  }

  /**
   * Completes a joyride step.
   * @param tag
   */
  completeTag = tag => {
    this.debug('completeTag', tag)
    if (!_.startsWith(tag, 'mgbjr-CT-')) {
      console.error(`joyrideStore.completeTag(tag) "tag" must start with "mgbjr-CT-", got: "${tag}"`)
    }

    if (_.get(this.state.step, 'awaitCompletionTag') === tag) this.goToNextStep()
  }

  stop = () => {
    this.setState(DEFAULT_STATE)
  }

  reset = () => {
    this.setState(DEFAULT_STATE)
  }

  goToNextStep = () => {
    const nextIndex = this.state.stepIndex + 1
    this.setState({ stepIndex: nextIndex })
  }

  goToPrevStep = () => {
    const nextIndex = this.state.stepIndex - 1
    this.setState({ stepIndex: nextIndex })
  }

  // ============================================================
  // Other
  // ============================================================
  setDebug = debug => {
    this.debug('setDebug', debug)
    this.setState({ debug })
  }

  /**
   * Some steps need to take actions in the app when displaying.
   * Example, a Chat tutorial needs to open the Chat Flex Panel.
   *
   * This method accepts a string of comma separated actions of the format: "action:param".
   *
   * @example
   * // A Joyride step which navigates the user to their Dashboard
   * const steps = [
   *   { preparePage: 'navToRelativeUrl:/dashboard' },
   * ]
   *
   * // or directly called
   * joyrideStore.preparePage('navToRelativeUrl:/dashboard')
   *
   * @returns {null|string} - Nothing or a string of errors
   */
  preparePage = actionsString => {
    this.debug('preparePage', actionsString)
    const errors = []
    if (!actionsString || actionsString === '') return null

    const joyrideHandlers = {
      // !!! these functions must not refer to this or do other funny stuff !!!
      openAsset(type, user, name) {
        // TODO: get location query ???? - or location query should be handled by QLink?
        utilPushTo(null, `/assetEdit/${type}/${user}/${name}`)
      },
      highlightCode(from, to) {
        const evt = new Event('mgbjr-highlight-code')
        evt.data = { from, to }
        window.dispatchEvent(evt)
      },
    }

    // The preparePage string can have multiple actions, each are separated by a comma character
    actionsString.split(',').forEach(act => {
      const [action, ...params] = _.split(act, ':')

      // these handlers can handle multiple params
      if (joyrideHandlers[action]) {
        joyrideHandlers[action].apply(null, params)
        return
      }

      // these handlers can only handle a single param
      const firstParam = _.first(params)

      switch (action) {
        case 'openVaultAssetById':
          // we want to open asset !vault:actParam
          utilPushTo(null, `/u/!vault/asset/${firstParam}`)
          break

        case 'openVaultAssetByName':
          // utilPushTo(null, `/u/!vault/asset/${actParam}`)
          // break
          throw new Error('@dgolds 2/5/17 debugger: TODO @@@@@ need to actually get id from name')

        case 'navToRelativeUrl':
          utilPushTo(null, firstParam)
          break

        case 'openVaultProjectById':
          utilPushTo(null, `/u/!vault/project/${firstParam}`)
          break

        case 'openVaultProjectByName':
          utilPushTo(null, `/u/!vault/projects/${firstParam}`)
          break

        case 'openFlexPanel':
          handleFlexPanelChange(firstParam)
          break

        case 'closeNavPanel':
          console.error('preparePage(closeNavPanel) has been deprecated. Tutorial should be simplified.')
          break

        case 'highlightCode':
          console.error('preparePage(highlightCode) is not implemented, action param was:', firstParam)
          break

        case 'refreshBadgeStatus':
          refreshBadgeStatus()
          break

        default:
          errors.push(`Action '${act} not recognized`)
      }
    })

    return errors.length === 0 ? null : errors.join('; ') + '.'
  }
}

const joyrideStore = new JoyrideStore()

registerDebugGlobal('joyrideStore', joyrideStore, __filename, 'The state manager for tutorials')

export default joyrideStore
