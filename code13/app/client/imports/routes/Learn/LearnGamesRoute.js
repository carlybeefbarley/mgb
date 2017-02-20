import React from 'react'
import { showToast } from '/client/imports/routes/App'

import styles from '../home.css'
import QLink from '../QLink'
import getStartedStyle from '../GetStarted.css'
import { Segment, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'
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

const gameItems = [
  { mascot: 'game_runner', icon: 'game', content: 'Runner', desc: 'Simple infinite runner game' },
  { mascot: 'game_shop', icon: 'game', content: 'Digger', desc: 'Simple mining and crafting game...' }
]

const LearnGamesRoute = () => (
  <Segment basic padded className="slim" style={{margin: '0 auto'}}>
    <Grid stackable>

    <Grid.Row >
      <Grid.Column>
        <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
          What kind of game shall we build?
          <em className="sub header">Learn the basics of these game types, and how to add features</em>
        </Header>
      </Grid.Column>
    </Grid.Row>

    <Grid.Row>
      <Grid.Column>
          <Card.Group itemsPerRow={2} stackable className="skills">
          { gameItems.map( (area, idx) => (
            <QLink
              key={idx}
              className="card animated fadeIn"
              style={cardStyle}
                    onClick={(e) => { showToast("Not Yet Implemented.. But it will be ready very SOON!", 'warning'); e.preventDefault() }}
              to={`/learn/skills/NOT_YET_IMPLEMENTED`}>

              <Card.Content>
                <Image floated='left' style={mascotStyle} src={makeCDNLink( `/images/mascots/${area.mascot}.png` )} />
                <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.content}</Header>
                <p style={descStyle}>{area.desc}.</p>
              </Card.Content>
            </QLink>
          ) )
          }
        </Card.Group>
      </Grid.Column>
    </Grid.Row>
  </Grid>
  </Segment>
)

export default LearnGamesRoute
