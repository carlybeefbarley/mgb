import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import getStartedStyle from '../GetStarted.css'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillNodes, { countMaxUserSkills } from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus, countCurrentUserSkills } from '/imports/schemas/skills'
import { startSkillPathTutorial } from '/client/imports/routes/App'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const BigCheckMark = () => ( <i style={{ float: 'right'}} className='ui big green checkmark box icon' />)

const cardStyles = {
  card:    { color: '#2e2e2e' },
  content: { borderTop: 'none' },
  para:    { fontSize: '1.25em' },
  mascot:  { maxWidth: '70px', float: 'left', marginRight: '15px' },
  desc:    { position: 'relative', top: 0 },
  button:  { margin: '0.5em 0px 0.5em 0.5em' }
}


// login/signup is a pseudo-tutorial that exists outside the normal skills databases
// so it is sort-of hard0coded here.
const _loginMascot = 'flyingcat' // no .png suffix required
const _loginDesc = { 
  anon: 'You must be logged in to use these tutorials', 
  auth: 'You are logged in so your progress will be recorded in your Skills' 
}
const OfferLoginTutorial = () => (
  <QLink to='/signup'>
    <button 
        className="ui active yellow right floated button" 
        style={cardStyles.button}>
      <Icon name='sign in' />
      Log In or Sign Up
    </button>
    </QLink>
)

const _gsSkillNodeName = 'getStarted'
const _maxGsSkillCount = 1 + countMaxUserSkills(_gsSkillNodeName + '.')     // The 1+ is because of the special pseudo-skill of login/signup
const gsSkills = SkillNodes[_gsSkillNodeName]    // shorthand
const gsItems = [
  { node: gsSkills.profile,         mascot: 'arcade_player'   },
  { node: gsSkills.chat,            mascot: 'slimy2'          },
  { node: gsSkills.play,            mascot: 'whale'           },
  { node: gsSkills.assetsBasics,    mascot: 'ideaguy'         },
  { node: gsSkills.projects,        mascot: 'team'            },
  { node: gsSkills.nonCodeGame,     mascot: 'duck'            },
  { node: gsSkills.codeGame,        mascot: 'bigguy'          }
  // { node: gsSkills.assetsAdvanced,  mascot: 'ideaguy'      },
  // { node: gsSkills.learn,           mascot: 'MgbLogo'      }
]

// This is the   1 / n    box at the top-right of each skill box
const ProgressLabel = ( { subSkillsComplete, subSkillTotal } ) => (
  <span className="ui label large right floated" style={{float: 'right', opacity: '0.75', backgroundColor: subSkillsComplete >= subSkillTotal ? 'lightgreen' : null}}>
    {subSkillsComplete} / {subSkillTotal}&nbsp;&nbsp;
    <Icon name='check circle' color={subSkillsComplete >= subSkillTotal ? 'green' : null} style={{marginRight: 0}} />
  </span>
)

ProgressLabel.propTypes = {
  subSkillsComplete:  PropTypes.number,
  subSkillTotal:      PropTypes.number
}

const _handleStartDefaultNextTutorial = (currUser, userSkills) => {
  var skillPath = null
  _.each(gsItems, (area) => {
    const { key } = area.node.$meta
    const skillStatus = getSkillNodeStatus(currUser, userSkills, key)
    if (skillStatus.todoSkills.length !== 0)
    {
      skillPath = key + '.' + skillStatus.todoSkills[0]
      return false
    }
  })
  if (skillPath)
    startSkillPathTutorial(skillPath)
}

export const StartDefaultNextTutorial = ( { currUser, userSkills } ) => (
  !currUser ? <OfferLoginTutorial /> : (
    <button 
        className="ui active yellow right floated button" 
        style={cardStyles.button}
        onClick={() => {_handleStartDefaultNextTutorial(currUser, userSkills)} }>
      <Icon name='student' />
      Start next...
    </button>
  )
)

const OfferNextTutorial = ( { skillPath } ) => (
  <button 
    onClick={() => startSkillPathTutorial(skillPath) }
    title={`Start skill tutorial for ${skillPath}`}
    className="ui active yellow right floated small button mgb-show-on-parent-div-hover">
    <Icon name='student' />
    Start next...
  </button>
)

const LearnGetStartedRoute = ( { currUser }, context ) => { 
  const numGsSkills = (countCurrentUserSkills(context.skills, _gsSkillNodeName + '.') || 0) + (currUser ? 1 : 0)
  return (
    <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
      <Grid stackable>
        <Grid.Row >
          <Grid.Column>
            <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
              Get Started
              <ProgressLabel subSkillsComplete={numGsSkills} subSkillTotal={_maxGsSkillCount} />
              <em className="sub header">
                Learn to use this site - set up your profile, play a game, find friends, etc
                <StartDefaultNextTutorial currUser={currUser} userSkills={context.skills}/>                             
              </em>
            </Header>
            { currUser && 
              <div style={{clear: 'both'}}>
                <SkillsMap user={currUser} userSkills={context.skills} ownsProfile={true} onlySkillArea={'getStarted'}/>
              </div>
            } 
          </Grid.Column>
        </Grid.Row>

        <Grid.Row centered>
          <Grid.Column width={12}>
            <Card.Group itemsPerRow={1} className="skills">
              { /* Add a pseudo-card for login/signup */ }
                  <Card 
                      color={currUser ? 'green' : null}
                      className={ (currUser ? 'disabled ' : '') + 'link animated fadeIn' }
                      style={cardStyles.card} >

                    <Card.Content style={cardStyles.content}>
                      <Card.Header as='h2'>
                        Log In / Sign Up
                        <ProgressLabel subSkillsComplete={currUser ? 1 : 0} subSkillTotal={1} />
                      </Card.Header>

                      <p style={cardStyles.para}>
                        <img src={makeCDNLink(`/images/mascots/${_loginMascot}.png`)} style={cardStyles.mascot} />
                        <span style={cardStyles.desc}>{_loginDesc[currUser ? 'auth' : 'anon']}.</span>
                      </p>
                      { !currUser ?  <OfferLoginTutorial /> : <BigCheckMark /> }
                    </Card.Content>
                  </Card>            
              
              { gsItems.map( (area, idx) => {
                const { name, description, key } = area.node.$meta
                const skillStatus = getSkillNodeStatus(currUser, context.skills, key)
                const isCompleted = (skillStatus.todoSkills.length == 0)
                const mascotStyle = _.cloneDeep( cardStyles.mascot )
                if(!currUser && idx != 0){
                  mascotStyle.filter = "grayscale(100%)"
                }
                return (
                  <Card 
                      key={idx} 
                      color={isCompleted ? 'green' : null}
                      className={ (currUser ? '' : 'disabled ') + 'link animated fadeIn' }
                      style={cardStyles.card} >

                    <Card.Content style={cardStyles.content}>
                      <Card.Header as='h2'>
                        {name}
                        <ProgressLabel subSkillsComplete={skillStatus.learnedSkills.length} subSkillTotal={skillStatus.childSkills.length} />
                      </Card.Header>

                      <p style={cardStyles.para}>
                        <img src={makeCDNLink(`/images/mascots/${area.mascot}.png`)} style={mascotStyle} />
                        <span style={cardStyles.desc}>{description}.</span>
                      </p>
                      { isCompleted ? <BigCheckMark /> : 
                          <OfferNextTutorial skillPath={key + '.' + skillStatus.todoSkills[0]} /> 
                      }
                    </Card.Content>
                  </Card>
                )
              })
            }
          </Card.Group>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  )
}

LearnGetStartedRoute.contextTypes = {
  skills:       PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnGetStartedRoute
