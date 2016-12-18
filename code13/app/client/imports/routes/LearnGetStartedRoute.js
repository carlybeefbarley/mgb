import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from './home.css'
import QLink from './QLink'
import getStartedStyle from './GetStarted.css'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus } from '/imports/schemas/skills'
import { startSkillPathTutorial } from '/client/imports/routes/App'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// TODO: Put in the nice hover card animation (like QLink had)

const cardStyle = {
  color: "#2e2e2e"
}

const gsSkills = SkillNodes.getStarted

const gsItems = [
  { node: gsSkills.profile,         mascot: 'arcade_player'   },
  { node: gsSkills.chat,            mascot: 'slimy2'          },
  { node: gsSkills.play,            mascot: 'game_shop'       },
  { node: gsSkills.assetsBasics,    mascot: 'ideaguy'         },
  { node: gsSkills.projects,        mascot: 'team'            },
  { node: gsSkills.assetsAdvanced,  mascot: 'ideaguy'         },
  { node: gsSkills.learn,           mascot: 'MgbLogo'         }
]

// This is the   1 / n    box at the top-right of each skill box
const ProgressLabel = ( { subSkillsComplete, subSkillTotal } ) => (
  <span className="ui label large right floated" style={{float: 'right', opacity: '0.75', backgroundColor: subSkillsComplete >= subSkillTotal ? 'lightgreen' : null}}>
    {subSkillsComplete} / {subSkillTotal}&nbsp;&nbsp;
    <Icon name='check circle' color={subSkillsComplete >= subSkillTotal ? 'green' : null} style={{marginRight: 0}} />
  </span>
)

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
  currUser && (
    <button 
        className="ui active yellow right floated button" 
        style={{margin: '0.5em'}}
        onClick={() => {_handleStartDefaultNextTutorial(currUser, userSkills)} }>
      <Icon name='student' />
      Start next tutorial
    </button>
  )
)

const OfferNextTutorial = ( { skillPath } ) => (
  <button 
    onClick={() => startSkillPathTutorial(skillPath) }
    title={`Start skill tutorial for ${skillPath}`}
    className="ui active yellow right floated small button mgb-show-on-parent-div-hover">
    <Icon name='student' />
    Show Me
  </button>
)

const LearnGetStartedRoute = ( { currUser }, context ) => (
  <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
    <Grid stackable>

      <Grid.Row >
        <Grid.Column>
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            Get Started
            <StartDefaultNextTutorial currUser={currUser} userSkills={context.skills}/>
            <em className="sub header">
              Learn to use this site - set up your profile, play a game, find friends, etc
            </em>
                               
          </Header>
          { currUser && 
            <SkillsMap user={currUser} userSkills={context.skills} ownsProfile={true} onlySkillArea={'getStarted'}/>
          }                   

        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow={2} stackable className="skills">
            { gsItems.map( (area, idx) => {
              const { name, description, key } = area.node.$meta
              const skillStatus = getSkillNodeStatus(currUser, context.skills, key)
              return (
                <div 
                    key={idx} 
                    className="card link animated fadeIn" 
                    style={cardStyle} >

                  <Card.Content style={{borderTop: 'none'}}>
                    <Card.Header as='h2'>
                      {name}
                      <ProgressLabel subSkillsComplete={skillStatus.learnedSkills.length} subSkillTotal={skillStatus.childSkills.length} />
                    </Card.Header>

                    <p style={{fontSize: '1.25em'}}>
                      <img src={`/images/mascots/${area.mascot}.png`} style={{maxWidth: 70, float: 'left', marginRight: 15}} />
                      <span style={{position: 'relative', top: 0}}>{description}.</span>
                     </p>
                     { skillStatus.todoSkills.length > 0 && 
                       <OfferNextTutorial skillPath={key + '.' + skillStatus.todoSkills[0]} />
                     }
                  </Card.Content>
                </div>
              )
            })
          }
         </Card.Group>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
)

LearnGetStartedRoute.contextTypes = {
  skills:       PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnGetStartedRoute