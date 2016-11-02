import React from 'react'
import styles from './home.css'
import QLink from './QLink'
import getStartedStyle from './GetStarted.css'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'

const _notReallyWorkingYet = "These don't do anything yet.. but soon will! sorry for the psych!"

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

const gameItems = [
  { mascot: 'game_runner',    icon: 'game',    content: 'Runner',   desc: 'Simple infinite runner game' },
  { mascot: 'game_shop',  icon: 'game',    content: 'Digger',   desc: 'Simple mining and crafting game...' }
]

const GetStartedGamesRoute = () => (
  <Segment basic padded className="slim" style={{margin: '0 auto'}}>
    <Grid stackable style={{marginTop: '3.5em'}} title={_notReallyWorkingYet}>

      <Grid.Row >
        <Grid.Column>
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            What kind of game shall we build?
            <em className="sub header">Learn the basics of these game types, and how to add features</em>
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow={2} stackable className="skills">
            { gameItems.map( (area, idx) => (
                <QLink 
                    key={idx} 
                    className="card animated fadeIn" 
                    style={cardStyle} 
                    onClick={(e) => { alert("Not Yet Implemented"); e.preventDefault() }}
                    to={`/getstarted/skills/NOT_YET_IMPLEMENTED`}>

                  <Card.Content>
                    <Image floated='left' style={mascotStyle} src={`/images/mascots/${area.mascot}.png`} />
                    <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
                    <p style={descStyle}>{area.desc}.</p>
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

export default GetStartedGamesRoute