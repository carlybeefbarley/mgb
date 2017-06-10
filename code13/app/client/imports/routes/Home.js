import React, { PropTypes } from 'react'
import styles from './home.css'
import getStartedStyle from './GetStarted.css'
import ResponsiveComponent from '/client/imports/ResponsiveComponent'

import { Container, Divider, Grid, Segment } from 'semantic-ui-react'
import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'
import HomeSkillsColumn from '/client/imports/components/Home/HomeSkillsColumn'
import HomeProjectsBeingMadeColumn from '/client/imports/components/Home/HomeProjectsBeingMadeColumn'
import HomeMeetFriendsColumn from '/client/imports/components/Home/HomeMeetFriendsColumn'
import Footer from '/client/imports/components/Footer/Footer'
import { detectIE } from '/client/imports/components/Controls/BrowserCompat'

const _propTypes = {
  currUser:   PropTypes.object      // Can be null/undefined
}

const _isIE = detectIE()

const HomeRoute = ( { currUser, respData, respIsRuleActive  } ) => {
  const username = currUser ? currUser.profile.name : "guest"
  const userId = currUser ? currUser._id : null
  const columns = respData.columns || 3

  return (
    <div>
      { _isIE &&
      <div style={{ color: 'red', padding: '2px 8px' }}>
        Internet Explorer is not supported. Please use another browser
      </div>
      }
      <div className="hero">
        <Container>
          <HomeHeroBanner username={username} userId={userId} />
        </Container>
        <Divider section hidden />
      </div>
      <Container>
        <Segment basic padded>
          { !respIsRuleActive( 'noColumns' ) &&
          <Grid columns={columns} stretched style={{ clear: 'both' }}>
            <HomeSkillsColumn userId={userId} />
            <HomeProjectsBeingMadeColumn />
            <HomeMeetFriendsColumn />
          </Grid>
          }
          <Divider hidden />
        </Segment>
      </Container>

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
