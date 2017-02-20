import React from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

const learnCodeItems = [
  {
    mascot: 'bigguy',
    icon: 'code',
    content: 'Basics of programming',
    link: '/learn/code/javascript',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Learn the basics of the Javascript programming language. 
    This covers the core programming language concepts necessary to write a game: variables, arrays, loops, functions, etc.
    If you already know these, you can proceed to the next section instead...`
  },
  {
    mascot: 'phaserLogo',
    icon: 'code',
    content: 'Game development concepts',
    link: '/learn/code/phaser',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `'Phaser' is a very popular game programming library written in JavaScript. These tutorials explain what Phaser is, and how to use it to handle graphics, sound, maps, physics etc in games.`
  },
  {
    mascot: 'mole',
    icon: 'code',
    content: 'Create game A-Z',
    link: '/learn/code/mole',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Use your new game programming knowledge to create a 'Whack-a-Mole' game. 
    The first tutorial shows how to code the minimal 'base' of this game. The next four tutorials show how to add features to the game.`
  },
  {
    mascot: 'arcade_player',
    icon: 'code',
    content: 'Modify games',
    link: '/learn/code/modify',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `There are couple of games to play around with. You can fork (copy) them and then 
    add your own ideas to each game.`
  },
]

const LearnCodeRoute = () => (
  <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
    <Grid stackable>
    <Grid.Row >
      <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
        Learn to code
        <em className="sub header">With JavaScript and Phaser</em>
      </Header>
    </Grid.Row>
    <Grid.Row>
      <Card.Group itemsPerRow={1} stackable className="skills">
          
        { learnCodeItems.map( (area, idx) => (
          <QLink key={idx} className='card animated fadeIn' style={cardStyle} to={area.link} query={area.query}>
            <Card.Content>
              <Image floated='left' style={mascotStyle} src={makeCDNLink( `/images/mascots/${area.mascot}.png` )} />
              <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
              <p style={descStyle}>{area.desc}.</p>
            </Card.Content>
          </QLink>
            ))
          }

      </Card.Group>
    </Grid.Row>
  </Grid>
  </Segment>
)

export default LearnCodeRoute


// styles

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
