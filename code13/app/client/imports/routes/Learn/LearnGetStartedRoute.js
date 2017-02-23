import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import getStartedStyle from '../GetStarted.css'
import {
  Button,
  Card,
  Dimmer,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Label,
  Progress,
} from 'semantic-ui-react'
import SkillLinkCard from '/client/imports/components/Learn/SkillLinkCard'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillNodes, { countMaxUserSkills } from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus, countCurrentUserSkills } from '/imports/schemas/skills'
import { startSkillPathTutorial } from '/client/imports/routes/App'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const OfferLoginTutorial = () => (
  <QLink to='/signup'>
    <Button floated='right'>
      <Icon name='sign in' />
      Log In or Sign Up
    </Button>
  </QLink>
)

const _gsSkillNodeName = 'getStarted'
const _maxGsSkillCount = 1 + countMaxUserSkills( _gsSkillNodeName + '.' )     // The 1+ is because of the special
                                                                              // pseudo-skill of login/signup
const gsSkills = SkillNodes[_gsSkillNodeName]    // shorthand
const gsItems = [
  { node: gsSkills.profile, mascot: 'arcade_player' },
  { node: gsSkills.chat, mascot: 'slimy2' },
  { node: gsSkills.play, mascot: 'whale' },
  { node: gsSkills.assetsBasics, mascot: 'ideaguy' },
  { node: gsSkills.projects, mascot: 'team' },
  { node: gsSkills.nonCodeGame, mascot: 'duck' },
  { node: gsSkills.codeGame, mascot: 'bigguy' }
  // { node: gsSkills.assetsAdvanced,  mascot: 'ideaguy'      },
  // { node: gsSkills.learn,           mascot: 'MgbLogo'      }
]

// This is the   1 / n    box at the top-right of each skill box
const ProgressLabel = ({ subSkillsComplete, subSkillTotal }) => (
  <Label attached='top right'>
    {subSkillsComplete} / {subSkillTotal}
  </Label>
)

ProgressLabel.propTypes = {
  subSkillsComplete: PropTypes.number,
  subSkillTotal: PropTypes.number
}

const _handleStartDefaultNextTutorial = (currUser, userSkills) => {
  var skillPath = null
  _.each( gsItems, (area) => {
    const { key } = area.node.$meta
    const skillStatus = getSkillNodeStatus( currUser, userSkills, key )
    if (skillStatus.todoSkills.length !== 0) {
      skillPath = key + '.' + skillStatus.todoSkills[0]
      return false
    }
  } )
  if (skillPath)
    startSkillPathTutorial( skillPath )
}

const continueIconStyle = {
  position: 'absolute',
  margin: 'auto',
  height: '1em',
  top: 0,
  right: '1rem',
  bottom: 0,
}

export const StartDefaultNextTutorial = ({ currUser, userSkills }) => (
  !currUser ? <OfferLoginTutorial /> : (
      <button
        className="ui active yellow right floated button"
        onClick={() => {
          _handleStartDefaultNextTutorial( currUser, userSkills )
        } }>
        <Icon name='student' />
        Start next...
      </button>
    )
)

const OfferNextTutorial = ({ skillPath }) => (
  <button
    onClick={() => startSkillPathTutorial( skillPath ) }
    title={`Start skill tutorial for ${skillPath}`}
    className="ui active yellow right floated small button mgb-show-on-parent-div-hover">
    <Icon name='student' />
    Start next...
  </button>
)

const LearnGetStartedRoute = ({ currUser }, context) => {
  const numGsSkills = (countCurrentUserSkills( context.skills, _gsSkillNodeName + '.' ) || 0) + (currUser ? 1 : 0)

  return (
    <Grid container columns='1'>
      <Divider hidden />
      <Grid.Column>
        <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
          Get Started
          <Header.Subheader>
            Learn to use this site - set up your profile, play a game, find friends, etc
            <StartDefaultNextTutorial currUser={currUser} userSkills={context.skills} />
          </Header.Subheader>
        </Header>
        <ProgressLabel subSkillsComplete={numGsSkills} subSkillTotal={_maxGsSkillCount} />
        <Divider hidden />
        { currUser && (
          <div style={{ clear: 'both' }}>
            <SkillsMap user={currUser} userSkills={context.skills} ownsProfile={true} onlySkillArea={'getStarted'} />
          </div>
        )}

        {/*
         Add a pseudo-card for login/signup
         login/signup is a pseudo-tutorial that exists outside the normal skills databases
         so it is sort-of hard0coded here
         */}
        <SkillLinkCard
          to='/signup'
          mascot='flyingcat'
          name='Log In / Sign Up'
          description='You must be logged in to use these tutorials'
          completed={!!currUser}
        />

        { gsItems.map( (area, idx) => {
          const { name, description, key } = area.node.$meta
          const skillStatus = getSkillNodeStatus( currUser, context.skills, key )
          const skillPath = key + '.' + skillStatus.todoSkills[0]

          return (
            <SkillLinkCard
              key={name}
              title={`Start skill tutorial for ${skillPath}`}
              mascot={area.mascot}
              name={name}
              description={description}
              childSkills={skillStatus.childSkills}
              learnedSkills={skillStatus.learnedSkills}
              todoSkills={skillStatus.todoSkills}
              skillPath={skillPath}
            />
          )
        } ) }
      </Grid.Column>
    </Grid>
  )
}

LearnGetStartedRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnGetStartedRoute
