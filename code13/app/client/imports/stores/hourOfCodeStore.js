import _ from 'lodash'
import PropTypes from 'prop-types'
import { Store } from '/client/imports/stores'
import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'
import { utilPushTo } from '/client/imports/routes/QLink'
import { mgbAjax } from '/client/imports/helpers/assetFetchers'
import { showToast } from '/client/imports/routes/App'

class HourOfCodeStore extends Store {
  static storeShape = {
    state: PropTypes.shape({
      currStep: PropTypes.object,
      isCompleted: PropTypes.bool,
      steps: PropTypes.arrayOf(
        PropTypes.shape({
          header: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired,
          video: PropTypes.string,
          code: PropTypes.string,
        }),
      ),
    }),
  }

  state = {
    currStepIndex: 0,
    currStep: null,
    isCompleted: false, // indicator if current tutorial is completed and we need to show modal
    steps: null, // will get from CDN
  }

  storeWillReceiveState(nextState) {
    const { steps, currStepIndex } = nextState

    return {
      currStep: steps ? steps[currStepIndex] : null,
      totalSteps: steps ? steps.length : 0,
      isFirstStep: currStepIndex === 0,
      isLastStep: steps ? steps.length === currStepIndex + 1 : false,
    }
  }

  storeDidUpdate(prevState) {
    const { currStepIndex: prevCurrStepIndex } = prevState
    const { currStepIndex } = this.state

    if (currStepIndex !== prevCurrStepIndex) {
      Meteor.call(
        'User.updateProfile',
        Meteor.user()._id,
        { 'profile.HoC.currStepIndex': currStepIndex },
        error => {
          if (error) console.error('Could not update progress:', error.reason)
        },
      )

      this.loadUserAssetForStep()
    }
  }

  getUserAssetShape = (step = this.state.currStep, stepIndex = this.state.currStepIndex) => {
    const assetName = 'dwarfs.userCode' + stepIndex
    const assetKind = 'code'
    const { name: projectName } = this.getUserProjectShape()

    return {
      // Placeholder asset name
      name: assetName,
      kind: assetKind,
      dn_ownerName: Meteor.user().username,
      projectNames: [projectName],
      isCompleted: false,
      isPrivate: true,
      isDeleted: false,
      content2: { src: _.get(step, 'code', '') },
    }
  }

  getUserProjectShape = () => {
    const projectName = 'hourOfCode'
    const projectDescription = 'Auto-created for Hour of Code'

    return {
      name: projectName,
      description: projectDescription,
    }
  }

  loadUserAssetForStep = () => {
    const { name, kind, dn_ownerName, isDeleted } = this.getUserAssetShape()
    const assetShape = { name, kind, dn_ownerName, isDeleted }

    // if asset exists, open it, else create one
    getAssetBySelector(assetShape, asset => {
      if (!asset) return console.error('Failed to find HoC user code asset using selector', assetShape)

      utilPushTo(null, `/u/${asset.dn_ownerName}/asset/${asset._id}`)
    })
  }

  setActivityData = data => {
    this.setState(data)
  }

  getActivityData = () => {
    return new Promise((resolve, reject) => {
      mgbAjax(`/api/asset/code/!vault/dwarfs.activityData.json`, (err, activityAssetString) => {
        let activityAsset

        try {
          activityAsset = JSON.parse(activityAssetString)
        } catch (err) {
          console.error('Failed to JSON parse activity asset:', activityAsset)
          showToast('Cannot load activity: ' + err.reason, 'error')
          reject(err)
          return
        }
        this.setActivityData(activityAsset)
        resolve(activityAsset)
      })
    })
  }

  stepNext = () => {
    const { currStepIndex, steps } = this.state
    const nextStepIndex = currStepIndex + 1

    if (nextStepIndex < steps.length) {
      this.setState({ currStepIndex: nextStepIndex })
    } else {
      this.successPopup()
    }
  }

  stepBack = () => {
    let { currStepIndex } = this.state

    if (currStepIndex > 0) {
      currStepIndex--
      this.setState({ currStepIndex })
    }
  }

  successPopup = () => this.setState({ isCompleted: true })
}

export default new HourOfCodeStore()
