import React from 'react'
import '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Card, Header, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'

const jsItems = [
  {
    icon: 'game',
    link: '/u/!vault/projects/RockySmasher', // '/u/!vault/project/MNuSHoYkTeT6WHrzE',
    content: 'Rocky Smasher',
    desc: `Tap left/right to cut down the tree`,
    mascot: 'game_rocky',
  },
  {
    icon: 'game',
    link: '/u/!vault/projects/digger', // '/u/!vault/project/7dDxP35DeHTYdMZjt',
    content: 'Digger',
    desc: `Mine precious minerals and sell them in a shop`,
    mascot: 'game_shop',
  },
  {
    icon: 'game',
    link: '/u/!vault/projects/Runner', // '/u/!vault/project/cpTvrRFnZzWLhxWgN',
    content: 'Runner',
    desc: `Infinite runner game`,
    mascot: 'game_runner',
  },
  {
    icon: 'game',
    link: '/u/!vault/projects/snake', // '/u/!vault/project/yHxhXxrRLqxsgnBCf',
    content: 'Snake',
    desc: `Classic`,
    mascot: 'game_snake',
  },
  /*
  {
    icon: 'game',
    link: '',
    content: 'Flappy bird',
    desc: ``
  },
  */
]

const LearnCodeModifyRoute = () => (
  <Grid container columns="1">
    <Divider hidden />
    <Grid.Column>
      <Header as="h1">
        Modify Games
        <Header.Subheader>
          Click on item to see the game's project page. You can then try the game, see how it is written and
          even fork + modify it as you wish
        </Header.Subheader>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        {jsItems.map((area, idx) => (
          <QLink key={idx} to={area.link} className="card animated fadeIn" style={cardStyle}>
            <Card.Content>
              <UX.ImageMascot floated="left" style={mascotStyle} mascotName={area.mascot} />
              <Header as="h2" style={headerStyle}>
                <Icon name={area.icon} />&nbsp;{area.content}
              </Header>
              <p style={descStyle}>{area.desc}.</p>
            </Card.Content>
          </QLink>
        ))}
      </Card.Group>
    </Grid.Column>
  </Grid>
)

export default LearnCodeModifyRoute

const cardStyle = {
  color: '#2e2e2e',
}

const mascotStyle = {
  maxWidth: '8em',
  paddingRight: '0.5em',
  marginBottom: '0',
}

const headerStyle = {
  marginTop: '0.15em',
  marginBottom: '0.4em',
}

const descStyle = {
  fontSize: '1.25em',
  lineHeight: '1.5em',
}
