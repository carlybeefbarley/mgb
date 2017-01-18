import React, { PropTypes } from 'react'
import styles from './home.css'
import QLink from './QLink'
import getStartedStyle from './GetStarted.css'
import ResponsiveComponent from '/client/imports/ResponsiveComponent'

import { Grid } from 'semantic-ui-react'
import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'
import HomeSkillsColumn from '/client/imports/components/Home/HomeSkillsColumn'
import HomeProjectsBeingMadeColumn from '/client/imports/components/Home/HomeProjectsBeingMadeColumn'
import HomeMeetFriendsColumn from '/client/imports/components/Home/HomeMeetFriendsColumn'
import Footer from '/client/imports/components/Footer/Footer'

const _propTypes = {
  currUser:   PropTypes.object      // Can be null/undefined
}

const HomeRoute = ( { currUser, respData, respIsRuleActive  } ) => {
  const username = currUser ? currUser.profile.name : "guest"
  const userId = currUser ? currUser._id : null
  const columns = respData.columns || 3

  return (
    <div>
      <div className="hero">
        <div className="ui container">
          <HomeHeroBanner username={username} userId={userId} />
        </div>
      </div>
      { !respIsRuleActive('noColumns') && 
        <div className="ui container" style={{paddingTop: "2.5em", paddingBottom: "2em"}}>
          <Grid padded>
            <Grid.Row>
              <Grid columns={columns}>
                <HomeSkillsColumn userId={userId}/>
                <HomeProjectsBeingMadeColumn />
                <HomeMeetFriendsColumn />
              </Grid>
            </Grid.Row>
          </Grid>
        </div>
      }
      <Footer />
    </div>
  )
}

HomeRoute.propTypes = _propTypes
HomeRoute.responsiveRules = {  // Note that this could also be a function that returns this kind of object
  'noColumns': {
    minWidth: 0,
    maxWidth: 250,
    respData: { columns: -1 }
  },
  'oneColumn': {
    minWidth: 251,
    maxWidth: 650,
    respData: { columns: 1 }
  },
  'TwoColumn': {  
    minWidth: 651,
    maxWidth: 850,
    respData: { columns: 2 }
  },
  'ThreeColumn': {
    minWidth: 851,
    respData: { columns: 3 }
  }
}
export default ResponsiveComponent(HomeRoute)
