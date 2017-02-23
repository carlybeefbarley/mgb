import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import {
  Divider,
  Grid,
  List,
  Header,
  Segment,
} from 'semantic-ui-react'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'

import { startSkillPathTutorial } from '/client/imports/routes/App'

const phaserSkills = SkillNodes.code.js.phaser
const skillItems = []
for (var key in phaserSkills) {
  if (phaserSkills.hasOwnProperty( key ) && key != '$meta') {
    let skill = _.cloneDeep( phaserSkills[key]['$meta'] )
    skill.idx = key
    skillItems.push( skill )
  }
}

const handleClick = (e, skillPath) => {
  // console.log('handleClick', e.button)
  // if(e.buttons == 4 || e.button == 1)
  //     // start tutorial in a new tab
  //   else
  //     // start tutorial in the same tab

  startSkillPathTutorial( skillPath )
}

const LearnCodePhaserRoute = ({ currUser, params }, context) => {
  return (
    <Grid container columns='1'>
      <Divider hidden />
      { /*TODO check if currUser logged in*/ }
      {/*TODO need to implement count and onclick for subskills*/
      }
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
       />*/
      }
      <Grid.Column>
        {/*<div onClick={() => startSkillPathTutorial('getStarted.nonCodeGame.createGraphic') }>Start code tutorial</div>*/}
        <Header as='h1'>
          Game development concepts
          <Header.Subheader>
            These concept examples use the 'Phaser' game engine for JavaScript.
            However, the concepts you learn here are very important and will apply to any game engine you use in future.
          </Header.Subheader>
        </Header>
      </Grid.Column>
      <Grid.Column>
        <Segment padded piled>
          <List size='large' relaxed='very' link className="skills">
            { skillItems.map( (area, idx) => {
              let skillPath = 'code/js/phaser/' + area.idx + '/' + area.idx
              const isComplete = currUser && !_.isEmpty( context.skills[skillPath] )

              return (
                <List.Item
                  as={isComplete ? 'div' : 'a'}
                  key={idx}
                  disabled={isComplete}
                  onClick={ (e) => handleClick( e, skillPath ) }
                  icon={isComplete ? { name: 'checkmark', color: 'green' } : area.icon}
                  header={isComplete ? null : area.name}
                  content={isComplete ? area.name : area.description}
                />
              )
            } ) }
          </List>
        </Segment>
      </Grid.Column>
    </Grid>
  )
}

LearnCodePhaserRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodePhaserRoute
