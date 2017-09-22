import React, { PropTypes } from 'react'
import '../home.css'
import './learnRoute.css'
import '../GetStarted.css'
import { Card, Divider, Grid, Header, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import QLink from '../QLink'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'

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

const learnTopLevelItems = [
  {
    mascot: 'MgbLogo',
    icon: 'rocket',
    content: 'Get Started',
    link: '/learn/get-started',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: 'Learn to use this site - set up your profile, play a game, find friends, etc.',
  },
  {
    mascot: 'bigguy',
    icon: 'code',
    content: 'Code',
    link: '/learn/code',
    query: null,
    skillnodeTopLevelTag: 'code',
    desc: 'Learn to code games with JavaScript and Phaser.',
  },
  {
    mascot: 'whale',
    icon: 'student',
    content: 'All Skills',
    link: '/learn/skills',
    query: null,
    skillnodeTopLevelTag: '',
    desc: 'Learn using skills-focused tutorials for coding, art, level design, etc.',
  },
  /*
   {
   mascot: 'game_shop',
   icon: 'game',
   content: 'Make/Mod Games',
   link: '/learn/games',
   query: null,
   desc: 'Learn to make and modify some classic game types.',
   },
   */
]

const LearnRoute = ({ currUser, isSuperAdmin, params }, context) => (
  <Grid container columns="1">
    <Divider hidden />
    <Grid.Column>
      <Header as="h1">
        Learn
        <Header.Subheader>How do you want to learn?</Header.Subheader>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        {learnTopLevelItems.map((area, idx) => (
          <QLink
            key={idx}
            className="card animated fadeIn"
            style={cardStyle}
            to={area.link}
            query={area.query}
          >
            <Card.Content>
              <div
                className="learnThumbnail"
                style={{ backgroundImage: `url("${UX.makeMascotImgLink(area.mascot)}")` }}
              />
              <Header as="h2" style={headerStyle}>
                <Icon name={area.icon} />&nbsp;{area.content}
              </Header>
              <p style={descStyle}>{area.desc}</p>
              {currUser &&
              typeof area.skillnodeTopLevelTag === 'string' && (
                <SkillsMap
                  isSuperAdmin={isSuperAdmin}
                  skills={context.skills}
                  skillPaths={[area.skillnodeTopLevelTag]}
                />
              )}
            </Card.Content>
          </QLink>
        ))}
      </Card.Group>
    </Grid.Column>
    {currUser && (
      <Grid.Column>
        <QLink className="link" style={{ float: 'right' }} to="/learn" query={{ _fp: 'chat.G_MGBHELP_' }}>
          Not sure what to do<Icon name="help" />&emsp;Ask us for help...&nbsp;<Icon name="chat" />
        </QLink>
      </Grid.Column>
    )}
  </Grid>
)

LearnRoute.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnRoute
