import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'


const jsItems = [
  {
    icon: 'game',
    link: '/u/!vault/project/MNuSHoYkTeT6WHrzE',
    content: 'Rocky Smasher',
    desc: `Tap left/right to cut down the tree`,
    mascot: 'game_rocky',
  },
  {
    icon: 'game',
    link: '/u/!vault/project/7dDxP35DeHTYdMZjt',
    content: 'Digger',
    desc: `Mine precious minerals and sell them in a shop`,
    mascot: 'game_shop',
  },
  {
    icon: 'game',
    link: '/u/!vault/project/cpTvrRFnZzWLhxWgN',
    content: 'Runner',
    desc: `Never ending runner game`,
    mascot: 'game_runner',
  },
  {
    icon: 'game',
    link: '/u/!vault/project/yHxhXxrRLqxsgnBCf',
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



const LearnCodeModifyRoute = ( { currUser }, context ) => {
  return (
    <Grid container columns='1'>
      <Divider hidden />
      <Grid.Column>
        <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
          JavaScript programming basics
          <em className="sub header">Click on item and explore it</em>
        </Header>
      </Grid.Column>
      <Grid.Column>
        <Card.Group itemsPerRow={1} stackable className="skills">
          { jsItems.map( (area, idx) => (
            <QLink key={idx} to={area.link} className='card animated fadeIn' style={cardStyle}>
              <Card.Content>
                <Image floated='left' style={mascotStyle} src={makeCDNLink( `/images/mascots/${area.mascot}.png` )} />
                <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
                <p style={descStyle}>{area.desc}.</p>
              </Card.Content>
            </QLink>
          ) ) }
        </Card.Group>
      </Grid.Column>
    </Grid>
  )
}

export default LearnCodeModifyRoute

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
