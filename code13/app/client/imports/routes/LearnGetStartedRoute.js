import React from 'react'
import styles from './home.css'
import QLink from './QLink'
import getStartedStyle from './GetStarted.css'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'

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

const gsItems = [
  { mascot: 'arcade_player', icon: 'user',    content: 'Profile',    desc: 'Learn to set up your profile' },
  { mascot: 'slimy2',        icon: 'chat',    content: 'Chat',       desc: 'Learn to use chat and say Hi' },
  { mascot: 'game_shop',     icon: 'game',    content: 'Play',       desc: 'Learn to find games' },
  { mascot: 'ideaguy',       icon: 'pencil',  content: 'Assets',     desc: 'Learn to search for assets' },
  { mascot: 'team',          icon: 'sitemap', content: 'Projects',   desc: 'Learn to make projects and Teams' },
  { mascot: 'MgbLogo',       icon: 'student', content: 'Learn',      desc: 'Learn other ways to learn' },
]

const LearnGetStartedRoute = () => (
  <Segment basic padded className="slim" style={{margin: '0 auto'}}>
    <Grid stackable>

      <Grid.Row >
        <Grid.Column>
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            Get Started
            <em className="sub header">Learn to use this site - set up your profile, play a game, find friends, etc</em>
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow={2} stackable className="skills">
            { gsItems.map( (area, idx) => (
                <QLink 
                    key={idx} 
                    className="card animated fadeIn" 
                    style={cardStyle} 
                    onClick={(e) => { alert("Not Yet Implemented"); e.preventDefault() }}
                    to={`/learn/skills/NOT_YET_IMPLEMENTED`}>

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

export default LearnGetStartedRoute