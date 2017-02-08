import React from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Segment, Grid, Card, Header } from 'semantic-ui-react'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'

const phaserSkills = SkillNodes.code.js.phaser
const skillItems = []
for (var key in phaserSkills) {
  if (phaserSkills.hasOwnProperty(key) && key != '$meta') {
    skillItems.push( phaserSkills[key]['$meta'] )
  }
}

const LearnCodePhaserRoute = ( ) => (
  <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
    <Grid stackable>
      <Grid.Row >
        <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
          Game development concepts
          <em className="sub header">These concept examples use the 'Phaser' game engine for JavaScript. However, the concepts you learn here are very important and will apply to any game engine you use in future.</em>
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

export default LearnCodePhaserRoute

// styles

const cardStyle = {
  color: "#2e2e2e"
}

const descStyle = {
  fontSize: "1.25em",
  lineHeight: "1.5em"
}