import React, { PropTypes } from 'react'
import { Button, Grid, Header, Image, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'

import UX from '/client/imports/UX'

const HomeHeroBanner = ({ userId, username }) =>
  <Segment basic style={{ minWidth: '140px' }}>
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <Image size="large" floated="right" src={UX.makeMascotImgLink('team')} />
          <Header as="h1" inverted>
            <big>My Game Builder</big>
            <Header.Subheader>
              <p>Make Games. Make Friends. Have Fun.</p>
              <p>
                <QLink to="/roadmap">Public BETA</QLink>
              </p>
            </Header.Subheader>
          </Header>
          {userId
            ? <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
                Welcome back, {username}!
                <br />
                Last time you were working
                <br />
                on{' '}
                <em>
                  <RecentlyEditedAssetGET userId={userId} />
                </em>.
                <br />
                <QLink to={`/u/${username}/assets`}>
                  <Button
                    color="green"
                    size="huge"
                    style={{ marginTop: '1.5em', marginRight: '0.5em' }}
                    content="Keep going"
                  />
                </QLink>
                <QLink to={`/learn`}>
                  <Button
                    color="green"
                    size="huge"
                    style={{ marginTop: '0.5em' }}
                    content="Learn new skills"
                  />
                </QLink>
              </p>
            : <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
                Learn coding, design, team and biz skills - by making original games with friends
                <br />
                <QLink to={`/learn/getstarted`}>
                  <Button
                    color="green"
                    size="huge"
                    style={{ marginTop: '1.5em', marginRight: '0.5em' }}
                    content="Get started"
                  />
                </QLink>
                {/*
            <QLink to={`/userBashes`}>
              <Button color='green' size='huge' style={{ marginTop: '1.5em', marginRight: '0.5em' }} content='User Bashes' />
            </QLink>
            */}
                <QLink to={`/signup`}>
                  <Button color="yellow" size="huge" style={{ marginTop: '0.5em' }} content="Sign me up" />
                </QLink>
              </p>}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>

HomeHeroBanner.propTypes = {
  userId: PropTypes.string, // Can be null/undefined
  username: PropTypes.string.isRequired, // If no-one logged in, should be something like 'guest'
}

export default HomeHeroBanner
