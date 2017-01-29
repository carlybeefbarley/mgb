import React, { PropTypes } from 'react'
import { Segment } from 'semantic-ui-react'
import SystemAlerts from './SystemAlerts'
import NavBarBreadcrumb from './NavBarBreadcrumb'
import WhatsNew from './WhatsNew'

// The NavBar is the top row of the central column of the page
// (i.e. between the left margin and the FlexPanel on the right).

// The NavBar contains a breadcrumb bar and some system 
// alerts (new version, system-upgrade-in-process etc)

const NavBar = ({ name, user, params, currUser, pathLocation, flexPanelWidth, fFixedTopNavBar, sysvars }) => {

  if (pathLocation === '/' && !fFixedTopNavBar)
    return null

  return (
    <Segment
      basic
      size='mini'
      style={{
        position: fFixedTopNavBar ? 'fixed' : 'static',
        top:      fFixedTopNavBar ? '0px' : undefined,
        left:     0,
        right:    flexPanelWidth,
        overflow: 'hidden',
        margin:   0,
        padding: '0.5em',
      }}>
      <SystemAlerts sysvars={sysvars} />
      <WhatsNew currUser={currUser} asHidingLink={true} />
      <NavBarBreadcrumb pathLocation={pathLocation} name={name} user={user} params={params} />
    </Segment>
  )
}

NavBar.propTypes = {
  params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  currUser:           PropTypes.object,                 // Currently logged in user.. or null if not logged in.
  user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  pathLocation:       PropTypes.string,                 // basically windows.location.pathname, but via this.props.location.pathname from App.js
  flexPanelWidth:     PropTypes.string.isRequired,      // Typically something like "200px".
  name:               PropTypes.string                  // Page title to show in NavBar breadcrumb
}

export default NavBar
