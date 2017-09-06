import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Message, Header, Button, Icon } from 'semantic-ui-react'

import { getNextSkillPath, getFriendlyName, getNode } from '/imports/Skills/SkillNodes/SkillNodes'
import { startSkillPathTutorial } from '/client/imports/routes/App'
import { StartJsGamesRoute } from '/client/imports/routes/Learn/LearnCodeRouteItem'

export default class SkillAction extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
  }

  constructor(props, context) {
    super(props)
    this.userSkills = context.skills
    this.state = {
      nextSkillPath: null,
      nextSkillName: '',
      allSkillsCompleted: false,
    }
  }

  componentDidMount = () => {
    const nextSkillPath = getNextSkillPath(this.props.currUser, this.userSkills)
    const nextSkill = getNode(nextSkillPath)
    let nextSkillName = ''
    if (nextSkill && nextSkill.$meta) {
      nextSkillName = nextSkill.$meta.name || getFriendlyName(nextSkill.$meta.key)
    }
    this.setState({ nextSkillPath: nextSkillPath, nextSkillName: nextSkillName })
  }

  startNextSkill = () => {
    if (this.state.nextSkillPath) {
      // code tutorial
      if (_.startsWith(this.state.nextSkillPath, 'code.')) {
        const skillPathArr = this.state.nextSkillPath.split('.')
        const l = skillPathArr.length
        const section = skillPathArr[l - 2]
        const subSection = skillPathArr[l - 1]
        StartJsGamesRoute(section, subSection, this.props.currUser)
      } else
        // joyride tutorial
        startSkillPathTutorial(this.state.nextSkillPath)
    } else console.warn("Didn't found next skillPath")
  }

  render() {
    if (this.state.allSkillsCompleted) return null

    return (
      <Message info icon>
        <Icon name="student" />
        <Message.Content>
          <Header>MGB tutorials</Header>
          <p>
            <Button primary onClick={this.startNextSkill} floated="right" content="Start tutorial" />Get intro
            into MyGameBuilder and start learning how to create games!
          </p>
          {this.state.nextSkillPath && (
            <p>
              <b>Next skill</b>: {this.state.nextSkillName}
            </p>
          )}
        </Message.Content>
      </Message>
    )
  }
}

SkillAction.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}
