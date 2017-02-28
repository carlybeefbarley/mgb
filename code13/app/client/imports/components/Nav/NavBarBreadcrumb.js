import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Popup, Breadcrumb, Icon } from 'semantic-ui-react'
import { AssetKinds } from '/imports/schemas/assets'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column
// on the left and the FlexPanel on the right).

// The NavBarBreadcrumb contains a breadcrumb bar that is generated based on name, user and
// params (assetId, projectId etc)

const _sep = <Icon color='grey' name='right angle' />

const ProjectsSection = ( { usernameToShow, projectNames } ) =>
{
  const firstProjectNameForAsset = _.isArray(projectNames) && projectNames[0]
  if (!usernameToShow || !firstProjectNameForAsset)
    return null

  const section = (
    <QLink 
        className="section" 
        to={`/u/${usernameToShow}/assets`} 
        query={{ project: firstProjectNameForAsset }}>
      <Icon name='sitemap' />{firstProjectNameForAsset}&nbsp;
    </QLink>
  )

  if (projectNames.length === 1)
    return (
      <span>
        { _sep }
        { section }
      </span>
    )
  
  // Else it's going to need a Popup to show the other options
  return (
    <span>
      { _sep }
      <Popup
          trigger={section}
          on='hover'
          hoverable
          positioning='bottom center'
          mouseEnterDelay={400} >
        <Popup.Header>
          List Assets in...
        </Popup.Header>
        <Popup.Content>
          { _.map(projectNames, pN => (
              <div key={pN} style={{ margin: '0.25em'}} >
                <QLink 
                  to={`/u/${usernameToShow}/assets`} 
                  query={{ project: pN }}>
                <Icon name='sitemap' />{pN}
              </QLink>
            </div>
            ))
          }
        </Popup.Content>        
      </Popup>
    </span>
  )
}

const NavBarBreadcrumb = ( {
  name,
  user,
  params,
  pathLocation,
  currentlyEditingAssetInfo
 } ) => {

  const assetId = params && params.assetId
  const projectId = params && params.projectId
  const usernameToShow = user ? user.profile.name : params.username
  const { kind, canEdit, projectNames } = currentlyEditingAssetInfo
  const kindName = AssetKinds.getName(kind)
  const EditOrView = canEdit ? 'Edit' : 'View'

  return (
    <Breadcrumb>
      &emsp;
      <QLink to="/" className="section"><img src='/images/logos/mgb/big/icon_01.png' style={{ height: '1em', verticalAlign: 'middle', paddingRight: '0.25em' }} /></QLink>
      
      { usernameToShow && _sep }

      { usernameToShow && (
        <QLink className="section" to={`/u/${usernameToShow}`}>
          { user && (
            <img
                className="ui avatar image"
                style={{ width: '1.3em', height: '1.3em' }}
                src={makeCDNLink(`/api/user/${user._id}/avatar/60`, makeExpireTimestamp(60))}></img>
            )
          }
          {usernameToShow}&nbsp;
        </QLink>
        )
      }

      { usernameToShow && assetId && _sep }
      { usernameToShow && assetId && 
        <QLink className="section" to={`/u/${usernameToShow}/assets`}>Assets&nbsp;</QLink> 
      }

      { usernameToShow && assetId &&
        <ProjectsSection usernameToShow={usernameToShow} projectNames={projectNames} />
      }

      { usernameToShow && assetId && kind && _sep }
      { usernameToShow && assetId && kind && (
        <QLink 
            style={{color: AssetKinds.getColor(kind)}} 
            className="section" 
            to={`/u/${usernameToShow}/assets`} 
            query={{ kinds: kind, ...(projectNames ? {project: projectNames[0]} : {} ) }}>
          { kindName }&nbsp;
        </QLink>
        )
      }

      { usernameToShow && projectId && _sep }
      { usernameToShow && projectId && 
        <QLink className="section" to={`/u/${usernameToShow}/projects`}>Projects&nbsp;</QLink> 
      }

      { pathLocation && pathLocation.startsWith('/learn') && _sep }
      { pathLocation && pathLocation.startsWith('/learn') && 
        <QLink className="section" to={`/learn`}>Learn&nbsp;</QLink> 
      }
      { pathLocation && pathLocation.startsWith('/learn/skills') && _sep }
      { pathLocation && pathLocation.startsWith('/learn/skills') && 
        <QLink className="section" to={`/learn/skills`}>Skills&nbsp;</QLink> 
      }
      { pathLocation && pathLocation.startsWith('/learn/code/') && _sep }
      { pathLocation && pathLocation.startsWith('/learn/code/') && 
        <QLink className="section" to={`/learn/code`}>Programming&nbsp;</QLink> 
      }

      { name && _sep }
      { (usernameToShow && assetId && kind) ? EditOrView : ( name ? <span>{name}&nbsp;</span> : null ) }
    </Breadcrumb>
  )
}

NavBarBreadcrumb.propTypes = {
  params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
  pathLocation:       PropTypes.string,                 // basically windows.location.pathname, but via this.props.location.pathname from App.js
  currentlyEditingAssetInfo: PropTypes.object.isRequired// An object with some info about the currently edited Asset - as defined in App.js' this.state
}

export default NavBarBreadcrumb
