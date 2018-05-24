import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Header, Icon, Progress } from 'semantic-ui-react'

import { StartDefaultNextTutorial } from '/client/imports/components/Learn'
import { withStores } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'

import { getFriendlyNames } from '/imports/Skills/SkillNodes/SkillNodes'

class JoyrideDisplay extends React.Component {
  static propTypes = {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    showControls: PropTypes.bool,
    showProgressBar: PropTypes.bool,
    showShowMeButton: PropTypes.bool,
  }

  static defaultProps = {
    showControls: true,
    showProgressBar: true,
    showShowMeButton: true,
  }

  static contextTypes = {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  }

  renderTutorialHeader = () => {
    const { joyride } = this.props

    const isStartOrEnd = joyride.isFirstStep() || joyride.isLastStep()
    if (!isStartOrEnd) return null

    const [section, heading, title] = getFriendlyNames(joyride.state.skillPathTutorial)

    return (
      <Header dividing icon color="yellow" textAlign="center" style={{ border: 'none' }}>
        <Icon name="student" />
        <Header.Content>
          {title}
          <Header.Subheader>
            {section} > {heading}
          </Header.Subheader>
        </Header.Content>
      </Header>
    )
  }

  renderTutorialControls = () => {
    const { currUser, joyride, showControls } = this.props
    const { skills } = this.context
    if (!showControls) return null

    const buttons = []

    if (joyride.isLastStep()) {
      buttons.push(<StartDefaultNextTutorial key="start-next" currUser={currUser} userSkills={skills} />)
    } else {
      if (!joyride.isFirstStep()) {
        buttons.push(<Button key="back" basic onClick={joyride.goToPrevStep} content="Back" />)
      }

      buttons.push(
        _.has(joyride.state.step, 'awaitCompletionTag') ? (
          <Button
            key="complete-step"
            disabled
            color="yellow"
            content="Complete the step"
            icon="mouse pointer"
          />
        ) : (
          <Button key="next" color="yellow" onClick={joyride.goToNextStep} content="Next" />
        ),
      )
    }

    return (
      <div style={{ textAlign: 'right ' }}>
        <br />
        {buttons}
      </div>
    )
  }

  renderProgressBar = () => {
    const { joyride, showProgressBar } = this.props
    const { stepIndex } = joyride.state

    const totalSteps = this.getActionableSteps().length + 1

    if (!showProgressBar || stepIndex === 0 || stepIndex === totalSteps) return null

    const style = {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    }

    return (
      <div>
        <br />
        <Progress active style={style} size="tiny" color="yellow" value={stepIndex} total={totalSteps} />
      </div>
    )
  }

  getActionableSteps = () => {
    const { steps } = this.props.joyride.state
    // first step is a title screen
    // last step is a completion screen
    // only show intermediate steps
    return steps.slice(1, steps.length - 1)
  }

  renderInstructions = () => {
    const { joyride: { state: { step } } } = this.props

    if (!step) return null

    return (
      <div>
        {step && <Header size="small">{step.title}</Header>}
        <p dangerouslySetInnerHTML={{ __html: _.get(step, 'text') }} />
      </div>
    )
  }

  render() {
    const { style } = this.props

    return (
      <div style={style}>
        {this.renderTutorialHeader()}
        {this.renderInstructions()}

        {this.renderTutorialControls()}
        {this.renderProgressBar()}
      </div>
    )
  }
}

export default withStores({ joyride: joyrideStore })(JoyrideDisplay)
