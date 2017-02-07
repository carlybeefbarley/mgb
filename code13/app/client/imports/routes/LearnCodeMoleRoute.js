import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from './home.css'
import QLink from './QLink'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'



const jsItems = [
  {
    icon: 'code',
    link: '/u/!vault/project/2suHPANwpaN5Pjumc',
    content: 'Basic gameplay',
    desc: ``
  },
  {
    icon: 'code',
    link: '/u/!vault/project/aCdy9zz5cJjNog2en',
    content: 'Tweens',
    desc: ``
  },
  {
    icon: 'code',
    link: '/u/!vault/project/NwobuqkQqrcuzzAeo',
    content: 'Timing',
    desc: ``
  },
  {
    icon: 'code',
    link: '/u/!vault/project/PHjAGkS9L4mTTPepE',
    content: 'User interface',
    desc: ``
  },
  {
    icon: 'code',
    link: '/u/!vault/project/JqN5CbdnNFZZqBXnE',
    content: 'OOP',
    desc: `Refactor existing game OOP style.`
  },

]



const LearnCodeMoleRoute = ( { currUser }, context ) => { 
  return (
    <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
      <Grid stackable>
        <Grid.Row >
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            Develop a game from A-Z
            <em className="sub header">Everyone knows "Whack a Mole" game. For coders it is easy to start with this game and add more concepts to it.</em>
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

export default LearnCodeMoleRoute










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