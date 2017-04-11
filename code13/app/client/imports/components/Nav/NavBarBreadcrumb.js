import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Popup, Breadcrumb, Icon, List } from 'semantic-ui-react'
import { AssetKinds } from '/imports/schemas/assets'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import UserItem from '/client/imports/components/Users/UserItem'

import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import SpecialGlobals from '/imports/SpecialGlobals.js'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column
// on the left and the FlexPanel on the right).

// The NavBarBreadcrumb contains a breadcrumb bar that is generated based on name, user and
// params (assetId, projectId etc)

const _sep = <Icon color='grey' name='right angle' />
const _sepTo = <span>&nbsp;<Icon color='blue' name='angle double right' />&nbsp;</span>

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

const NavBarBreadcrumbUI = ( {
  name,
  user,
  currUser,
  params,
  location,
  currentlyEditingAssetInfo,
  relatedAssets,
  relatedAssetsLoading,
  contextualProjectName,
  quickAssetSearch,
  handleSearchNavKey
 } ) => {
  const { query, pathname } = location
  const assetId = params && params.assetId
  const projectId = params && params.projectId
  const projectName = params && params.projectName
  const isProjectOnPath = Boolean(projectId || projectName)
  const learnCodeItem = params && pathname && pathname.startsWith('/learn/code/') && params.item
  const queryProjectName = query ? query.project : null
  const usernameToShow = user ? user.profile.name : params.username
  const { kind, assetVerb, projectNames } = currentlyEditingAssetInfo
  const kindName = AssetKinds.getName(kind)
  const isPlay = (assetVerb === 'Play')   // A bit of a hack while we decide if this is a good UX
  const isLearn = (pathname && pathname.startsWith('/learn'))
  const isAssets = (name === 'Assets')
  const assetNameQuickNavRegex = new RegExp( '^.*' + quickAssetSearch, 'i' )
  const filteredRelatedAssets = _.filter(relatedAssets, a => assetNameQuickNavRegex.test(a.name))

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
                        src={makeCDNLink(`/api/user/${user._id}/avatar/${SpecialGlobals.avatar.validFor}`, makeExpireTimestamp(SpecialGlobals.avatar.validFor))}></img>
                    )
                  }
                  {usernameToShow}&nbsp;
                </QLink>
              )}
              on='hover'
              hoverable
              positioning='bottom center'
              mouseEnterDelay={500} >
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
      { usernameToShow && isProjectOnPath && _sep }
      { usernameToShow && isProjectOnPath &&
        <QLink className="section" to={`/u/${usernameToShow}/projects`}>Projects&nbsp;</QLink>
      }

      { /*   > Learn   */ }
      { isLearn && _sep }
      { isLearn &&
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

      { /* Popup for  > Related Assets */}
      { usernameToShow &&
        <Popup
          //style={{ outline: 'none' }}
          trigger={_sepTo}
          hoverable
          wide
          positioning='bottom left'
          on='hover'
          onOpen={_handleRelatedAssetsPopupOpen}
          // size='small'
          >
          <Popup.Header>
            Related Assets
            <small
                id='mgb-navbar-relatedassets-popup'  // So we can find it to focus it
                tabIndex='-1' // So we can focus it
                onKeyDown={handleSearchNavKey}
                style={{ color: 'grey', marginLeft: '1em', marginRight: '1em' }}>
              <Icon name='search'/>
              <span>{quickAssetSearch || '(type to search)'}...</span>
            </small>
            <span style={{float: 'right'}}>
              { relatedAssetsLoading && <Icon color='grey' loading name='refresh'/> }
            </span>
          </Popup.Header>
          <Popup.Content>
            <List selection animated celled style={{ maxHeight: '30em', width: '20em', overflowY: 'auto'}}>
              { _.map(filteredRelatedAssets, a => (
                <List.Item
                    as={QLink}
                    key={a._id}
                    style={{color: AssetKinds.getColor(a.kind)}}
                    icon={{ name: AssetKinds.getIconName(a.kind), color: AssetKinds.getColor(a.kind)}}
                    content={(currUser && currUser.username === a.dn_ownerName) ? a.name : `${a.dn_ownerName}:${a.name}`}
                    to={`/u/${a.dn_ownerName}/asset/${a._id}`}
                  />
                )
              )}
            </List>
              <div>
                { contextualProjectName &&
                    <small>
                      <span>Within </span>
                      <QLink to={`/u/${user ? user.username : (currUser ? currUser.username : null)}/projects/${contextualProjectName}`}>
                        <Icon name='sitemap'/><span>{contextualProjectName}</span>
                      </QLink>
                    </small>
                }
                <QLink to='/assets/create' style={{float: 'right'}}>
                  <Icon.Group>
                    <Icon  color='green' name='pencil' />
                    <Icon  color='green' corner name='add' />
                  </Icon.Group>
                </QLink>
              </div>
          </Popup.Content>
        </Popup>
      }
    </Breadcrumb>
  )
}


const _handleRelatedAssetsPopupOpen = () => {
  // wait for it to open, then focus it
  setTimeout(() => {
    const popup = document.querySelector('#mgb-navbar-relatedassets-popup')
    popup.focus()
  })
}

NavBarBreadcrumbUI.propTypes = {
  params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  currUser:           PropTypes.object,                 // Currently logged in user.. or null if not logged in.
  name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
  location:           PropTypes.object,                 // basically windows.location, but via this.props.location from App.js (from React Router)
  currentlyEditingAssetInfo: PropTypes.object.isRequired// An object with some info about the currently edited Asset - as defined in App.js' this.state
}

const NameInfoAzzets = new Meteor.Collection('NameInfoAzzets')

const NavBarBreadcrumb = React.createClass({
  mixins: [ReactMeteorData],

  getInitialState: function() {
    return {
      quickAssetSearch: ''
    }
  },

  _getContextualProjectName: function() {
    const { location, currentlyEditingAssetInfo, params } = this.props
    const { query } = location
    const { projectNames } = currentlyEditingAssetInfo
    return projectNames && projectNames.length > 0 ? projectNames[0] : (
      // Else is it a query?
      query && query.project && query.project.length > 1 ? query.project :
        ( params.projectName || null )
    )
  },

  getMeteorData() {
    const { user, currUser } = this.props
    const { quickAssetSearch } = this.state
    const handleForAssets = Meteor.subscribe("assets.public.nameInfo.query",
      user ? user._id : (currUser ? currUser._id : null),
      null,   // assetKinds=all
      quickAssetSearch,   // Search for string in name
      this._getContextualProjectName(),
      false,
      false,
      'edited', // Sort by recently edited
      (user || currUser) ? 50 : 10, // Just a few if not logged in and no context
      )
    return {
      relatedAssetsLoading: !handleForAssets.ready(),
      relatedAssets: NameInfoAzzets.find().fetch()
    }
  },

  handleSearchNavKey(e) {
    if (e.key && e.key.length === 1)
      this.setState( { quickAssetSearch: this.state.quickAssetSearch + e.key})
    if (e.key === 'Backspace')
      this.setState( { quickAssetSearch: this.state.quickAssetSearch.slice(0, -1)})
  },

  render() {
    return (
      <NavBarBreadcrumbUI
        {...(this.props)}
        {...this.data}
        {...this.state}
        contextualProjectName={this._getContextualProjectName()}
        handleSearchNavKey={this.handleSearchNavKey}
      />
    )
  }
})

export default NavBarBreadcrumb
