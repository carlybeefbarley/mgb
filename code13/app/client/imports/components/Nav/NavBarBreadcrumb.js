import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Breadcrumb, Icon, Label, List, Popup } from 'semantic-ui-react'

import { _NO_PROJECT_PROJNAME } from '/client/imports/components/Assets/ProjectSelector'
import QLink from '/client/imports/routes/QLink'
import UX from '/client/imports/UX'
import { AssetKinds } from '/imports/schemas/assets'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column
// on the left and the FlexPanel on the right).

// The NavBarBreadcrumb contains a breadcrumb bar that is generated based on name, user and
// params (assetId, projectId etc)

const ProjectsSection = ({ username, projectNames }) => {
  const projectCount = projectNames.length
  const isMultiple = projectCount > 1
  const firstProject = _.first(projectNames)

  const to = name => `/u/${username}/projects/${name}`

  const section = (
    <QLink to={to(firstProject)}>
      {isMultiple && <Label size="mini" circular content={projectCount} />}
      <Icon name="sitemap" />
      {firstProject}
    </QLink>
  )

  // single project
  if (!isMultiple) return section

  // multiple project popup list
  return (
    <Popup
      trigger={section}
      on="hover"
      hoverable
      position="bottom left"
      header={`Asset is in ${projectCount} Projects`}
      content={
        <List
          items={_.map(projectNames, project => ({
            key: project,
            content: (
              <QLink to={to(project)} query={{ project }}>
                <Icon name="sitemap" />
                {project}
              </QLink>
            ),
          }))}
        />
      }
      mouseEnterDelay={200}
    />
  )
}

const learnCodeItemHeaders = {
  intro: 'Intro to Coding',
  advanced: 'Advanced Coding',
  phaser: 'Game Development Concepts',
  games: 'Make Games',
}

// For all images in the breadcrumb
const breadcrumbImageStyle = { height: '1rem', verticalAlign: 'middle' }

const BreadcrumbImage = ({ style, ...rest }) => (
  <img {...rest} style={{ ...breadcrumbImageStyle, ...style }} />
)

const NavBarBreadcrumb = props => {
  const { currentlyEditingAssetInfo, location, name, params, user } = props

  const username = user ? user.profile.name : params.username

  const isLearnChild = /^\/learn\/\w+/.test(location.pathname)
  const isLearnCodeChild = /^\/learn\/code\/\w+/.test(location.pathname)
  const isLearnCodeModifyChild = /^\/learn\/code\/modify\/\w+/.test(location.pathname)
  const isLearnSkillsChild = /^\/learn\/skills\/\w+/.test(location.pathname)

  // detail pages
  const isAssetDetail = !!params.assetId
  const isProjectDetail = !!params.projectId || !!params.projectName

  // get all project names available
  const projectNames = [params.projectName, _.get(location, 'query.project')]
    .concat(currentlyEditingAssetInfo.projectNames)
    .filter(
      name =>
        // remove falsey values
        !!name &&
        // there is a weird case where the query param for "no project" is actually ?project=_
        // make sure we don't show that in the breadcrumb :/ fix that someday...
        name !== _NO_PROJECT_PROJNAME,
    )

  const projectName = _.first(projectNames)
  const hasProject = !_.isEmpty(projectNames)

  const sections = [
    // ============================================================
    // Links (non-link ending is at the end of this array)
    // ============================================================

    //
    // Home
    // Do not add home, NavBarBreadcrumb is not shown on home.
    // User can navigate into a stuck state this way.
    //

    // Learn
    //
    isLearnChild && (
      <QLink key="learn" to={`/learn`}>
        Learn
      </QLink>
    ),
    //
    // Learn > Skills
    //
    isLearnSkillsChild && (
      <QLink key="learn-skills" to={`/learn/skills`}>
        Skills
      </QLink>
    ),
    //
    // Learn > Code
    //
    isLearnCodeChild && (
      <QLink key="learn-code" to={`/learn/code`}>
        Code
      </QLink>
    ),
    //
    // Learn > Code > Modify Games
    //
    isLearnCodeModifyChild && (
      <QLink key="learn-code" to={`/learn/code/modify`}>
        Modify Games
      </QLink>
    ),
    //
    // User
    //
    username && (
      <Breadcrumb.Section key="username">
        <QLink to={`/u/${username}`}>
          <BreadcrumbImage src={UX.makeAvatarImgLink(username)} /> {username}
        </QLink>
      </Breadcrumb.Section>
    ),
    //
    // Projects
    //
    username &&
    hasProject && (
      <QLink key="projects" to={`/u/${username}/projects`}>
        Projects
      </QLink>
    ),
    //
    // projectName
    //
    username &&
    hasProject &&
    !isProjectDetail && (
      <span key="project-name">
        <ProjectsSection username={username} projectNames={projectNames} />
      </span>
    ),
    //
    // Assets
    //
    username &&
    isAssetDetail && (
      <QLink key="assets" to={`/u/${username}/assets`} query={{ project: projectName }}>
        Assets
      </QLink>
    ),
    //
    // assetKind
    //
    username &&
    currentlyEditingAssetInfo.kind &&
    isAssetDetail && (
      <QLink
        key="asset-kind"
        to={`/u/${username}/assets`}
        query={{ kinds: currentlyEditingAssetInfo.kind, project: projectName }}
      >
        {AssetKinds.getName(currentlyEditingAssetInfo.kind)}
      </QLink>
    ),

    // ============================================================
    // Non-link ending text section
    // ============================================================
    isAssetDetail ? (
      <span key="name">
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
        {currentlyEditingAssetInfo.assetVerb && (
          <span style={{ opacity: 0.5 }}>({currentlyEditingAssetInfo.assetVerb})</span>
        )}
      </span>
    ) : isProjectDetail ? (
      <span key="name">
        <Icon name="sitemap" />
        {projectName}
      </span>
    ) : learnCodeItemHeaders[params.item] ? (
      <span key="name">{learnCodeItemHeaders[params.item]}</span>
    ) : params.skillarea ? (
      <span key="name">{_.startCase(params.skillarea)}</span>
    ) : name ? (
      <span key="name">{name}</span>
    ) : (
      // for analytics
      console.error('NavBarBreadcrumb has no text section case for this route!')
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

  return (
    <Breadcrumb
      className="mgb-navbar-breadcrumb"
      icon="right angle"
      sections={sections}
      style={{ marginRight: '1rem' }}
    />
  )
}

NavBarBreadcrumb.propTypes = {
  params: PropTypes.object.isRequired, // The :params from /imports/routes/index.js via App.js. See there for description of params
  user: PropTypes.object, // If there is a :id user id  or :username on the path, this is the user record for it
  currUser: PropTypes.object, // Currently logged in user.. or null if not logged in.
  name: PropTypes.string, // Page title to show in NavBar breadcrumb
  // basically windows.location, but via this.props.location from App.js (from React Router)
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    query: PropTypes.object.isRequired,
  }).isRequired,
  currentlyEditingAssetInfo: PropTypes.object.isRequired, // An object with some info about the currently edited Asset - as defined in App.js' this.state
}

export default NavBarBreadcrumb
