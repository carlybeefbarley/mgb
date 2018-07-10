import '/client/imports/routes/home.css'
import '/client/imports/routes/GetStarted.css'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Grid, Header, Image } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'
import UX from '/client/imports/UX'

const mascotColumnStyle = {
  // allow click through, so users can play with the particles :)
  pointerEvents: 'none',
}

const HomeHeroBanner = ({ userId, username }) => (
  <Grid columns="equal" verticalAlign="middle" padded>
    <Grid.Column>
      <Header as="h1" inverted>
        <huge>My Game Builder</huge>
        <Header.Subheader>
          <p>Make Games. Make Friends. Have Fun.</p>
          <p>
            <QLink to="/roadmap">Public BETA</QLink>
          </p>
        </Header.Subheader>
      </Header>
      {userId ? (
        <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
          Welcome back, {username}!
          <br />
          Last time you were working on{' '}
          <em>
            <RecentlyEditedAssetGET userId={userId} />
          </em>.
          <br />
          <Button
            as={QLink}
            to={`/u/${username}/assets`}
            color="green"
            size="huge"
            style={{ marginTop: '1.5em', marginRight: '0.5em' }}
            content="Keep going"
          />
          <Button
            as={QLink}
            to={`/learn`}
            color="green"
            size="huge"
            style={{ marginTop: '0.5em' }}
            content="Learn new skills"
          />
        </p>
      ) : (
        <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
          Learn coding, design, team and biz skills - by making original games with friends
          <br />
          <Button
            as={QLink}
            to={`/learn/get-started`}
            secondary
            size="huge"
            style={{ marginTop: '1.5em', marginRight: '0.5em' }}
            content="Get started"
          />
          <Button
            as={QLink}
            to={`/signup`}
            primary
            size="huge"
            style={{ marginTop: '0.5em' }}
            content="Sign me up"
          />
        </p>
      )}
    </Grid.Column>
    <Grid.Column style={mascotColumnStyle}>
      <Image size="large" centered src={UX.makeMascotImgLink('team')} />
    </Grid.Column>
  </Grid>
)

HomeHeroBanner.propTypes = {
  userId: PropTypes.string, // Can be null/undefined
  username: PropTypes.string.isRequired, // If no-one logged in, should be something like 'guest'
}

export default HomeHeroBanner
