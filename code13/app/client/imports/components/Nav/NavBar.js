import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Segment } from 'semantic-ui-react'
import SystemAlerts from './SystemAlerts'
import NavBarBreadcrumb from './NavBarBreadcrumb'
import WhatsNew from './WhatsNew'

// The NavBar is the 2nd row of the central column of the page
// (i.e. between the left margin and the FlexPanel (if) on the right; below the NavPanel).

// The NavBar contains a breadcrumb bar and some system 
// alerts (new version, system-upgrade-in-process etc)

const NavBar = (
  {
    name,
    user,
    params,
    currUser,
    pathLocation,
    flexPanelWidth,
    sysvars,
    currentlyEditingAssetKind,
    currentlyEditingAssetCanEdit
  } ) => {

  if (_.includes(['/', '/signup', '/login','/forgot-password'], pathLocation))
    return null

  return (
    <Segment
      basic
      size='mini'
      style={{
        position: 'static',
        left:     0,
        right:    flexPanelWidth,
        overflow: 'hidden',
        margin:   0,
        padding: '0.5em',
      }}>
      <SystemAlerts sysvars={sysvars} />
      <WhatsNew currUser={currUser} asHidingLink={true} />
      <NavBarBreadcrumb pathLocation={pathLocation} name={name} user={user} params={params} currentlyEditingAssetKind={currentlyEditingAssetKind} currentlyEditingAssetCanEdit={currentlyEditingAssetCanEdit} />
    </Segment>
  )
}

NavBar.propTypes = {
  params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  currUser:           PropTypes.object,                 // Currently logged in user.. or null if not logged in.
  user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  pathLocation:       PropTypes.string,                 // basically windows.location.pathname, but via this.props.location.pathname from App.js
  flexPanelWidth:     PropTypes.string.isRequired,      // Typically something like "200px".
  name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
  currentlyEditingAssetKind: PropTypes.string,          // null or a string which is one of AssetKindKeys - based on currently edited asset
  currentlyEditingAssetCanEdit: PropTypes.bool          // true or false - true if CanEdit
}

export default NavBar
