import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'

import SkillsMap from '/client/imports/components/Skills/SkillsMap'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

const learnCodeItems = [
  {
    mascot: 'bigguy',
    icon: 'code',
    content: 'Basics of programming',
    link: '/learn/code/javascript',
    skillPath: 'code.js.basics',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Learn the basics of the Javascript programming language. 
    This covers the core programming language concepts necessary to write a game: variables, arrays, loops, functions, etc.
    If you already know these, you can proceed to the next section instead...`
  },
  {
    mascot: 'phaserLogo',
    icon: 'code',
    content: 'Game development concepts',
    link: '/learn/code/phaser',
    skillPath: 'code.js.phaser',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `'Phaser' is a very popular game programming library written in JavaScript. These tutorials explain what Phaser is, and how to use it to handle graphics, sound, maps, physics etc in games.`
  },
  {
    mascot: 'mole',
    icon: 'code',
    content: 'Game tutorials',
    link: '/learn/code/jsGames',
    skillPath: 'code.js.games',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Use your new game programming knowledge to create a game step by step. 
    The first tutorial shows how to code the minimal 'base' of game. The next tutorials show how to add features.`
  },
  {
    mascot: 'arcade_player',
    icon: 'code',
    content: 'Modify games',
    link: '/learn/code/modify',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `There are couple of games to play around with. You can fork (copy) them and then 
    add your own ideas to each game.`
  },
]

const LearnCodeRoute = ({ currUser, params }, context) => (
  <Grid container columns='1'>
    <Divider hidden />
    <Grid.Column>
      <Header as='h1'>
        Learn Programming
        <Header.Subheader>With JavaScript and Phaser</Header.Subheader>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        { learnCodeItems.map( (area, idx) => (
          <QLink key={idx} className='card animated fadeIn' style={cardStyle} to={area.link} query={area.query}>
            <Card.Content>
              <Image floated='left' style={mascotStyle} src={makeCDNLink( `/images/mascots/${area.mascot}.png` )} />
              <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
              <p style={descStyle}>{area.desc}</p>
              {area.skillPath && currUser && (
                <SkillsMap skills={context.skills} skillPaths={[area.skillPath]} />
              )}
            </Card.Content>
          </QLink>
        ) ) }
      </Card.Group>
    </Grid.Column>
  </Grid>
)

LearnCodeRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodeRoute


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
