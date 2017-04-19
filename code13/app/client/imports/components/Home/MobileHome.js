import React, { PropTypes } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'
import ResponsiveComponent from '/client/imports/ResponsiveComponent'

import { Segment, Grid, Header, Image, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

import Login from '/client/imports/routes/Users/LoginRoute.js'

const MobileHome = ({username, userId}) => {
  return <div className="hero">
    <div className="ui container">
      <Image size='large' src={makeCDNLink("/images/mascots/team.png")} />
      {!userId
        ? <Login />
        : <h1>Hello {username} [{userId}]</h1>
      }
    </div>
  </div>
}

export default MobileHome
