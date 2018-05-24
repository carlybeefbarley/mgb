import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Divider, Grid, Header } from 'semantic-ui-react'

import '../GetStarted.css'
import '../home.css'
import { ProgressLabel, SkillLinkCard } from '/client/imports/components/Learn'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import { withStores } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'
import QLink from '/client/imports/routes/QLink'
import { countMaxUserSkills, getStartedItems } from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus, countCurrentUserSkills } from '/imports/schemas/skills'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

class LearnGetStartedRoute extends Component {
  static contextTypes = {
    /** skills for currently loggedIn user (not necessarily the props.user user) */
    skills: PropTypes.object,
  }

  render() {
    const { currUser, isSuperAdmin, joyride } = this.props
    const { skills } = this.context
    const completedSkills = countCurrentUserSkills(skills, 'getStarted')
    const totalSkills = countMaxUserSkills('getStarted')

    return (
      <Grid container columns="1">
        <Divider hidden />
        <Grid.Column>
          <Header as="h1" style={{ fontSize: '2.5em' }}>
            Get Started
            <Header.Subheader>
              Learn to use this site - set up your profile, play a game, find friends, etc
            </Header.Subheader>
          </Header>
          <ProgressLabel subSkillsComplete={completedSkills} subSkillTotal={totalSkills} />
          <Divider hidden />
          {currUser && <SkillsMap isSuperAdmin={isSuperAdmin} skills={skills} skillPaths={['getStarted']} />}

          {/*
           Add a pseudo-card for login/signup
           login/signup is a pseudo-tutorial that exists outside the normal skills databases
           so it is sort-of hard0coded here
           since it has no skill tutorials to revisit, we hide it on completion
          */}
          {!currUser && (
            <SkillLinkCard
              to="/signup"
              mascot="flyingcat"
              name="Log In / Sign Up"
              description="You must be logged in to use these tutorials"
            />
          )}

          {getStartedItems.map(area => {
            const skillStatus = getSkillNodeStatus(currUser, skills, area.node.$meta.key)
            return (
              <SkillLinkCard
                key={area.node.$meta.name}
                disabled={!currUser || joyride.state.isRunning}
                mascot={area.mascot}
                name={area.node.$meta.name}
                description={area.node.$meta.description}
                childSkills={skillStatus.childSkills}
                learnedSkills={skillStatus.learnedSkills}
                todoSkills={skillStatus.todoSkills}
                skillPath={area.node.$meta.key}
              />
            )
          })}
          <div>
            After this, how about <QLink to="/learn/code">learning to write code-based games?</QLink>
          </div>
        </Grid.Column>
      </Grid>
    )
  }
}

export default withStores({ joyride: joyrideStore })(LearnGetStartedRoute)
