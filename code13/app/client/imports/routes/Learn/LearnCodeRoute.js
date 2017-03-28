import _ from 'lodash'
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
    link: '/learn/code/basics',
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
    desc: `'Phaser' is a very popular game programming library written in JavaScript. These tutorials explain what Phaser is, and demonstrate how to use it to handle graphics, sound, maps, physics etc in your games.`
  },
  {
    mascot: 'mole',
    icon: 'code',
    content: 'Game tutorials',
    link: '/learn/code/games',
    skillPath: 'code.js.games',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `These walkthoughs will show you how to create a game using your new PhaserJS game-dev skills.`
  },
  {
    mascot: 'arcade_player',
    icon: 'code',
    content: 'Modify games',
    link: '/learn/code/modify',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `We provide some working games that you can fork (copy) and change as you wish.`
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
        { learnCodeItems.map( (area, idx) => {
          const imgStyle = _.cloneDeep(mascotStyle)
          imgStyle.backgroundImage = "url(" + makeCDNLink( `/images/mascots/${area.mascot}.png` ) + ")"
          return (
            <QLink key={idx} className='card animated fadeIn' style={cardStyle} to={area.link} query={area.query}>
              <Card.Content>
                <div style={imgStyle}></div>
                <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
                <p style={descStyle}>{area.desc}</p>
                {area.skillPath && currUser && (
                  <SkillsMap skills={context.skills} skillPaths={[area.skillPath]} />
                )}
              </Card.Content>
            </QLink>
        ) } ) }
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
  width: "8em",
  height: "10em",
  float: "left",
  marginRight: "1em",
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
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
