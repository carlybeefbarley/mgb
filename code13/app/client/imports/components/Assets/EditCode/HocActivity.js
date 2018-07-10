import _ from 'lodash'
import React from 'react'
import { Button, Header, Icon, Message, Segment } from 'semantic-ui-react'
import './editcode.css'
import { withStores } from '/client/imports/hocs'
import { hourOfCodeStore } from '/client/imports/stores'

class HocActivity extends React.Component {
  constructor() {
    super()
  }

  componentWillMount() {
    const { hourOfCodeStore, assetId } = this.props
    hourOfCodeStore.getCurrentAssetId(assetId)
  }

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
      openVideoModal,
      hourOfCodeStore: {
        state: {
          steps,
          totalSteps,
          completedSteps,
          isFirstStep,
          isLastStep,
          currStep,
          currStepId,
          currStepIndex,
        },
      },
    } = this.props

    const segmentStyle = { flex: '0 0 auto', marginBottom: '1em' }

    if (!steps || !currStep) return <Segment piled id="mgb-codeActivity" style={segmentStyle} />

    return (
      <Segment piled id="mgb-codeActivity" style={segmentStyle}>
        <Button
          compact
          size="mini"
          color="green"
          onClick={hourOfCodeStore.stepBack}
          icon="backward"
          content="Back"
          disabled={isFirstStep}
        />

        <Button
          compact
          size="mini"
          color={isLastStep ? 'blue' : 'green'}
          onClick={hourOfCodeStore.stepNext}
          icon={isLastStep ? 'check' : 'forward'}
          content={isLastStep ? 'Finished' : 'Next'}
          disabled={!_.includes(completedSteps, currStepId) || isLastStep}
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

        {currStep &&
        currStep.videoId && (
          <Button compact basic size="mini" color="green" onClick={openVideoModal} icon="video" />
        )}

        {totalSteps > 0 && (
          <div style={{ float: 'right', color: '#aaa' }}>
            <small>
              Step {1 + currStepIndex} of {totalSteps}
            </small>
          </div>
        )}

        {isLastStep && completedSteps[currStepIndex] ? (
          <Message size="small" icon style={{ paddingBottom: 0 }}>
            <Icon color="green" name="check circle" />
            <Message.Content>
              <Message.Header>Congratulations! You completed the activity!</Message.Header>
            </Message.Content>
          </Message>
        ) : (
          <div>
            <h4 style={{ margin: '0.5em 0 0.2em 0' }}>{currStep.header}</h4>
            <div dangerouslySetInnerHTML={{ __html: currStep.text }} />
          </div>
        )}
      </Segment>
    )
  }
}

export default withStores({ hourOfCodeStore })(HocActivity)
