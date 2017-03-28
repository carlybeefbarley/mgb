import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import getStartedStyle from '../GetStarted.css'
import { Divider, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

import sty from  './learnRoute.css';

const cardStyle = {
  color: "#2e2e2e"
}

// const mascotStyle = {
//   // maxWidth: "8em",
//   width: "8em",
//   height: "10em",
//   paddingRight: "0.5em",
//   marginBottom: "0",
//   float: "left",
//   marginRight: "1em",
//   backgroundPosition: "center center",
//   backgroundRepeat: "no-repeat",
//   backgroundSize: "contain"
// }

const headerStyle = {
  marginTop: "0.15em",
  marginBottom: "0.4em"
}

const descStyle = {
  fontSize: "1.25em",
  lineHeight: "1.5em"
}

const learnTopLevelItems = [
  {
    mascot: 'MgbLogo',
    icon: 'rocket',
    content: 'Get Started',
    link: '/learn/getstarted',
    query: null,
    skillnodeTopLevelTag: 'getStarted',
    desc: 'Learn to use this site - set up your profile, play a game, find friends, etc'
  },
  {
    mascot: 'bigguy',
    icon: 'code',
    content: 'Programming',
    link: '/learn/code',
    query: null,
    skillnodeTopLevelTag: 'code',
    desc: 'Game programming with JavaScript and Phaser'
  },
  {
    mascot: 'whale',
    icon: 'student',
    content: 'Learn new Skills',
    link: '/learn/skills',
    query: null,
    skillnodeTopLevelTag: '',
    desc: 'Learn using skills-focused tutorials for coding, art, level design, etc'
  },
  /*
   {
   mascot: 'game_shop',
   icon: 'game',
   content: 'Make/Mod Games',
   link: '/learn/games',
   query: null,
   desc: 'Learn to make and modify some classic game types'
   },
   */
  /*
   {
   mascot: 'team',
   icon: 'help',
   content: 'Ask for help',
   link: '/learn',
   query: { _fp: 'chat.G_MGBHELP_' },
   desc: 'Ask and we shall answer'
   },
   */
]

const LearnRoute = ({ currUser, params }, context) => (
  <Grid container columns='1'>
    <Divider hidden />
    <Grid.Column>
      <Header as='h1'>
        How do you want to learn?
        <Header.Subheader>Let's do it your way</Header.Subheader>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        { learnTopLevelItems.map( (area, idx) => {
          const imgStyle = { backgroundImage: "url(" + makeCDNLink( `/images/mascots/${area.mascot}.png` ) + ")" }
          return (
            <QLink key={idx} className='card animated fadeIn' style={cardStyle} to={area.link} query={area.query}>
              <Card.Content>
                <div className="learnThumbnail" style={imgStyle}></div>
                <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
                <p style={descStyle}>{area.desc}.</p>
                { currUser && ('string' == (typeof area.skillnodeTopLevelTag)) && (
                  <SkillsMap skills={context.skills} expandable toggleable skillPaths={[area.skillnodeTopLevelTag]} />
                )}

              </Card.Content>
            </QLink>
        )} )
        }
      </Card.Group>
    </Grid.Column>
    { currUser &&
    <Grid.Column>
      <QLink className='link' style={{ float: 'right' }} to='/learn' query={ { _fp: 'chat.G_MGBHELP_' } }>
        <Icon name='help' />Ask for help...
      </QLink>
    </Grid.Column>
    }
  </Grid>
)

LearnRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnRoute
