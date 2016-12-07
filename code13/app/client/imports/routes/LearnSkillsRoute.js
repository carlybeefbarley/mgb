import React, { PropTypes } from 'react'
import styles from './home.css'
import QLink from './QLink'
import getStartedStyle from './GetStarted.css'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]


const cardStyle = {
  color: "#2e2e2e"
}

const mascotStyle = {
  maxWidth: "8em",
  paddingRight: "0.5em",
  marginBottom: "0"
}

const headerStyle = {
  marginTop: "0.15em",
  marginBottom: "0.4em"
}

const descStyle = {
  fontSize: "1.25em",
  lineHeight: "1.5em"
}


const LearnSkillsRoute = ( { currUser }, context ) => (
  <Segment basic padded className="slim" style={{margin: '0 auto'}}>
    <Grid stackable>

      <Grid.Row >
        <Grid.Column>
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            What kind of skill do you want to learn next?
            <em className="sub header">Game Builders have many kinds of skills</em>
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow={2} stackable className="skills">
            { skillAreaItems.map( (area, idx) => (
                <QLink 
                    key={idx} 
                    className="card animated fadeIn" 
                    style={cardStyle} 
                    to={`/learn/skills/${area.tag}`}>
                  <Card.Content>
                    <Image floated='left' style={mascotStyle} src={`/images/mascots/${area.mascot}.png`} />
                    <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.title}</Header>
                    <p style={descStyle}>{area.desc}.</p>
                    { currUser && 
                      <SkillsMap user={currUser} userSkills={context.skills} ownsProfile={true} onlySkillArea={area.tag}/>
                    }

                  </Card.Content>
                </QLink>
              ))
            }
         </Card.Group>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
)

LearnSkillsRoute.contextTypes = {
  skills:   PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}


export default LearnSkillsRoute