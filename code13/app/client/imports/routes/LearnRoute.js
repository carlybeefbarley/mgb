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


const getStartedItems = [
  {
    mascot: 'MgbLogo',
    icon: 'home',
    content: 'Get Started',
    link: '/learn/getstarted',
    query: null,
    desc: 'Learn to use this site - set up your profile, play a game, find friends, etc'
  }, 
  {
    mascot: 'game_shop',
    icon: 'game',
    content: 'Make/Mod Games',
    link: '/learn/games',
    query: null,
    desc: 'Learn to make and modify some classic game types'
  }, 
  {
    mascot: 'whale',
    icon: 'student',
    content: 'Learn new Skills',
    link: '/learn/skills',
    query: null,
    desc: 'Learn using skills-focused tutorials for coding, art, level design, etc'
  },
  {
    mascot: 'team',
    icon: 'help',
    content: 'Ask for help',
    link: '/learn',
    query: { _fp: 'chat.mgb-help' },
    desc: 'Ask and we shall answer'
  }
]

const LearnRoute = () => (
  <Segment basic padded className='slim' style={{margin: '0 auto'}}>
    <Grid stackable>

      <Grid.Row >
        <Grid.Column>
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            How do you want to learn?
            <em className="sub header">Let's do it your way</em>
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow={2} stackable className="skills">
            { getStartedItems.map( (area, idx) => (
                <QLink key={idx} className='card animated fadeIn' style={cardStyle} to={area.link} query={area.query}>
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

export default LearnRoute