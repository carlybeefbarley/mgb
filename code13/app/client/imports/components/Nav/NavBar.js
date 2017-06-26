import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Icon, Popup } from 'semantic-ui-react'
import SystemAlerts from './SystemAlerts'
import NavBarBreadcrumb from './NavBarBreadcrumb'
import WhatsNew from './WhatsNew'

// The NavBar is the 2nd row of the central column of the page
// (i.e. between the left margin and the FlexPanel (if) on the right; below the NavPanel).

// The NavBar contains a breadcrumb bar and some system
// alerts (new version, system-upgrade-in-process etc)

const navBarStyle = {
  padding:  '0.25em',
}

const NavBar = React.createClass({
  propTypes: {
    onToggleHeaders:            PropTypes.func,               // Callback called when header toggle is clicked
    hideHeaders:                PropTypes.bool,               // Whether or not headers are hidden (determines direction of toggle icon)
    params:                     PropTypes.object.isRequired,  // The :params from /imports/routes/index.js via App.js. See there for description of params
    currUser:                   PropTypes.object,             // Currently logged in user.. or null if not logged in.
    user:                       PropTypes.object,             // If there is a :id user id  or :username on the path, this is the user record for it
    location:                   PropTypes.object,             // basically windows.location, but via this.props.location from App.js (from React Router)
    flexPanelWidth:             PropTypes.string.isRequired,  // Typically something like "200px".
    name:                       PropTypes.string,             // Page title to show in NavBar breadcrumb
    currentlyEditingAssetInfo:  PropTypes.object.isRequired   // An object with some info about the currently edited Asset - as defined in App.js' this.state
  },

  handleHideHeadersToggle: function() {
    const { onToggleHeaders } = this.props

    if (onToggleHeaders) onToggleHeaders()
  },

  render() {
    const {
      name,
      user,
      params,
      currUser,
      location,
      hideHeaders,
      flexPanelWidth,
      sysvars,
      currentlyEditingAssetInfo
    } = this.props

    // We special-case a few paths to not show the Breadcrumb for aesthetic reasons
    if (_.includes(['/', '/signup', '/login', '/forgot-password'], location.pathname))
      return null

    return (
      <div style={navBarStyle}>
        <SystemAlerts sysvars={sysvars} />
        <WhatsNew currUser={currUser} asHidingLink={true} />
        <NavBarBreadcrumb
          location={location}
          name={name}
          user={user}
          currUser={currUser}
          params={params}
          currentlyEditingAssetInfo={currentlyEditingAssetInfo} />
        <Popup
          mouseEnterDelay={200}
          trigger={(
            <Icon
              link
              style={{ float: 'right' }}
              size='large'
              onClick={this.handleHideHeadersToggle}
              name={hideHeaders ? 'angle double down' : 'angle double up'} />
          )}
          header='Toggle headers'
          content='Shortcut: [alt-shift-H]' />
      </div>
    )
  }
})

export default NavBar
