import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Button, Icon, Message, Segment } from 'semantic-ui-react'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'

import './editcode.css'

const _smallTopMarginSty = { style: { marginTop: '0.5em' } }

export default class HoCActivity extends React.Component {
  static propTypes = {
    codeMirror: PropTypes.object,
    highlightLines: PropTypes.func,
    assetId: PropTypes.string,
    style: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      step: 0, // curent step of tutorial
      isCompleted: false, // indicator if current tutorial is completed and we need to show modal
      isTaskSubmitted: false, // indicator if task is submitted and we need to show modal
      data: {}, // will get from CDN
    }

    /*
    mgbAjax(`/api/asset/code/!vault/`, (err, listStr) => {
      if (err) console.log('error', err)
      else this.setState({ data: JSON.parse(listStr) })
    })
    */
  }

  stepNext = () => {
    const step = this.state.step + 1
    if (step < this.state.data.steps.length) {
      this.setState({ step })
      this.resetCode(step)
    } else this.successPopup()
  }

  stepBack = () => {
    if (this.state.step > 0) {
      const step = this.state.step - 1
      this.setState({ step })
      this.resetCode(step)
    }
  }

  resetCode = step => {
    step = _.isInteger(step) ? step : this.state.step
    const currStep = this.state.data.steps[step]
    const code = currStep.code
    this.props.codeMirror.setValue(code)
    this.props.quickSave()
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
    const description = this.state.data.steps
      ? this.state.data.steps[this.state.step].text
      : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    const totalSteps = this.state.data.steps ? this.state.data.steps.length : 0
    const isLastStep = totalSteps > 0 && this.state.step == totalSteps - 1
    const { isCompleted } = this.state

    return (
      <Segment piled id="mgb-codeActivity" style={this.props.style}>
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

        {isCompleted && (
          <Message size="small" icon style={{ paddingBottom: 0 }}>
            <Icon color="green" name="check circle" />
            <Message.Content>
              <Message.Header>Completed...</Message.Header>
              <Button
                positive
                compact
                size="mini"
                content=""
                icon="up arrow"
                labelPosition="right"
                {..._smallTopMarginSty}
              />
            </Message.Content>
          </Message>
        )}

        {totalSteps > 0 && (
          <div style={{ color: '#aaa' }}>
            <small>
              Step #{1 + this.state.step} of {totalSteps}
            </small>
          </div>
        )}

        <div style={{ marginTop: '0.5em' }} dangerouslySetInnerHTML={{ __html: description }} />
      </Segment>
    )
  }
}
