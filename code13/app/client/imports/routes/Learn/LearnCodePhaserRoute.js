import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Segment, Grid, Card, Header } from 'semantic-ui-react'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'


const phaserSkills = SkillNodes.code.js.phaser
const skillItems = []
for (var key in phaserSkills) {
  if (phaserSkills.hasOwnProperty(key) && key != '$meta') {
    let skill = _.cloneDeep(phaserSkills[key]['$meta'])
    skill.idx = key
    skillItems.push( skill )
  }
}

// const LearnCodePhaserRoute = ( { currUser, params }, context ) => { 
const LearnCodePhaserRoute = ( { currUser, params }, context ) => { 
 
  // console.log(context.skills)
  return ( <Segment basic padded className="slim" style={ { margin: '0 auto', minWidth: '680px' } }>
      

       {/*TODO check if currUser logged in*/}
      {/*TODO need to implement count and onclick for subskills*/}
      {/*<SkillsMap user={currUser} 
        userSkills={context.skills} 
        ownsProfile={true} 
        onlySkillArea={'code'}
        />

        <SkillsMap user={currUser} 
        userSkills={context.skills} 
        ownsProfile={true} 
        subSkill={true}
        onlySkillArea={'code.js.phaser'}
        />*/}
      
      
      <Grid stackable>
        <Grid.Row >
          <Header as='h1' size='huge' style={{fontSize: '2.5em'}}>
            Game development concepts
            <em className="sub header">These concept examples use the 'Phaser' game engine for JavaScript. However, the concepts you learn here are very important and will apply to any game engine you use in future.</em>
          </Header>
        </Grid.Row>
        <Grid.Row>
          <Card.Group itemsPerRow={1} stackable className="skills">
            { skillItems.map( (area, idx) => {
              const key = 'code/js/phaser/'+area.idx+'/'+area.idx
              const cStyle = _.cloneDeep(cardStyle)

              if(currUser && context.skills[key]){
                cStyle.backgroundColor = "#e2fcd6"
                // console.log(area.idx)
              }

              return (
              <QLink key={idx} to={area.link} className='card animated fadeIn' style={cStyle} to={area.link}>
                <Card.Content>
                  <p style={descStyle}>
                    <i className={area.icon+" large icon"}></i>
                    <b>{area.name}</b>
                    &nbsp;- {area.description}
                  </p>
                </Card.Content>
              </QLink>
              )})
            }

          </Card.Group>
        </Grid.Row>
      </Grid>
    </Segment>
)}

LearnCodePhaserRoute.contextTypes = {
  skills:   PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodePhaserRoute

// styles

const cardStyle = {
  color: "#2e2e2e"
}

const descStyle = {
  fontSize: "1.25em",
  lineHeight: "1.5em"
}