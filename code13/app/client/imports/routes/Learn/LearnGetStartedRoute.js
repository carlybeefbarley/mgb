import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import getStartedStyle from '../GetStarted.css'
import {
  Button,
  Card,
  Dimmer,
  Grid,
  Header,
  Icon,
  Image,
  Label,
  Progress,
} from 'semantic-ui-react'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillNodes, { countMaxUserSkills } from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus, countCurrentUserSkills } from '/imports/schemas/skills'
import { startSkillPathTutorial } from '/client/imports/routes/App'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const BigCheckMark = () => ( <i style={{ float: 'right' }} className='ui green circular checkmark icon' />)

// login/signup is a pseudo-tutorial that exists outside the normal skills databases
// so it is sort-of hard0coded here.
const _loginMascot = 'flyingcat' // no .png suffix required
const _loginDesc = {
  anon: 'You must be logged in to use these tutorials',
  auth: 'You are logged in so your progress will be recorded in your Skills'
}
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
  const isLogInSignUpCompleted = !!currUser

  return (
    <Grid stackable container columns='equal'>
      <Grid.Column>
        <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
          Get Started
          <em className="sub header">
            Learn to use this site - set up your profile, play a game, find friends, etc
            <StartDefaultNextTutorial currUser={currUser} userSkills={context.skills} />
          </em>
        </Header>
        <ProgressLabel subSkillsComplete={numGsSkills} subSkillTotal={_maxGsSkillCount} />
        { currUser && (
          <div style={{ clear: 'both' }}>
            <SkillsMap user={currUser} userSkills={context.skills} ownsProfile={true} onlySkillArea={'getStarted'} />
          </div>
        )}

        { /* Add a pseudo-card for login/signup */ }
        <Card
          as='div'
          fluid
          onClick={isLogInSignUpCompleted ? null : startSkillPathTutorial }
          className={isLogInSignUpCompleted ? '' : 'link'}>
          <Card.Content>
            <Header as='h2' color={isLogInSignUpCompleted ? 'grey' : null}>
              <Dimmer.Dimmable
                dimmed={isLogInSignUpCompleted}
                dimmer={{ active: isLogInSignUpCompleted, inverted: true, content: <BigCheckMark /> }}
                as={Image}
                src={makeCDNLink( `/images/mascots/${_loginMascot}.png` )}
              />
              <Header.Content>
                Log In / Sign Up
                {!isLogInSignUpCompleted && (
                  <Header.Subheader>
                    {_loginDesc[currUser ? 'auth' : 'anon']}.
                  </Header.Subheader>
                )}
              </Header.Content>
            </Header>

            { !isLogInSignUpCompleted && (
              <Icon name='chevron right' color='grey' size='large' style={continueIconStyle} />
            )}
          </Card.Content>
        </Card>

        { gsItems.map( (area, idx) => {
          const { name, description, key } = area.node.$meta
          const skillStatus = getSkillNodeStatus( currUser, context.skills, key )
          const skillPath = key + '.' + skillStatus.todoSkills[0]
          const isSkillCompleted = (skillStatus.todoSkills.length == 0)
          const mascotStyle = {
            filter: !currUser && idx != 0 ? "grayscale(100%)" : ''
          }

          return (
            <Card
              as='div'
              fluid
              key={idx}
              className={isSkillCompleted ? '' : 'link'}
              onClick={isSkillCompleted ? null : () => startSkillPathTutorial( skillPath ) }
            >
              <Card.Content>
                <Grid columns='equal' padded>
                  <Grid.Column>
                    <Header as='h2' color={isSkillCompleted ? 'grey' : null}>
                      <Dimmer.Dimmable
                        dimmed={isSkillCompleted}
                        dimmer={{ active: isSkillCompleted, inverted: true, content: <BigCheckMark /> }}
                        as={Image}
                        src={makeCDNLink( `/images/mascots/${area.mascot}.png` )}
                        style={mascotStyle}
                      />
                      <Header.Content>
                        {name}
                        {!isSkillCompleted && <Header.Subheader>{description}.</Header.Subheader>}
                      </Header.Content>
                    </Header>
                  </Grid.Column>
                  {!isSkillCompleted && (
                    <Grid.Column width={4} verticalAlign='middle' textAlign='right'>
                      <div style={{ fontSize: '2em', color: '#999' }}>
                        {skillStatus.learnedSkills.length} / {skillStatus.childSkills.length}
                        {!isSkillCompleted && (
                          <Icon
                            name='angle right'
                            color='grey'
                            size='large'
                            disabled
                            // align to text
                            style={{ marginBottom: '0.18em' }}
                          />
                        )}
                      </div>
                    </Grid.Column>
                  )}
                </Grid>
              </Card.Content>

              {skillStatus.learnedSkills.length > 0 && (
                <Progress
                  size='tiny'
                  autoSuccess
                  label='ratio'
                  value={skillStatus.learnedSkills.length}
                  total={skillStatus.childSkills.length}
                  active={skillStatus.learnedSkills.length > 0}
                />
              )}
            </Card>
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
