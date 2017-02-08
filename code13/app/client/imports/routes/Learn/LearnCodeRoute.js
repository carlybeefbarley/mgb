import _ from 'lodash'
import React, { PropTypes } from 'react'
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
    desc: `Learn basics of Javascript programming language. 
    You will be introduced to termins like variable, array, loop, function.
    If you already know it you can proceed to game development basics.`
  },
  {
    mascot: 'phaserLogo',
    icon: 'code',
    content: 'Game development concepts',
    link: '/learn/code/phaser',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `We are using Phaser framework for creating games 
    because it is super fast to learn and easy to use.`
  },
  {
    mascot: 'mole',
    icon: 'code',
    content: 'Create game A-Z',
    link: '/learn/code/mole',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `You will be joining your knowledges game concepts and creating an existing game. 
    We choose easy one to start - Whack a Mole. After first version you will create four more 
    and get to know about how to start and finish game, 
    creating user interface, states and other important things.`
  },
  {
    mascot: 'arcade_player',
    icon: 'code',
    content: 'Modify games',
    link: '/learn/code/modify',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `There are couple of games to play around with. Please fork then and try 
    to upgrade in your own way!`
  },
]



const LearnCodeRoute = ( { currUser }, context ) => { 
  return (
    <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
      <Grid stackable>
        <Grid.Row >
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            Learn to code
            <em className="sub header">With JavaScript and Phaser</em>
          </Header>
        </Grid.Row>
        <Grid.Row>
          <Card.Group itemsPerRow={1} stackable className="skills">
            
            { learnCodeItems.map( (area, idx) => (


              <QLink key={idx} className='card animated fadeIn' style={cardStyle} to={area.link} query={area.query}>
                <Card.Content>
                  <Image floated='left' style={mascotStyle} src={makeCDNLink(`/images/mascots/${area.mascot}.png`)} />
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
}

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