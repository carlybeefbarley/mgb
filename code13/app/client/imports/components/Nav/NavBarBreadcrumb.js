import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Popup, Breadcrumb, Icon } from 'semantic-ui-react'

import UserCard from '/client/imports/components/Users/UserCard'
import QLink from '/client/imports/routes/QLink'
import UX from '/client/imports/UX'
import { AssetKinds } from '/imports/schemas/assets'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column
// on the left and the FlexPanel on the right).

// The NavBarBreadcrumb contains a breadcrumb bar that is generated based on name, user and
// params (assetId, projectId etc)

const ProjectsSection = ({ usernameToShow, projectNames }) => {
  const firstProjectNameForAsset = _.isArray(projectNames) && projectNames[0]
  if (!usernameToShow || !firstProjectNameForAsset) return null

  const section = (
    <QLink
      className="section"
      to={`/u/${usernameToShow}/assets`}
      query={{ project: firstProjectNameForAsset }}
    >
      <Icon name="sitemap" />
      {firstProjectNameForAsset}&nbsp;
    </QLink>
  )

  if (projectNames.length === 1) return section

  // Else it's going to need a Popup to show the other options
  return (
    <Popup
      trigger={section}
      on="hover"
      hoverable
      position="bottom center"
      header="List Assets in..."
      content={_.map(projectNames, projectName => (
        <div key={projectName} style={{ margin: '0.25rem' }}>
          <QLink to={`/u/${usernameToShow}/assets`} query={{ project: projectName }}>
            <Icon name="sitemap" />
            {projectName}
          </QLink>
        </div>
      ))}
      mouseEnterDelay={400}
    />
  )
}

const _learnCodeItemHeaders = {
  basics: 'JavaScript basics',
  phaser: 'GameDev Concepts',
  games: 'GameDev Tutorials',
}

// For all images in the breadcrumb
const breadcrumbImageStyle = { height: '1rem', verticalAlign: 'middle' }

const BreadcrumbImage = ({ style, ...rest }) => (
  <img {...rest} style={{ ...breadcrumbImageStyle, ...style }} />
)

const NavBarBreadcrumb = props => {
  const { name, user, params, location, currentlyEditingAssetInfo, showHome } = props
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
  const isPlay = assetVerb === 'Play' // A bit of a hack while we decide if this is a good UX
  const isLearn = pathname && pathname.startsWith('/learn')
  const isAssets = name === 'Assets'

  const sections = [
    //
    // Home
    //
    showHome && (
      <QLink to="/" key="home">
        <BreadcrumbImage src="/images/logos/mgb/big/icon_01.png" />
      </QLink>
    ),
    //
    // User
    //
    usernameToShow && (
      // hey, this span is required!
      <span key="username">
        <Popup
          trigger={
            <QLink to={`/u/${usernameToShow}`}>
              {user && <BreadcrumbImage src={UX.makeAvatarImgLink(usernameToShow)} />} {usernameToShow}
            </QLink>
          }
          on="hover"
          hoverable
          position="bottom center"
          header={usernameToShow}
          content={user && <UserCard user={user} />}
          mouseEnterDelay={500}
        />
      </span>
    ),
    //
    // Assets - inserted if on an Asset-focused page (play, edit)
    //
    usernameToShow &&
    (isAssets || assetId) &&
    !isPlay && (
      <QLink key="assets" to={`/u/${usernameToShow}/assets`}>
        Assets
      </QLink>
    ),
    //
    // [ICON] Projects - from Asset's Project's list if on a page that includes a project query (projects, assets)
    //
    usernameToShow &&
    !assetId &&
    queryProjectName && (
      // hey, this span is required!
      <span key="query-project-name">
        <ProjectsSection usernameToShow={usernameToShow} projectNames={[queryProjectName]} />
      </span>
    ),
    //
    // [ICON] Projects - from Asset's Project's list if on an asset-focused page (play, edit)
    //
    usernameToShow &&
    assetId &&
    projectNames &&
    projectNames.length > 0 && (
      // hey, this span is required!
      <span key="project-names">
        <ProjectsSection usernameToShow={usernameToShow} projectNames={projectNames} />
      </span>
    ),
    //
    // [ICON] AssetKind
    //
    usernameToShow &&
    assetId &&
    kind &&
    !isPlay && (
      <QLink
        key="asset-kind"
        to={`/u/${usernameToShow}/assets`}
        query={{ kinds: kind, ...(projectNames ? { project: projectNames[0] } : {}) }}
      >
        {kindName}
      </QLink>
    ),
    //
    // Projects
    //
    usernameToShow &&
    isProjectOnPath && (
      <QLink key="username-projects" to={`/u/${usernameToShow}/projects`}>
        Projects
      </QLink>
    ),
    //
    // Learn
    //
    isLearn && (
      <QLink key="learn" to={`/learn`}>
        Learn
      </QLink>
    ),
    //
    // Skills
    //
    pathname &&
    pathname.startsWith('/learn/skills') && (
      <QLink key="skils" to={`/learn/skills`}>
        Skills
      </QLink>
    ),
    //
    // Code
    //
    pathname &&
    pathname.startsWith('/learn/code/') && (
      <QLink key="learn-code" to={`/learn/code`}>
        Programming
      </QLink>
    ),
    //
    // LearnCode ITEM   [TODO: FIX THIS? seems to not ne working]
    //
    learnCodeItem && <span key="learn-code-item">{_learnCodeItemHeaders[learnCodeItem]}</span>,
    //
    // Other low-context item (create asset, list users etc) ITEM
    //
    !learnCodeItem && !usernameToShow && !assetId && !isPlay && <span key="route-name-item">{name}</span>,
    //
    // AssetName
    //
    assetId &&
    currentlyEditingAssetInfo &&
    currentlyEditingAssetInfo.name && (
      <span key="asset-name">
        {currentlyEditingAssetInfo.isDeleted && <Icon name="trash" color="red" />}
        {currentlyEditingAssetInfo.isLocked && <Icon name="lock" color="blue" />}
        <span
          style={{
            color: currentlyEditingAssetInfo.isDeleted
              ? 'red'
              : currentlyEditingAssetInfo.isLocked ? 'blue' : null,
          }}
        >
          {currentlyEditingAssetInfo.name}
        </span>
        &nbsp;
        {assetVerb && <span style={{ opacity: 0.5 }}>({assetVerb})</span>}
      </span>
    ),
    //
    // Project Name - When on project detail page
    //
    !assetId &&
    projectName && (
      <span key="project-name">
        <Icon name="sitemap" />
        {projectName}
      </span>
    ),
  ]
    // filter out falsey breadcrumb sections
    .filter(Boolean)
    .map(elm => {
      // add section wrapper
      return (
        <div key={elm.key} className="section">
          {elm}
        </div>
      )
    })

  return <Breadcrumb icon="right angle" sections={sections} style={{ marginRight: '1rem' }} />
}

NavBarBreadcrumb.propTypes = {
  params: PropTypes.object.isRequired, // The :params from /imports/routes/index.js via App.js. See there for description of params
  user: PropTypes.object, // If there is a :id user id  or :username on the path, this is the user record for it
  currUser: PropTypes.object, // Currently logged in user.. or null if not logged in.
  name: PropTypes.string, // Page title to show in NavBar breadcrumb
  location: PropTypes.object, // basically windows.location, but via this.props.location from App.js (from React Router)
  currentlyEditingAssetInfo: PropTypes.object.isRequired, // An object with some info about the currently edited Asset - as defined in App.js' this.state
  showHome: PropTypes.bool,
}

export default NavBarBreadcrumb
