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


const getStartedItems = [
  {
    mascot: 'game_shop',
    icon: 'game',
    content: 'Make/Mod a Game',
    link: '/getstarted/games',
    query: null,
    desc: 'Our tutorials show you how to make or modify some basic game types'
  }, 
  {
    mascot: 'whale',
    icon: 'university',
    content: 'Practice new Skills',
    link: '/getstarted/skills',
    query: null,
    desc: 'Learn using skills-focussed tutorials for coding, art, level design, etc'
  },
  {
    mascot: 'team',
    icon: 'help',
    content: 'Ask for help',
    link: '/getstarted',
    query: { _fp: 'chat.mgb-help' },
    desc: 'Ask and we shall answer'
  }
]

const GetStartedRoute = () => (
  <Segment basic padded className='slim' style={{margin: '0 auto'}}>
    <Grid stackable style={{marginTop: '3.5em'}} title={_notReallyWorkingYet}>

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

export default GetStartedRoute