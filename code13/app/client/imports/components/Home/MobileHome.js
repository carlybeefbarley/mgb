import React, { PropTypes } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'
import ResponsiveComponent from '/client/imports/ResponsiveComponent'
import UserHistory from '/client/imports/components/Users/UserHistory'
import SkillTreeRoute from '/client/imports/routes/Users/SkillTreeRoute'
import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'
import { Segment, Grid, Header, Image, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

import Login from '/client/imports/routes/Users/LoginRoute.js'

const MobileHome = ({currUser}) => {
  const username = currUser ? currUser.profile.name : "guest"
  const userId = currUser ? currUser._id : null
  return (
    <div>
    {!userId
      ?
      <div className="hero">
        <div className="ui container">
          <Image size='large' src={makeCDNLink("/images/mascots/team.png")} />
          <Login />
        </div>
      </div>
      :
      <div>
        <div className="hero">
          <div className="ui container">
            <HomeHeroBanner username={username} userId={userId}/>
          </div>
        </div>
        <div className="ui container" style={{paddingTop: "2.5em", paddingBottom: "2em"}}>
          <Grid padded>
            <Grid.Row>
              <UserHistory user={currUser} width={16} borderless={true}/>
              {/***
              <Header as='h2'>
                <QLink to={`/u/${username}/skilltree`}>Skills</QLink>
              </Header>
              <SkillTreeRoute user={currUser}/>
              ***/}
            </Grid.Row>
          </Grid>
        </div>
      </div>
    }
  </div>
  )
}

export default MobileHome
