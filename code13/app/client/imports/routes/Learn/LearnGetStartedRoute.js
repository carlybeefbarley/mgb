import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import '../home.css'
import QLink from '../QLink'
import '../GetStarted.css'
import { Button, Divider, Grid, Header, Icon, Label, Message } from 'semantic-ui-react'
import SkillLinkCard from '/client/imports/components/Learn/SkillLinkCard'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillNodes, { countMaxUserSkills, getFriendlyName } from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus, countCurrentUserSkills } from '/imports/schemas/skills'
import { startSkillPathTutorial } from '/client/imports/routes/App'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const OfferLoginTutorial = () => (
  <QLink to="/signup">
    <Button floated="right">
      <Icon name="sign in" />
      Log In or Sign Up
    </Button>
  </QLink>
)

const _gsSkillNodeName = 'getStarted'
const _maxGsSkillCount = countMaxUserSkills(_gsSkillNodeName + '.')
const gsSkills = SkillNodes[_gsSkillNodeName] // shorthand
const gsItems = [
  { node: gsSkills.profile, mascot: 'arcade_player' },
  { node: gsSkills.chat, mascot: 'slimy2' },
  { node: gsSkills.play, mascot: 'whale' },
  { node: gsSkills.assetsBasics, mascot: 'ideaguy' },
  { node: gsSkills.projects, mascot: 'team' },
  { node: gsSkills.nonCodeGame, mascot: 'duck' },
  //  { node: gsSkills.codeGame, mascot: 'bigguy' }
  // { node: gsSkills.assetsAdvanced,  mascot: 'ideaguy'      },
  // { node: gsSkills.learn,           mascot: 'MgbLogo'      }
]

// This is the   1 / n    box at the top-right of each skill box
const ProgressLabel = ({ subSkillsComplete, subSkillTotal }) => (
  <Label attached="top right">
    {subSkillsComplete} / {subSkillTotal}
  </Label>
)

ProgressLabel.propTypes = {
  subSkillsComplete: PropTypes.number,
  subSkillTotal: PropTypes.number,
}

const _calcDefaultNextTutorialSkillPath = (currUser, userSkills) => {
  var skillPath = null
  for (var i = 0; i < gsItems.length; i += 1) {
    const area = gsItems[i]
    const { key } = area.node.$meta
    const skillStatus = getSkillNodeStatus(currUser, userSkills, key)
    if (skillStatus.todoSkills.length !== 0) {
      skillPath = key + '.' + skillStatus.todoSkills[0]
      break
    }
  }

  return skillPath
}

const _handleStartDefaultNextTutorial = (currUser, userSkills) => {
  var skillPath = _calcDefaultNextTutorialSkillPath(currUser, userSkills)
  if (skillPath) startSkillPathTutorial(skillPath)
  else console.log('That was the last skill')
}

export const StartDefaultNextTutorial = ({ currUser, userSkills }) => {
  if (!currUser) return <OfferLoginTutorial />
  const nextTutorialSkillPath = _calcDefaultNextTutorialSkillPath(currUser, userSkills)
  if (!nextTutorialSkillPath)
    return (
      <Message
        success
        icon="checkmark box"
        header="Hooray!"
        className="animated tada"
        content="You've completed all the skills in this section.  Start a new tutorial to continue."
      />
    )
  const nextTutName = getFriendlyName(nextTutorialSkillPath)

  return (
    <Button
      className="animated pulse"
      color="yellow"
      active
      size="large"
      fluid
      onClick={() => {
        _handleStartDefaultNextTutorial(currUser, userSkills)
      }}
    >
      <Icon name="student" />
      {nextTutName ? `Next: ${nextTutName}` : 'Start next...'}
    </Button>
  )
}

const LearnGetStartedRoute = ({ currUser, isSuperAdmin }, context) => {
  const numGsSkills = countCurrentUserSkills(context.skills, _gsSkillNodeName + '.') || 0

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
        <ProgressLabel subSkillsComplete={numGsSkills} subSkillTotal={_maxGsSkillCount} />
        <Divider hidden />
        {currUser && (
          <SkillsMap isSuperAdmin={isSuperAdmin} skills={context.skills} skillPaths={['getStarted']} />
        )}

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

        {gsItems.map(area => {
          const skillStatus = getSkillNodeStatus(currUser, context.skills, area.node.$meta.key)
          return (
            <SkillLinkCard
              key={area.node.$meta.name}
              disabled={!currUser}
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

LearnGetStartedRoute.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnGetStartedRoute
