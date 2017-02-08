import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from './home.css'
import QLink from './QLink'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'



const jsItems = [
  {
    icon: 'code',
    link: '/u/!vault/asset/5Bm4R9kJHRAMBv4kD',
    content: 'Draw image',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Manipulate image',
    desc: `x, y, scale, rotate, tint`
  },
  {
    icon: 'code',
    link: '',
    content: 'Input click',
    desc: `Cick on image, click on game`
  },
  {
    icon: 'tasks',
    link: '',
    content: 'Task',
    desc: `Clicking on image make it rotate 45°`
  },
  {
    icon: 'code',
    link: '',
    content: 'Input keyboard',
    desc: `arrow keys, num keys`
  },
  {
    icon: 'code',
    link: '',
    content: 'update() function',
    desc: `example with increasing/descreasing size with arrow up/down`
  },
  {
    icon: 'tasks',
    link: '',
    content: 'Task',
    desc: `Move character around screen using arrow keys`
  },
  {
    icon: 'code',
    link: '',
    content: 'Spritesheet',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Spritesheet events',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Physics basics',
    desc: `velocity, gravity, world bounds...`
  },
  {
    icon: 'code',
    link: '',
    content: 'Physics collide',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Tweens',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Groups',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'OOP',
    desc: `Object oriented programming`
  },
  {
    icon: 'code',
    link: '',
    content: 'Game states',
    desc: ``
  },

]



const LearnCodePhaserRoute = ( { currUser }, context ) => { 
  return (
    <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
      <Grid stackable>
        <Grid.Row >
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            Game development concepts
            <em className="sub header">We use Phaser framework, but these concepts can be applied for every other game engine.</em>
          </Header>
        </Grid.Row>
        <Grid.Row>
          <Card.Group itemsPerRow={1} stackable className="skills">
            
            { jsItems.map( (area, idx) => (


              <QLink key={idx} to={area.link} className='card animated fadeIn' style={cardStyle} to={area.link}>
                <Card.Content>
                  <p style={descStyle}>
                    <i className={area.icon+" large icon"}></i>
                    <b>{area.content}</b>
                    &nbsp;- {area.desc}
                  </p>
                  
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

export default LearnCodePhaserRoute










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