import React, { PropTypes, Component } from 'react'
import styles from './home.css'
import QLink from './QLink'
import getStartedStyle from './GetStarted.css'

import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'
import HomeSkillsColumn from '/client/imports/components/Home/HomeSkillsColumn'
import HomeProjectsBeingMadeColumn from '/client/imports/components/Home/HomeProjectsBeingMadeColumn'
import HomeMeetFriendsColumn from '/client/imports/components/Home/HomeMeetFriendsColumn'
import Footer from '/client/imports/components/Footer/Footer'

const _propTypes = {
  currUser:   PropTypes.object      // Can be null/undefined
}

const HomeRoute = props => {
  const { currUser } = props
  const username = currUser ? currUser.profile.name : "guest"
  const userId = currUser ? currUser._id : null

  return (
    <div>
      <div className="hero">
        <div className="ui container">
          <HomeHeroBanner username={username} userId={userId} />
        </div>
      </div>
      <div className="ui container slim" style={{paddingTop: "2.5em", paddingBottom: "2em"}}>
        <div className="ui padded grid stackable">
          <div className="equal width row">
            <div className="ui stackable three column grid">
              <HomeSkillsColumn userId={userId}/>
              <HomeProjectsBeingMadeColumn />
              <HomeMeetFriendsColumn />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

HomeRoute.propTypes = _propTypes
export default HomeRoute
