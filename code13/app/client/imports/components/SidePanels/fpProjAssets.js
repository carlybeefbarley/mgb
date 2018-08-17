import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { utilPushTo } from '/client/imports/routes/QLink'
import { Icon, Message, Dropdown } from 'semantic-ui-react'
import RelatedAssets from '/client/imports/components/Nav/RelatedAssets'
import { __NO_PROJECT__, __NO_ASSET__ } from '/client/imports/stores/assetStore'
import { Projects } from '/imports/schemas'

// FP tab containing assets for current project
// Uses components from AssetEditProjectLayout.js for more editor space

const getAssetIdOrRouteByProject = (project, assetStore) => {
  let val = assetStore.getFirstAssetInProject(project)
  if (val !== __NO_ASSET__) {
    return val._id
  } else {
    return val
  }
}

const renderProjectsList = (currUserProjects, assetStore, currentlyEditingAssetInfo, location) => {
  const assets = Object.assign(assetStore.assets())
  const ownerId = currentlyEditingAssetInfo.ownerId
  const name = location.query ? location.query.project : __NO_PROJECT__
  const project = Projects.find({ ownerId, name }).fetch()

  let data = [],
    keys = Object.keys(assets)

  for (let index in keys) {
    if (keys[index] === __NO_PROJECT__) {
      data.push({
        key: keys[index],
        text: keys[index],
        value: '_',
        icon: 'sitemap',
      })
    } else if (_.find(currUserProjects, { name: keys[index] })) {
      data.push({
        key: keys[index],
        text: keys[index],
        value: _.find(currUserProjects, { name: keys[index] })._id,
        icon: 'sitemap',
      })
    } else {
      data.push({
        key: keys[index],
        text: keys[index],
        value: project._id,
        icon: 'sitemap',
      })
    }
  }

  return data
}

const _propTypes = {
  currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
  currUserProjects: PropTypes.array, // Projects list for currently logged in user
  user: PropTypes.object, // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth: PropTypes.string.isRequired, // Typically something like "200px".
  params: PropTypes.object,
  assetStore: PropTypes.object,
}

const fpProjAssets = ({
  user,
  currUser,
  currUserProjects,
  currentlyEditingAssetInfo,
  params,
  assetStore,
}) => {
  if (!currUser) return <Message content="User not found - no projects to show" />
  if (params && !params.assetId)
    return <Message content="Start editing an asset to see its project and related assets." />

  const renderedProjectsList = renderProjectsList(
    currUserProjects,
    assetStore,
    currentlyEditingAssetInfo,
    location,
  )
  // Set the default name/option for the projects dropdown list
  const projectName = assetStore.project() || __NO_PROJECT__
  const dropDownCurrentProjectName = _.find(renderedProjectsList, { text: projectName })
    ? _.find(renderedProjectsList, { text: projectName }).text
    : __NO_PROJECT__
  const username = currentlyEditingAssetInfo.ownerName || (user && user.username)

  return (
    <div>
      <div style={{ marginBottom: '1em' }}>
        <Dropdown
          selectOnBlur={false}
          selectOnNavigation={false}
          button
          disabled={currUser === null}
          className="basic secondary right labeled icon"
          fluid
          search
          scrolling
          value={projectName}
          // Throws error but semantic doesn't currently support this icon positioning correctly via built in props
          text={
            <span>
              <Icon name="sitemap" />
              {dropDownCurrentProjectName}
            </span>
          }
          onChange={(e, obj) => {
            const valueID = obj.value
            const valueText = obj.options[_.findIndex(obj.options, { value: valueID })].text
            assetStore.setProject(valueText)
            utilPushTo(
              location.query,
              `/u/${currUser.username}/asset/${getAssetIdOrRouteByProject(valueText, assetStore)}`,
              {
                project: valueText,
              },
            )
          }}
          options={renderedProjectsList}
        />
      </div>
      <RelatedAssets
        projectName={assetStore.project() === __NO_PROJECT__ ? '_' : assetStore.project()}
        location={location}
        user={username}
        currUser={currUser}
        currUserProjects={currUserProjects}
        params={params}
        currentlyEditingAssetInfo={currentlyEditingAssetInfo}
      />
    </div>
  )
}

fpProjAssets.propTypes = _propTypes
export default fpProjAssets
