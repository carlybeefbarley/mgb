import _ from 'lodash'
import React from 'react'
import { Button, Icon, Message, Segment } from 'semantic-ui-react'
import './editcode.css'
import { withStores } from '/client/imports/hocs'
import { hourOfCodeStore } from '/client/imports/stores'

class HocActivity extends React.Component {
  componentDidMount() {
    this.props.hourOfCodeStore.getActivityData()
  }
  handleReset = () => {
    const { onReset, hourOfCodeStore: { state: { currStep } } } = this.props
    if (!onReset) return

    const code = _.get(currStep, 'code', '')
    onReset(code)
  }

  render() {
    const {
      hourOfCodeStore: {
        state: { totalSteps, isCompleted, isFirstStep, isLastStep, currStep, currStepIndex },
      },
    } = this.props

    if (!currStep)
      return <Segment piled id="mgb-codeActivity" style={{ marginBottom: '1em', height: '11em' }} />

    return (
      <Segment piled id="mgb-codeActivity" style={{ marginBottom: '1em', height: '11em' }}>
        <Button
          compact
          size="mini"
          color="green"
          onClick={hourOfCodeStore.stepBack}
          icon="backward"
          content="Back"
          disabled={isFirstStep || isCompleted}
        />

        <Button
          compact
          size="mini"
          color={isLastStep ? 'blue' : 'green'}
          onClick={hourOfCodeStore.stepNext}
          icon={isLastStep ? 'check' : 'forward'}
          content={isLastStep ? 'Finish' : 'Next'}
          disabled={isCompleted}
        />

        <Button
          compact
          basic
          size="mini"
          color="green"
          onClick={this.handleReset}
          icon="refresh"
          content="Reset code"
        />

        {totalSteps > 0 && (
          <div style={{ float: 'right', color: '#aaa' }}>
            <small>
              Step {1 + currStepIndex} of {totalSteps}
            </small>
          </div>
        )}

        {isCompleted && (
          <Message size="small" icon style={{ paddingBottom: 0 }}>
            <Icon color="green" name="check circle" />
            <Message.Content>
              <Message.Header>Activity Completed!</Message.Header>
              <div style={{ padding: '0.5em 0 1em 0' }}>
                {/* This should link to the HoC certificate upon completion */}
                <a href="https://hourofcode.com/us/learn">Hour of Code™</a>
              </div>
            </Message.Content>
          </Message>
        )}

        {!isCompleted && (
          <div>
            <h5 style={{ margin: '0.5em 0 0.2em 0' }}>{currStep.header}</h5>
            <div dangerouslySetInnerHTML={{ __html: currStep.text }} />
          </div>
        )}
      </Segment>
    )
  }
}

export default withStores({ hourOfCodeStore })(HocActivity)
