import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Popup, Breadcrumb, Icon } from 'semantic-ui-react'
import { AssetKinds } from '/imports/schemas/assets'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import UserItem from '/client/imports/components/Users/UserItem'
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

const _learnCodeItemHdrs = {
  'basics': 'JavaScript basics',
  'phaser': 'GameDev Concepts',
  'games': 'GameDev Tutorials'
}

const NavBarBreadcrumb = ( {
  name,
  user,
  params,
  location,
  currentlyEditingAssetInfo
 } ) => {
  const { query, pathname } = location
  const assetId = params && params.assetId
  const projectId = params && params.projectId
  const learnCodeItem = params && pathname && pathname.startsWith('/learn/code/') && params.item
  const queryProjectName = query ? query.project : null
  const usernameToShow = user ? user.profile.name : params.username
  const { kind, assetVerb, projectNames } = currentlyEditingAssetInfo
  const kindName = AssetKinds.getName(kind)
  const isPlay = (assetVerb === 'Play')   // A bit of a hack while we decide if this is a good UX
  const isAssets = (name === 'Assets')

  return (
    <Breadcrumb>
      &emsp;
      <QLink to="/" className="section"><img src='/images/logos/mgb/big/icon_01.png' style={{ height: '1em', verticalAlign: 'middle', paddingRight: '0.25em' }} /></QLink>
      
      { /*    > USER     */ }
      { usernameToShow && _sep }
      { usernameToShow && (
          <Popup
              trigger={(
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
              )}
              on='hover'
              hoverable
              positioning='bottom center'
              mouseEnterDelay={400} >
            <Popup.Header>
              {<usernameToShow></usernameToShow>}
            </Popup.Header>
            <Popup.Content>
            { user && <UserItem user={user} /> }
            </Popup.Content>
          </Popup>
        )
      }

      { /*   > Assets   ... inserted in breadcrumb if on an Asset-focussed page (play, edit) */ }
      { usernameToShow && (isAssets || assetId) && !isPlay && _sep }
      { usernameToShow && (isAssets || assetId) && !isPlay && 
        <QLink className="section" to={`/u/${usernameToShow}/assets`}>Assets&nbsp;</QLink> 
      }

      { /*   > [ICON] Projects   .. from Asset's Project's list if on an asset-focussed page (play, edit) */ }
      { usernameToShow && !assetId && queryProjectName && 
        <ProjectsSection usernameToShow={usernameToShow} projectNames={[queryProjectName]} />
      }

      { /*   > [ICON] Projects   .. from Asset's Project's list */ }
      { usernameToShow && assetId &&
        <ProjectsSection usernameToShow={usernameToShow} projectNames={projectNames} />
      }

      { /*   > [ICON] AssetKind   */ }
      { usernameToShow && assetId && kind && !isPlay && _sep }
      { usernameToShow && assetId && kind && !isPlay && (
        <QLink 
            style={{color: AssetKinds.getColor(kind)}} 
            className="section" 
            to={`/u/${usernameToShow}/assets`} 
            query={{ kinds: kind, ...(projectNames ? {project: projectNames[0]} : {} ) }}>
          { kindName }&nbsp;
        </QLink>
        )
      }

      { /*   > Projects   */ }
      { usernameToShow && projectId && _sep }
      { usernameToShow && projectId && 
        <QLink className="section" to={`/u/${usernameToShow}/projects`}>Projects&nbsp;</QLink> 
      }

      { /*   > Learn   */ }
      { pathname && pathname.startsWith('/learn') && _sep }
      { pathname && pathname.startsWith('/learn') && 
        <QLink className="section" to={`/learn`}>Learn&nbsp;</QLink> 
      }

      { /*   > Skills   */ }
      { pathname && pathname.startsWith('/learn/skills') && _sep }
      { pathname && pathname.startsWith('/learn/skills') && 
        <QLink className="section" to={`/learn/skills`}>Skills&nbsp;</QLink> 
      }

      { /*   > Code   */ }
      { pathname && pathname.startsWith('/learn/code/') && _sep }
      { pathname && pathname.startsWith('/learn/code/') && 
        <QLink className="section" to={`/learn/code`}>Programming&nbsp;</QLink> 
      }

      { /*   > LearnCode ITEM   */ }
      { learnCodeItem &&  _sep }
      { learnCodeItem && <span>{_learnCodeItemHdrs[learnCodeItem]}&nbsp;</span>
      }

      { /*   > [assetVerb||pageName||null]   */ }
      { (!isAssets && (assetVerb || name)) && _sep }
      { (!isAssets && (assetVerb || name)) ? (assetVerb || name) : ( (name && !isAssets) ? <span>{name}&nbsp;</span> : null ) }
    </Breadcrumb>
  )
}

NavBarBreadcrumb.propTypes = {
  params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
  location:           PropTypes.object,                 // basically windows.location, but via this.props.location from App.js (from React Router)
  currentlyEditingAssetInfo: PropTypes.object.isRequired// An object with some info about the currently edited Asset - as defined in App.js' this.state
}

export default NavBarBreadcrumb
