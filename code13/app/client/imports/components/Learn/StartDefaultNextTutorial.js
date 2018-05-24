import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon, Message, Transition } from 'semantic-ui-react'

import { withStores } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'
import QLink from '/client/imports/routes/QLink'
import { getFriendlyName, getStartedItems } from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus } from '/imports/schemas/skills'

class StartDefaultNextTutorial extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    userSkills: PropTypes.object,
  }

  calcDefaultNextTutorialSkillPath = (currUser, userSkills) => {
    let skillPath = null
    for (let i = 0; i < getStartedItems.length; i += 1) {
      const area = getStartedItems[i]
      const { key } = area.node.$meta
      const skillStatus = getSkillNodeStatus(currUser, userSkills, key)
      if (skillStatus.todoSkills.length !== 0) {
        skillPath = key + '.' + skillStatus.todoSkills[0]
        break
      }
    }

    return skillPath
  }

  handleStartDefaultNextTutorial = () => {
    const { currUser, joyride, userSkills } = this.props
    console.log('StartDefaultNextTutorial.handleStartDefaultNextTutorial', joyride)

    const skillPath = this.calcDefaultNextTutorialSkillPath(currUser, userSkills)
    if (skillPath) joyride.startSkillPathTutorial(skillPath)
    else console.log('That was the last skill')
  }

  render() {
    const { currUser, userSkills } = this.props

    if (!currUser) {
      return (
        <Button as={QLink} to="/signup" floated="right">
          <Icon name="sign in" />
          Log In or Sign Up
        </Button>
      )
    }
    const nextTutorialSkillPath = this.calcDefaultNextTutorialSkillPath(currUser, userSkills)

    if (!nextTutorialSkillPath) {
      return (
        <Message
          success
          icon="checkmark box"
          header="Hooray!"
          className="animated tada"
          content="You've completed all the skills in this section.  Start a new tutorial to continue."
        />
      )
    }

    const nextTutName = getFriendlyName(nextTutorialSkillPath)

    return (
      <Transition transitionOnMount animation="pulse">
        <Button color="yellow" fluid onClick={this.handleStartDefaultNextTutorial}>
          <Icon name="student" />
          {nextTutName ? `Next: ${nextTutName}` : 'Start next...'}
        </Button>
      </Transition>
    )
  }
}

export default withStores({ joyride: joyrideStore })(StartDefaultNextTutorial)
