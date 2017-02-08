import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'

import SkillNodes, { countMaxUserSkills } from '/imports/Skills/SkillNodes/SkillNodes'



const phaserSkills = SkillNodes.code.js.phaser
const skillItems = []
for (var key in phaserSkills) {
  if (phaserSkills.hasOwnProperty(key) && key != '$meta') {
    skillItems.push( phaserSkills[key]['$meta'] )
  }
}


const LearnCodePhaserRoute = ( { currUser }, context ) => { 

  // console.log(skillItems)

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
            
            { skillItems.map( (area, idx) => (


              <QLink key={idx} to={area.link} className='card animated fadeIn' style={cardStyle} to={area.link}>
                <Card.Content>
                  <p style={descStyle}>
                    <i className={area.icon+" large icon"}></i>
                    <b>{area.name}</b>
                    &nbsp;- {area.description}
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