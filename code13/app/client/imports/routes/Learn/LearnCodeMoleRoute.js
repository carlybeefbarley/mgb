import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Header, List, Segment } from 'semantic-ui-react'

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

const LearnCodeMoleRoute = ({ currUser }, context) => {
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
            { jsItems.map( (area, idx) => (
              <List.Item
                key={idx}
                as={QLink}
                to={area.link}
                header={area.content}
                content={area.desc}
                icon={area.icon}
              />
            ) ) }
          </List>
        </Segment>
      </Grid.Column>
    </Grid>
  )
}

export default LearnCodeMoleRoute
