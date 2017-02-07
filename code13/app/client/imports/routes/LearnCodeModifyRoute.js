import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from './home.css'
import QLink from './QLink'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'



const jsItems = [
  {
    icon: 'game',
    link: '/u/!vault/project/MNuSHoYkTeT6WHrzE',
    content: 'Rocky Smasher',
    desc: `Tap left/right to cut down the tree`
  },
  {
    icon: 'game',
    link: '/u/!vault/project/7dDxP35DeHTYdMZjt',
    content: 'Digger',
    desc: `Mine precious minerals and sell them in a shop`
  },
  {
    icon: 'game',
    link: '/u/!vault/project/cpTvrRFnZzWLhxWgN',
    content: 'Runner',
    desc: `Never ending runner game`
  },
  {
    icon: 'game',
    link: '/u/!vault/project/yHxhXxrRLqxsgnBCf',
    content: 'Snake',
    desc: `Classic`
  },
  /*
  {
    icon: 'game',
    link: '',
    content: 'Flappy bird',
    desc: ``
  }, 
  */
  

]



const LearnCodeModifyRoute = ( { currUser }, context ) => { 
  return (
    <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
      <Grid stackable>
        <Grid.Row >
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            JavaScript programming basics
            <em className="sub header">Click on item and explore it</em>
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

export default LearnCodeModifyRoute










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