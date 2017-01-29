import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Breadcrumb } from 'semantic-ui-react'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column
// on the left and the FlexPanel on the right).

// The NavBarBreadcrumb contains a breadcrumb bar that is generated based on name, user and
// params (assetId, projectId etc)

const _sep = <i className='grey right angle icon' />

const NavBarBreadcrumb = ( { name, user, params, pathLocation } ) => {

  const homeWord = 'MyGameBuilder'

  const assetId = params && params.assetId
  const projectId = params && params.projectId
  const usernameToShow = user ? user.profile.name : params.username

  return (
    <Breadcrumb>
      <QLink to="/" className="section">{homeWord}&nbsp;</QLink>

      { usernameToShow && _sep }
      { usernameToShow && <QLink className="section" to={`/u/${usernameToShow}`}>{usernameToShow}&nbsp;</QLink> }

      { usernameToShow && assetId && _sep }
      { usernameToShow && assetId && <QLink className="section" to={`/u/${usernameToShow}/assets`}>Assets&nbsp;</QLink> }

      { usernameToShow && projectId && _sep }
      { usernameToShow && projectId && <QLink className="section" to={`/u/${usernameToShow}/projects`}>Projects&nbsp;</QLink> }

      { pathLocation && pathLocation.startsWith('/learn/') && _sep }
      { pathLocation && pathLocation.startsWith('/learn/') && <QLink className="section" to={`/learn`}>Learn&nbsp;</QLink> }
      { pathLocation && pathLocation.startsWith('/learn/skills/') && _sep }
      { pathLocation && pathLocation.startsWith('/learn/skills/') && <QLink className="section" to={`/learn/skills`}>Skills&nbsp;</QLink> }

      { name && _sep }
      { name && <span>{name}&nbsp;</span> }
    </Breadcrumb>
  )
}

NavBarBreadcrumb.propTypes = {
  params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
  pathLocation:       PropTypes.string                  // basically windows.location.pathname, but via this.props.location.pathname from App.js
}

export default NavBarBreadcrumb
