import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Button, Icon, Message, Segment } from 'semantic-ui-react'

import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/routes/App'
import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'
import { mgbAjax } from '/client/imports/helpers/assetFetchers'
import './editcode.css'

export const GetHoCRoute = (currUser, step) => {
  const newAsset = {
    name: 'HoC.activity.' + step,
    kind: 'code',
    isDeleted: false,
    dn_ownerName: currUser.username,
  }

  // check if asset exists
  getAssetBySelector(newAsset, (asset, err) => {
    if (asset) {
      // asset exists. open it.
      const url = `/u/${asset.dn_ownerName}/asset/${asset._id}`
      utilPushTo(null, url)
    } else {
      newAsset.isCompleted = false
      newAsset.isPrivate = false

      // asset doesn't exist. create one.
      Meteor.call('Azzets.create', newAsset, (error, result) => {
        if (error) {
          showToast('cannot create Asset because: ' + error.reason, 'error')
          return
        }
        newAsset._id = result
        const url = `/u/${currUser.username}/asset/${newAsset._id}`

        utilPushTo(null, url)
      })
    }
  })
}

export default class HoCActivity extends React.Component {
  static propTypes = {
    codeMirror: PropTypes.object,
    highlightLines: PropTypes.func,
    assetId: PropTypes.string,
    style: PropTypes.object,
  }

  constructor(props) {
    super(props)

    // CAN NO LONGER STORE STEP IN STATE SINCE EACH STEP IS A DIFFERENT ASSET
    this.state = {
      step: 0, // curent step of tutorial
      isCompleted: false, // indicator if current tutorial is completed and we need to show modal
      data: {}, // will get from CDN
    }

    mgbAjax(`/api/asset/code/Bouhm/HoC.test`, (err, listStr) => {
      if (err) console.log('error', err)
      else this.setState({ data: JSON.parse(listStr) })
    })
  }

  stepNext = currUser => {
    const step = this.state.step + 1
    if (step < this.state.data.steps.length) {
      this.setState({ step })
    } else this.successPopup()
    GetHoCRoute(currUser, step)
  }

  stepBack = currUser => {
    var step = this.state.step
    if (step > 0) {
      step--
      this.setState({ step })
    }
    GetHoCRoute(currUser, step)
  }

  resetCode = step => {
    step = _.isInteger(step) ? step : this.state.step
    const currStep = this.state.data.steps[step]
    const code = currStep.code
    this.props.codeMirror.setValue(code)
    if (currStep.highlight) {
      currStep.highlight.map(highlight => {
        this.props.highlightLines(highlight.from, highlight.to)
      })
    }
  }

  successPopup = () => {
    this.setState({ isCompleted: true })
  }

  render() {
    var { currUser } = this.props
    const { isCompleted } = this.state

    const currStep = this.state.data.steps ? this.state.data.steps[this.state.step] : null
    const stepHeader = currStep ? currStep.header : ''
    const description = currStep ? currStep.text : ''
    const video = currStep ? currStep.video : ''
    const code = currStep ? currStep.code : ''
    const totalSteps = this.state.data.steps ? this.state.data.steps.length : 0
    const isLastStep = totalSteps > 0 && this.state.step == totalSteps - 1

    return (
      <Segment piled id="mgb-codeActivity" style={{ marginBottom: '1em', height: '11em' }}>
        <Button
          compact
          size="mini"
          color="green"
          onClick={this.stepBack}
          icon="backward"
          content="Back"
          disabled={this.state.step === 0 || isCompleted}
        />

        <Button
          compact
          size="mini"
          color={isLastStep ? 'blue' : 'green'}
          onClick={this.stepNext}
          icon={isLastStep ? 'check' : 'forward'}
          content={isLastStep ? 'Finish' : 'Next'}
          disabled={isCompleted}
        />

        <Button
          compact
          basic
          size="mini"
          color="green"
          onClick={this.resetCode}
          icon="refresh"
          content="Reset code"
        />

        {totalSteps > 0 && (
          <div style={{ float: 'right', color: '#aaa' }}>
            <small>
              Step {1 + this.state.step} of {totalSteps}
            </small>
          </div>
        )}

        {isCompleted && (
          <Message size="small" icon style={{ paddingBottom: 0 }}>
            <Icon color="green" name="check circle" />
            <Message.Content>
              <Message.Header>Activity Completed!</Message.Header>
              <div style={{ padding: '0.5em 0 1em 0' }}>
                <a href="https://hourofcode.com/us/learn">Hour of Code</a>
              </div>
            </Message.Content>
          </Message>
        )}

        {!isCompleted && (
          <div>
            <h5 style={{ margin: '0.5em 0 0.2em 0' }}>{stepHeader}</h5>
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        )}
      </Segment>
    )
  }
}
