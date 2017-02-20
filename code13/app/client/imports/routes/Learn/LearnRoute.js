import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import getStartedStyle from '../GetStarted.css'
import { Divider, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

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
      <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
        How do you want to learn?
        <em className="sub header">Let's do it your way</em>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        { learnTopLevelItems.map( (area, idx) => (
          <QLink key={idx} className='card animated fadeIn' style={cardStyle} to={area.link} query={area.query}>
            <Card.Content>
              <Image floated='left' style={mascotStyle} src={makeCDNLink( `/images/mascots/${area.mascot}.png` )} />
              <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
              <p style={descStyle}>{area.desc}.</p>
              { currUser && ('string' == (typeof area.skillnodeTopLevelTag)) &&
              <div style={{ clear: 'both' }}>
                <SkillsMap
                  user={currUser}
                  userSkills={context.skills}
                  ownsProfile={true}
                  onlySkillArea={area.skillnodeTopLevelTag}
                  initialZoomLevel={area.skillnodeTopLevelTag === '' ? 0 : 1} />
              </div>
              }

            </Card.Content>
          </QLink>
        ) )
        }
      </Card.Group>
    </Grid.Column>
    { currUser &&
    <Grid.Column>
      <QLink style={{ color: "#333" }} to='/learn' query={ { _fp: 'chat.G_MGBHELP_' } }>
        <i className="help icon"></i> Ask for help - Ask and we shall answer
      </QLink>
    </Grid.Column>
    }
  </Grid>
)

LearnRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnRoute
