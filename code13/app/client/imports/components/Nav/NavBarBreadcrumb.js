import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Popup, Breadcrumb, Icon, Input, Label, List } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { AssetKinds } from '/imports/schemas/assets'
import UserItem from '/client/imports/components/Users/UserItem'

import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column
// on the left and the FlexPanel on the right).

// The NavBarBreadcrumb contains a breadcrumb bar that is generated based on name, user and
// params (assetId, projectId etc)

const _handleRelatedAssetsPopupOpen = () => {
  // wait for it to open, then focus it
  setTimeout(() => {
    const relatedInput = document.querySelector('#mgb-navbar-relatedassets')
    relatedInput.focus()
  })
}

const ProjectsSection = ({ usernameToShow, projectNames }) => {
  const firstProjectNameForAsset = _.isArray(projectNames) && projectNames[0]
  if (!usernameToShow || !firstProjectNameForAsset)
    return null

  const section = (
    <QLink
      className='section'
      to={`/u/${usernameToShow}/assets`}
      query={{ project: firstProjectNameForAsset }}>
      <Icon name='sitemap' />{firstProjectNameForAsset}&nbsp;
    </QLink>
  )

  if (projectNames.length === 1)
    return section

  // Else it's going to need a Popup to show the other options
  return (
    <Popup
      trigger={section}
      on='hover'
      hoverable
      position='bottom center'
      header='List Assets in...'
      content={_.map(projectNames, projectName => (
        <div key={projectName} style={{ margin: '0.25em' }}>
          <QLink
            to={`/u/${usernameToShow}/assets`}
            query={{ project: projectName }}>
            <Icon name='sitemap' />{projectName}
          </QLink>
        </div>
      ))}
      mouseEnterDelay={400}
    />
  )
}

const _learnCodeItemHdrs = {
  basics: 'JavaScript basics',
  phaser: 'GameDev Concepts',
  games:  'GameDev Tutorials',
}

const _assetVerbIcons = {
  undefined: 'question',
  View:      'eye',
  Edit:      'pencil',
  Play:      'gamepad',
}

// For all images in the breadcrumb
const breadcrumbImageStyle = { height: '1em', verticalAlign: 'middle' }

const BreadcrumbImage = ({ style, ...rest }) => (
  <img {...rest} style={{ ...breadcrumbImageStyle, ...style }} />
)

const NavBarBreadcrumbUI = (props) => {
  const {
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
  } = props
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
  const assetNameQuickNavRegex = new RegExp('^.*' + quickAssetSearch, 'i')
  const filteredRelatedAssets = _.filter(relatedAssets, a => assetNameQuickNavRegex.test(a.name))

  const sections = [
    //
    // Home
    //
    <QLink to='/' key='home'>
      <img src='/images/logos/mgb/big/icon_01.png' style={breadcrumbImageStyle} />
    </QLink>,
    //
    // User
    //
    usernameToShow && (
      // hey, this span is required!
      <span key='username'>
        <Popup
          trigger={(
            <QLink to={`/u/${usernameToShow}`}>
              {user && <BreadcrumbImage src={UX.makeAvatarImgLink(usernameToShow)} />} {usernameToShow}
            </QLink>
          )}
          on='hover'
          hoverable
          position='bottom center'
          header={usernameToShow}
          content={user && <UserItem user={user} />}
          mouseEnterDelay={500}
        />
      </span>
    ),
    //
    // Assets - inserted if on an Asset-focused page (play, edit)
    //
    usernameToShow && (isAssets || assetId) && !isPlay && (
      <QLink key='assets' to={`/u/${usernameToShow}/assets`}>Assets</QLink>
    ),
    //
    // [ICON] Projects - from Asset's Project's list if on a page that includes a project query (projects, assets)
    //
    usernameToShow && !assetId && queryProjectName && (
      // hey, this span is required!
      <span key='query-project-name'>
        <ProjectsSection usernameToShow={usernameToShow} projectNames={[queryProjectName]} />
      </span>
    ),
    //
    // [ICON] Projects - from Asset's Project's list if on an asset-focused page (play, edit)
    //
    usernameToShow && assetId && projectNames && projectNames.length > 0 && (
      // hey, this span is required!
      <span key='project-names'>
        <ProjectsSection usernameToShow={usernameToShow} projectNames={projectNames} />
      </span>
    ),
    //
    // [ICON] AssetKind
    //
    usernameToShow && assetId && kind && !isPlay && (
      <QLink
        key='asset-kind'
        to={`/u/${usernameToShow}/assets`}
        query={{ kinds: kind, ...(projectNames ? { project: projectNames[0] } : {} ) }}>
        { kindName }
      </QLink>
    ),
    //
    // Projects
    //
    usernameToShow && isProjectOnPath && (
      <QLink key='username-projects' to={`/u/${usernameToShow}/projects`}>Projects</QLink>
    ),
    //
    // Learn
    //
    isLearn && (
      <QLink key='learn' to={`/learn`}>Learn</QLink>
    ),
    //
    // Skills
    //
    pathname && pathname.startsWith('/learn/skills') && (
      <QLink key='skils' to={`/learn/skills`}>Skills</QLink>
    ),
    //
    // Code
    //
    pathname && pathname.startsWith('/learn/code/') && (
      <QLink key='learn-code' to={`/learn/code`}>Programming</QLink>
    ),
    //
    // LearnCode ITEM
    //
    learnCodeItem && <span key='learn-code-item'>{_learnCodeItemHdrs[learnCodeItem]}</span>,
    //
    // AssetName
    //
    (assetId && currentlyEditingAssetInfo && currentlyEditingAssetInfo.name) && (
      <span key='asset-name'>
        <Icon name={_assetVerbIcons[assetVerb]} />
        { currentlyEditingAssetInfo.isDeleted &&
          <Icon name='trash' color='red' />
        }
        { currentlyEditingAssetInfo.isLocked &&
          <Icon name='lock' color='blue' />
        }
        '{currentlyEditingAssetInfo.name}'
        &ensp;
        {/* Popup for > Related */}
        {usernameToShow && (
          <Popup
            on='hover'
            hoverable
            wide
            onOpen={_handleRelatedAssetsPopupOpen}
            position='bottom left'
            trigger={<Icon color='blue' name='ellipsis horizontal' style={breadcrumbImageStyle} />}
          >
            <Popup.Header>
              Related Assets
            </Popup.Header>
            <Popup.Content>
              <Input
                id='mgb-navbar-relatedassets' // so it can be focused on open
                fluid
                size='mini'
                icon='search'
                loading={relatedAssetsLoading}
                placeholder='Related assets'
                defaultValue={quickAssetSearch}
                onChange={handleSearchNavKey}
              />
              <List
                selection
                style={{ maxHeight: '30em', width: '20em', overflowY: 'auto' }}
                items={_.map(filteredRelatedAssets, a => ({
                  key:     a._id,
                  as:      QLink,
                  to:      `/u/${a.dn_ownerName}/asset/${a._id}`,
                  style:   { color: AssetKinds.getColor(a.kind) },
                  icon:    { name: AssetKinds.getIconName(a.kind), color: AssetKinds.getColor(a.kind) },
                  content: currUser && currUser.username === a.dn_ownerName ? a.name : `${a.dn_ownerName}:${a.name}`,
                }))}
              />
              <div>
                { contextualProjectName &&
                <small>
                  <span>Within </span>
                  <QLink to={`/u/${user ? user.username : (currUser ? currUser.username : null)}/projects/${contextualProjectName}`}>
                    <Icon name='sitemap' /><span>{contextualProjectName}</span>
                  </QLink>
                </small>
                }
                <QLink to='/assets/create' style={{ float: 'right' }}>
                  <Icon.Group>
                    <Icon color='green' name='pencil' />
                    <Icon color='green' corner name='add' />
                  </Icon.Group>
                </QLink>
              </div>
            </Popup.Content>
          </Popup>
        )}
      </span>
    ),
  ]
    .filter(elm => {
      // filter out falsey breadcrumb sections
      return React.isValidElement(elm) && elm.props.children !== undefined
    })
    .map(elm => {
      // add section wrapper
      return <div key={elm.key} className='section'>{elm}</div>
    })

  return (
    <div style={{ display: 'inline-block' }}>
      <Breadcrumb icon='right angle' sections={sections} />

    </div>
  )
}

NavBarBreadcrumbUI.propTypes = {
  params:                    PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  user:                      PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  currUser:                  PropTypes.object,                 // Currently logged in user.. or null if not logged in.
  name:                      PropTypes.string,                 // Page title to show in NavBar breadcrumb
  location:                  PropTypes.object,                 // basically windows.location, but via this.props.location from App.js (from React Router)
  currentlyEditingAssetInfo: PropTypes.object.isRequired// An object with some info about the currently edited Asset - as defined in App.js' this.state
}

const NameInfoAzzets = new Meteor.Collection('NameInfoAzzets')

const NavBarBreadcrumb = React.createClass({
  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      quickAssetSearch: ''
    }
  },

  _getContextualProjectName() {
    const { location, currentlyEditingAssetInfo, params } = this.props
    const { query } = location
    const { projectNames } = currentlyEditingAssetInfo
    return projectNames && projectNames.length > 0 ? projectNames[0] : (
      // Else is it a query?
      query && query.project && query.project.length > 1
        ? query.project
        : params.projectName || null
    )
  },

  getMeteorData() {
    const { user, currUser } = this.props
    const { quickAssetSearch } = this.state
    const handleForAssets = Meteor.subscribe('assets.public.nameInfo.query',
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
      relatedAssets:        NameInfoAzzets.find().fetch()
    }
  },

  handleSearchNavKey(e) {
    this.setState({ quickAssetSearch: e.target.value })
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
