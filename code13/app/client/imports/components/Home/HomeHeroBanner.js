import React, { PropTypes } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import { Segment, Grid, Header, Image, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'

const HomeHeroBanner = ( { userId, username } ) => (
  <Segment basic className="slim" style={{ margin: '0 auto', paddingTop: '2.5em', paddingBottom: '4em' }}>
    <Grid.Row>
      <Grid.Column>
        <Image size='small' floated='right' src="/images/mascots/team.png" style={{width: "480px"}} />
        <Header as='h1' size='huge' style={{fontSize: '3em', marginBottom: '0.5em'}}>
          <span style={{ whiteSpace: 'nowrap'}}>My Game Builder</span>
          <em className="sub header" style={{fontSize: '0.5em'}}>Make Games. Make Friends. Have Fun.</em>
        </Header>
      { userId ?
        <p style={{fontSize: '1.5em', maxWidth: '450px'}}>
          Welcome back, {username}!
          <br />
          Last time you were working
          <br />
          on <em><RecentlyEditedAssetGET userId={userId} /></em>.
          <br />
          <QLink to={`/u/${username}/assets`}>
            <Button color='teal' size='huge' style={{ marginTop: '1.5em' }} content='Keep going' />
          </QLink>
          <QLink to={`/learn`}>
            <Button color='teal' size='huge' style={{ marginTop: '1.5em', marginLeft: '0.5em' }} content='Learn new skills' />
          </QLink>
        </p>
        :
        <p style={{ fontSize: '1.5em', maxWidth: '450px' }}>
          Learn coding, design, team and biz skills - by making original games with friends
          <br />
          <QLink to={`/learn/getstarted`}>
            <Button color='teal' size='huge' style={{ marginTop: '1.5em' }} content='Get started' />
          </QLink>
        </p>
      }
      </Grid.Column>
    </Grid.Row>
  </Segment>
)

HomeHeroBanner.propTypes = {
  userId:   PropTypes.string,       // Can be null/undefined
  username: PropTypes.string        // If no-one logged in, shoudl be something like 'guest'
}

export default HomeHeroBanner