import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Popup } from 'semantic-ui-react'
import SystemAlerts from './SystemAlerts'
import NavBarBreadcrumb from './NavBarBreadcrumb'
import WhatsNew from './WhatsNew'
import RelatedAssets from './RelatedAssets'

// The NavBar is the 2nd row of the central column of the page
// (i.e. between the left margin and the FlexPanel (if) on the right; below the NavPanel).

// The NavBar contains a breadcrumb bar and some system
// alerts (new version, system-upgrade-in-process etc)

const NavBar = React.createClass({
  propTypes: {
    onToggleHeaders: PropTypes.func, // Callback called when header toggle is clicked
    hideHeaders: PropTypes.bool, // Whether or not headers are hidden (determines direction of toggle icon)
    params: PropTypes.object.isRequired, // The :params from /imports/routes/index.js via App.js. See there for description of params
    currUser: PropTypes.object, // Currently logged in user.. or null if not logged in.
    user: PropTypes.object, // If there is a :id user id  or :username on the path, this is the user record for it
    location: PropTypes.object, // basically windows.location, but via this.props.location from App.js (from React Router)
    name: PropTypes.string, // Page title to show in NavBar breadcrumb
    currentlyEditingAssetInfo: PropTypes.object.isRequired, // An object with some info about the currently edited Asset - as defined in App.js' this.state
  },

  handleHideHeadersToggle() {
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
      sysvars,
      currentlyEditingAssetInfo,
    } = this.props

    // We special-case a few paths to not show the Breadcrumb for aesthetic reasons
    const doNotDisplay = [
      /^\/$/,
      /^\/legal/,
      /^\/login/,
      /^\/signup/,
      /^\/forgot-password/,
      /^\/reset-password/,
    ].some(regExp => regExp.test(location.pathname))

    if (doNotDisplay) return null

    const navBarStyle = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      // do not flex
      flex: '0 0 auto',
      padding: '0.5em',
      marginBottom: hideHeaders ? '2rem' : '0',
      background: '#fff',
      boxShadow: `0 ${hideHeaders ? '2px 6px' : '1px 4px'} rgba(0, 0, 0, 0.2)`,
      zIndex: 1,
    }

    return (
      <div style={navBarStyle}>
        {/*<RelatedAssets*/}
          {/*location={location}*/}
          {/*user={user}*/}
          {/*currUser={currUser}*/}
          {/*params={params}*/}
          {/*currentlyEditingAssetInfo={currentlyEditingAssetInfo}*/}
        {/*/>*/}
        <SystemAlerts sysvars={sysvars} />
        <NavBarBreadcrumb
          location={location}
          name={name}
          user={user}
          currUser={currUser}
          params={params}
          currentlyEditingAssetInfo={currentlyEditingAssetInfo}
        />
        <WhatsNew currUser={currUser} />
        <Popup
          mouseEnterDelay={200}
          trigger={
            <Icon
              link
              style={{ margin: '0 0 0 auto' }}
              size="large"
              onClick={this.handleHideHeadersToggle}
              name={hideHeaders ? 'angle double down' : 'angle double up'}
            />
          }
          header="Toggle headers"
          content="Shortcut: [Alt + Shift + H]"
        />
      </div>
    )
  },
})

export default NavBar
