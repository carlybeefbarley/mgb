import _ from 'lodash'
import PropTypes from 'prop-types'

import { Store } from '/client/imports/stores'
import { utilPushTo } from '/client/imports/routes/QLink'
import {
  mgbAjax,
  getAssetHandlerWithContent2,
  getAssetBySelector,
} from '/client/imports/helpers/assetFetchers'
import { showToast } from '/client/imports/modules'

/*
In order to handle cases when user switches steps by going
back/forward on the browser or buy manually changing the URL
to one of the assets, the step data will be fetched by the
corresponding id, and the corresponding id will be fetched from
the current assetId.

currStepIndex is used to load the correct step data when the
user clicks back/next button in HocActivity and refers to the index
in the steps array from activityData.json
*/
class HourOfCodeStore extends Store {
  static storeShape = {
    state: PropTypes.shape({
      currAssetId: PropTypes.string,
      currStep: PropTypes.object,
      currStepId: PropTypes.string,
      currStepIndex: PropTypes.number,
      completedSteps: PropTypes.array,
      isActivityOver: PropTypes.bool,
      api: PropTypes.object,
      steps: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          header: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired,
          videoId: PropTypes.string,
          code: PropTypes.string,
        }),
      ),
    }),
  }

  state = {
    currStep: null, // object containing step data in activityData.json
    currStepId: '', // id for current step, to get step from corresponding assetId
    currStepIndex: 0, // index of current step in steps array for handling back/next
    completedSteps: [], // keep track of which steps were previously completed
    steps: null, // will get from CDN
    isActivityOver: false, // when user reaches 1 hour limit
    api: null, // will get from CDN
  }

  storeWillReceiveState(nextState) {
    let { steps, currStepId } = nextState

    return {
      currStep: steps ? _.find(steps, { id: currStepId }) : null,
      totalSteps: steps ? steps.length : 0,
      isFirstStep: steps ? currStepId === _.head(steps).id : false,
      isLastStep: steps ? currStepId === _.last(steps).id : false,
    }
  }

  storeDidUpdate(prevState) {
    const { currAssetId: prevAssetId } = prevState
    const { currAssetId } = this.state
    if (currAssetId !== prevAssetId) {
      this.loadStepForAsset()

      Meteor.call(
        'User.updateProfile',
        Meteor.user()._id,
        { 'profile.HoC.currStepId': this.state.currStepId },
        error => {
          if (error) console.error('Could not update progress:', error.reason)
        },
      )
    }
  }

  getUserAssetShape = (step = this.state.currStep, stepId = this.state.currStepId) => {
    const assetName = 'dwarfs.userCode.' + stepId
    const assetKind = 'code'

    return {
      // Placeholder asset name
      name: assetName,
      kind: assetKind,
      dn_ownerName: Meteor.user().username,
      isCompleted: false,
      isPrivate: true,
      isDeleted: true,
      content2: { src: _.get(step, 'code', '') },
    }
  }

  getUserAssetForStep = (step = this.state.currStep, stepId = this.state.currStepId) => {
    const { name, kind, dn_ownerName } = this.getUserAssetShape(step, stepId)
    const assetShape = { name, kind, dn_ownerName }

    // maybe show loading here ?
    return new Promise((resolve, reject) => {
      // if asset exists, open it, else create one
      getAssetBySelector(assetShape, asset => {
        if (!asset) {
          console.error('Failed to find HoC user code asset using selector', assetShape)
          reject()
          return
        }
        // and hide loading here?
        resolve(asset)
      })
    })
  }

  getCurrentAssetId = currAssetId => {
    this.setState({ currAssetId })
  }

  getStepIdFromAssetId = assetId => {
    const stepToAssetMap = Meteor.user().profile.HoC.stepToAssetMap
    return _.findKey(stepToAssetMap, asset => {
      return asset === assetId
    })
  }

  loadStepForAsset = (steps = this.state.steps) => {
    const { currAssetId } = this.state

    const currStepId = this.getStepIdFromAssetId(currAssetId)
    const currStep = _.find(steps, { id: currStepId })
    const currStepIndex = _.indexOf(steps, currStep)

    this.setState({ currStep, currStepId, currStepIndex })
  }

  loadUserAssetForStep = () => {
    return this.getUserAssetForStep().then(asset => {
      utilPushTo(null, `/u/${asset.dn_ownerName}/asset/${asset._id}`)
    })
  }

  // update step to asset mapping if there are any changes
  updateStepToAsset = activityAsset => {
    const { steps, currStepId, currStepIndex, currAssetId } = this.state
    if (!steps) return

    let stepToAssetMap = Meteor.user().profile.HoC.stepToAssetMap
    const stepIds = Object.keys(stepToAssetMap)

    if (!currStepId || !currStepIndex || steps.length === stepIds.length) return

    // update mapping if changes are made to activityData
    let newId = activityAsset.steps[currStepIndex].id
    if (!_.find(stepIds, newId)) {
      stepToAssetMap[newId] = currAssetId

      Meteor.call(
        'User.updateProfile',
        Meteor.user()._id,
        { 'profile.HoC.stepToAssetMap': stepToAssetMap },
        error => {
          if (error) console.error('Could not update stepToAssetMap to profile:', error.reason)
        },
      )
    }
  }

  setActivityData = data => {
    this.setState(data)
    this.preloadAssets(data)
  }

  cleanup = () => {
    if (this.cachedHandlers) {
      this.cachedHandlers.forEach(handler => handler && handler.stop())
      this.cachedHandlers = null
    }
  }

  preloadAssets = data => {
    const promises = []
    const cachedHandlers = this.cachedHandlers || []
    // !!! Notice - we are skipping current step (which by default will be 0 ) so array looks like [undefined, ...instances]
    data.steps.forEach((step, stepIndex) => {
      if (stepIndex === this.state.stepIndex || cachedHandlers[stepIndex]) return

      promises[stepIndex] = this.getUserAssetForStep(step, step.id)
    })

    Promise.all(promises).then(assets => {
      assets.forEach((asset, stepIndex) => {
        if (!asset) return
        // !!! Be aware - we are opening subscriptions here which won't be closed automatically - we need to close them manually

        // this is dummy request to open subscription for another step
        // then AssetEdit will pick it up and it will be loaded - see AssetEditRoute -> getMeteorData
        cachedHandlers[stepIndex] = getAssetHandlerWithContent2(asset._id, () => {}, false, true)
      })

      this.cachedHandlers = cachedHandlers
    })
  }

  getActivityData = (isActivitySetup = false) => {
    return new Promise((resolve, reject) => {
      mgbAjax(`/api/asset/code/!vault/dwarfs.activityData.json`, (err, activityAssetString) => {
        let activityAsset

        try {
          activityAsset = JSON.parse(activityAssetString)
        } catch (err) {
          console.error('Failed to JSON parse activity asset:', activityAsset)
          showToast.error('Cannot load activity: ' + err.reason)
          reject(err)
          return
        }

        // These should not be called when guest is being generated
        if (!isActivitySetup) {
          this.updateStepToAsset(activityAsset)
          this.loadStepForAsset(activityAsset.steps)
          this.setActivityData(activityAsset)
        }
        resolve(activityAsset)
      })
    })
  }

  setCurrStepCompletion = isComplete => {
    const { currStepId, completedSteps } = this.state
    isComplete
      ? completedSteps.push(currStepId)
      : _.remove(completedSteps, stepId => {
          return _.indexOf(completedSteps, stepId) !== -1
        })
    this.setState({ completedSteps })
  }

  checkActivityTime = () => {
    if (!Meteor.user()) return

    const now = new Date().getTime()
    const hour = 3600000 + 10000 // an hour in milliseconds (+10 seconds)
    if (now >= Meteor.user().createdAt.getTime() + hour) {
      this.setState({ isActivityOver: true })
    }
  }

  stepNext = () => {
    let { currStepIndex, steps } = this.state

    if (currStepIndex + 1 < steps.length) {
      currStepIndex++
      const currStep = steps[currStepIndex]
      this.getUserAssetForStep(currStep, currStep.id).then(asset => {
        utilPushTo(null, `/u/${asset.dn_ownerName}/asset/${asset._id}`)
        this.setState({ currAssetId: asset._id })
      })
    }
  }

  stepBack = () => {
    let { currStepIndex, steps } = this.state

    if (currStepIndex > 0) {
      currStepIndex--
      const currStep = steps[currStepIndex]
      this.getUserAssetForStep(currStep, currStep.id).then(asset => {
        utilPushTo(null, `/u/${asset.dn_ownerName}/asset/${asset._id}`)
        this.setState({ currAssetId: asset._id })
      })
    }
  }

  prepareSource = srcIn => {
    srcIn = this.regexLoop(srcIn)
    srcIn = this.regexIf(srcIn)
    // keep all in the first line - so lines match for user
    return `import DwarfX from "/!vault:dwarf-ac"; import main from "/!vault:dwarfs.main"; const dwarf = new DwarfX; // jshint ignore:line
/** @param {DwarfX} dwarf */
main.setup = (dwarf) => { // jshint ignore:line
${srcIn}
};`
  }

  regexLoop = srcIn => {
    const regex = /loop\s*[(]\s*(.*)[)]\s*[{]([\s\S]*?)[}]/gi
    let result
    while ((result = regex.exec(srcIn)) !== null) {
      let code = result[0]
      let iterator = result[1]
      let loopContent = result[2]
      let newCode = `for(let i=0; i<${iterator}; i++){
        ${loopContent}
      }`
      srcIn = srcIn.replace(code, newCode)
    }
    return srcIn
  }

  regexIf = srcIn => {
    const regex = /if\s*\(([\s\S]*?)\)\s*{([\s\S]*?)}/gi
    let result
    while ((result = regex.exec(srcIn)) !== null) {
      let code = result[0]
      let newCode = `ActionManager.addAction('if', \`${code}\`)`
      srcIn = srcIn.replace(code, newCode)
    }
    return srcIn
  }
}

export default new HourOfCodeStore()
