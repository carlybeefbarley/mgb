import React, { PropTypes } from 'react'
import { Button, Divider, Grid, Header, Image, Segment} from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'
import ResponsiveComponent from '/client/imports/ResponsiveComponent'

import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

const HomeHeroBanner = ( { userId, username, respIsRuleActive } ) => {
  const isSmall = respIsRuleActive('small')
  const isMobile = respIsRuleActive('mobile')

  if (respIsRuleActive('impossible'))
    return <Header as='h1' size='large' style={{fontSize: '1em', margin: '0.75em 0em 0.75em 0em'}} content='MGB'/>

  return (
    <Segment basic vertical>
    <Divider hidden/>
      <Grid.Row>
        {isMobile ?
          <Grid.Column style={{textAlign: 'center'}}>
            <Image size='medium' floated='right' src={makeCDNLink("/images/mascots/team.png")} />
            <Header as='h1' style={{fontSize: '2.5em'}}>
              My Game Builder
              <Header.Subheader style={{fontSize: '16px'}}>
                Make Games. Make Friends. Have Fun.
              </Header.Subheader>
            </Header>
        { userId ?
          <div style={{fontSize: '1.5em', maxWidth: '390px'}}>
            Welcome back, {username}!
            <span style={{}}>
              <br />
              Last time you were working on <br />
              <em><RecentlyEditedAssetGET userId={userId} /></em>.
            </span>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
              <QLink to={`/u/${username}/assets`}>
                <Button color='teal' size='medium' content='Keep going' />
              </QLink>
              <QLink to={`/learn`}>
                <Button color='teal' size='medium' content='Learn new skills' />
              </QLink>
            </div>
          </div>
          :
          <p style={{ fontSize: '1em', maxWidth: '390px' }}>
            Learn coding, design, team and biz skills - by making original games with friends
            <br />
            <QLink to={`/learn/getstarted`}>
              <Button color='teal' size='huge' style={{ marginTop: '1.5em', marginRight: '0.5em' }} content='Get started' />
            </QLink>
            {/*
            <QLink to={`/userBashes`}>
              <Button color='teal' size='huge' style={{ marginTop: '1.5em', marginRight: '0.5em' }} content='User Bashes' />
            </QLink>
            */}
            <QLink to={`/signup`}>
              <Button color='yellow' size='huge' style={{ marginTop: '0.5em'}} content='Sign me up' />
            </QLink>
          </p>
        }
        </Grid.Column>
        :
        <Grid.Column>
          <Image size='large' floated='right' src={makeCDNLink("/images/mascots/team.png")} />
          <Header as='h1'>
            <big>My Game Builder</big>
            <Header.Subheader>
              <p>
                Make Games. Make Friends. Have Fun.
              </p>
              <p>
                <QLink to='/roadmap'>Public BETA</QLink>
              </p>
            </Header.Subheader>
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
              <Button color='teal' size='huge' style={{ marginTop: '1.5em', marginRight: '0.5em'  }} content='Keep going' />
            </QLink>
            <QLink to={`/learn`}>
              <Button color='teal' size='huge' style={{ marginTop: '0.5em'}} content='Learn new skills' />
            </QLink>
          </p>
          :
          <p style={{ fontSize: '1.5em', maxWidth: '450px' }}>
            Learn coding, design, team and biz skills - by making original games with friends
            <br />
            <QLink to={`/learn/getstarted`}>
              <Button color='teal' size='huge' style={{ marginTop: '1.5em', marginRight: '0.5em' }} content='Get started' />
            </QLink>
            {/*
            <QLink to={`/userBashes`}>
              <Button color='teal' size='huge' style={{ marginTop: '1.5em', marginRight: '0.5em' }} content='User Bashes' />
            </QLink>
            */}
            <QLink to={`/signup`}>
              <Button color='yellow' size='huge' style={{ marginTop: '0.5em'}} content='Sign me up' />
            </QLink>
          </p>
        }
        </Grid.Column>
        }
      </Grid.Row>
    </Segment>
  )
}

HomeHeroBanner.propTypes = {
  userId:   PropTypes.string,             // Can be null/undefined
  username: PropTypes.string.isRequired   // If no-one logged in, should be something like 'guest'
}


HomeHeroBanner.responsiveRules = {  // Note that this could also be a function that returns this kind of object
  'impossible': {
    minWidth: 0,
    maxWidth: 40
  },
  'small': {
    minWidth: 0,
    maxWidth: 400
  },
  'mobile': {
    minWidth: 0,
    maxWidth: 420
  }
}
export default ResponsiveComponent(HomeHeroBanner)
