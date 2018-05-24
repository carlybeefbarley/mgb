import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import { getNextSkillPath, getFriendlyName, getNode } from '/imports/Skills/SkillNodes/SkillNodes'
import { withStores } from '/client/imports/hocs'
import { StartJsGamesRoute } from '/client/imports/routes/Learn/LearnCodeRouteItem'
import { joyrideStore } from '/client/imports/stores'

import DashboardAction from './DashboardAction'

class SkillAction extends React.Component {
  static contextTypes = {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  }

  static propTypes = {
    currUser: PropTypes.object,
  }

  state = {
    nextSkillPath: null,
    nextSkillName: '',
    allSkillsCompleted: false,
  }

  componentDidMount = () => {
    const nextSkillPath = getNextSkillPath(this.props.currUser, this.context.skills)
    const nextSkill = getNode(nextSkillPath)
    let nextSkillName = ''
    if (nextSkill && nextSkill.$meta) {
      nextSkillName = nextSkill.$meta.name || getFriendlyName(nextSkill.$meta.key)
    }
    this.setState({ nextSkillPath, nextSkillName })
  }

  startNextSkill = () => {
    const { currUser, joyride } = this.props
    const { nextSkillPath } = this.state

    if (!nextSkillPath) {
      return console.warn("Didn't found next skillPath")
    }

    // code tutorial
    if (_.startsWith(nextSkillPath, 'code.')) {
      const skillPathArr = nextSkillPath.split('.')
      const l = skillPathArr.length
      const section = skillPathArr[l - 2]
      const subSection = skillPathArr[l - 1]

      StartJsGamesRoute(section, subSection, currUser, false, getNode(nextSkillPath))
    } else {
      // joyride tutorial
      joyride.startSkillPathTutorial(nextSkillPath)
    }
  }

  render() {
    const { allSkillsCompleted, nextSkillName } = this.state

    if (allSkillsCompleted) return null

    return (
      <DashboardAction
        color="yellow"
        icon="student"
        header="Tutorials"
        subheader="Get intro into MyGameBuilder and start learning how to create games!"
        buttonContent="Start"
        buttonExtra={nextSkillName && `Next: ${nextSkillName}`}
        onButtonClick={this.startNextSkill}
      />
    )
  }
}

export default withStores({ joyride: joyrideStore })(SkillAction)
