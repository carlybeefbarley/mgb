import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Header, List, Segment } from 'semantic-ui-react'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'


const jsGamesSkills = SkillNodes.code.js.games
const skillItems = []
for (var key in jsGamesSkills) {
  if (jsGamesSkills.hasOwnProperty( key ) && key != '$meta') {
    let skill = _.cloneDeep( jsGamesSkills[key]['$meta'] )
    skill.idx = key
    skillItems.push( skill )
  }
}

// console.log(_jsGamesSkillsNode)

// const jsItems = [
//   {
//     icon: 'code',
//     link: '/u/!vault/project/2suHPANwpaN5Pjumc',
//     content: 'Basic gameplay',
//     desc: ``
//   },
//   {
//     icon: 'code',
//     link: '/u/!vault/project/aCdy9zz5cJjNog2en',
//     content: 'Tweens',
//     desc: ``
//   },
//   {
//     icon: 'code',
//     link: '/u/!vault/project/NwobuqkQqrcuzzAeo',
//     content: 'Timing',
//     desc: ``
//   },
//   {
//     icon: 'code',
//     link: '/u/!vault/project/PHjAGkS9L4mTTPepE',
//     content: 'User interface',
//     desc: ``
//   },
//   {
//     icon: 'code',
//     link: '/u/!vault/project/JqN5CbdnNFZZqBXnE',
//     content: 'OOP',
//     desc: `Refactor existing game OOP style.`
//   },
// ]

const handleClick = (e, skillPath) => {

}

const LearnJsGamesRoute = ({ currUser }, context) => {
  return (
    <Grid container columns='1'>
      <Divider hidden />
      <Grid.Column>
        <Header as='h1'>
          Develop a game from A-Z
          <Header.Subheader>
            Everyone knows "Whack a Mole" game.
            For coders it is easy to start with this game and add more concepts to it.
          </Header.Subheader>
        </Header>
      </Grid.Column>
      <Grid.Column>
        <Segment padded piled>
          <List size='large' relaxed='very' link className="skills">
            { skillItems.map( (area, idx) => {
              let skillPath = 'code/js/games/' + area.idx + '/' + area.idx
              const isComplete = currUser && !_.isEmpty( context.skills[skillPath] )

              return (
                <List.Item
                  key={idx}
                  as={'a'} // isComplete ? 'div' : 'a'}
                  //disabled={isComplete}
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

LearnJsGamesRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnJsGamesRoute
