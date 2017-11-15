import PropTypes from 'prop-types'
import React from 'react'
import '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Card, Header, Icon } from 'semantic-ui-react'
import MascotImage from '/client/imports/components/MascotImage/MascotImage'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'

const learnCodeItems = [
  {
    mascot: 'bigguy',
    icon: 'code',
    content: 'Intro to Coding',
    link: '/learn/code/intro',
    skillPath: 'code.js.intro',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Learn the basics of the Javascript programming language.
    This covers the core programming language concepts necessary to write a game: variables, arrays, loops, functions, etc.
    If you already know these, you can proceed to the next section instead...`,
  },
  {
    mascot: 'phaserLogo',
    icon: 'code',
    content: 'Game Development Concepts',
    link: '/learn/code/phaser',
    skillPath: 'code.js.phaser',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `Phaser is a popular game engine written in JavaScript. Learn to handle graphics, sound, maps, physics, and more.`,
  },
  {
    mascot: 'mole',
    icon: 'code',
    content: 'Make Games',
    link: '/learn/code/games',
    skillPath: 'code.js.games',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `These walkthroughs will show you how to create a game using your new Phaser game-dev skills.`,
  },
  {
    mascot: 'arcade_player',
    icon: 'code',
    content: 'Modify Games',
    link: '/learn/code/modify',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: `We provide some working games that you can fork (copy) and change as you wish.`,
  },
  {
    mascot: 'javascript-logo',
    icon: 'code',
    content: 'Advanced Coding',
    link: '/learn/code/advanced',
    skillPath: 'code.js.advanced',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: [
      'Learn the advanced part of Javascript.',
      "This covers concepts you don't necessarily need to develop a basic game.",
      'But it is always good to build your developer expertise.',
    ].join(' '),
  },
]

const LearnCodeRoute = ({ currUser, isSuperAdmin, params }, context) => (
  <Grid container columns="1">
    <Divider hidden />
    <Grid.Column>
      <Header as="h1">
        Code
        <Header.Subheader>Learn to code games with JavaScript and Phaser.</Header.Subheader>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        {learnCodeItems.map((area, idx) => (
          <QLink
            key={idx}
            className="card animated fadeIn"
            style={cardStyle}
            to={area.link}
            query={area.query}
          >
            <Card.Content>
              <MascotImage name={area.mascot} />
              <Header as="h2" style={headerStyle}>
                <Icon name={area.icon} />&nbsp;{area.content}
              </Header>
              <p style={descStyle}>{area.desc}</p>
              {area.skillPath &&
              currUser && (
                <SkillsMap
                  isSuperAdmin={isSuperAdmin}
                  skills={context.skills}
                  skillPaths={[area.skillPath]}
                />
              )}
            </Card.Content>
          </QLink>
        ))}
      </Card.Group>
    </Grid.Column>
  </Grid>
)

LearnCodeRoute.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodeRoute

const cardStyle = {
  color: '#2e2e2e',
}

const headerStyle = {
  marginTop: '0.15em',
  marginBottom: '0.4em',
}

const descStyle = {
  fontSize: '1.25em',
  lineHeight: '1.5em',
}
