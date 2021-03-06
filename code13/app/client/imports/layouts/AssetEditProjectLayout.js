/*
 *************************************************************
 * This layout wraps the asset editor to provide IDE-like options
 * such as creating new assets, tabs for each open asset, and quick project
 * swapping.
 *************************************************************
 */

import React from 'react'
import _ from 'lodash'
import { Grid, Dropdown, Button, Segment, Icon, Popup } from 'semantic-ui-react'
import AssetCreateNewModal from '/client/imports/components/Assets/NewAsset/AssetCreateNewModal'
import RelatedAssets from '/client/imports/components/Nav/RelatedAssets'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { __NO_PROJECT__, __NO_ASSET__ } from '/client/imports/stores/assetStore'
import { Projects } from '/imports/schemas'

export default class AssetEditProjectContainer extends React.Component {
  static state = {}

  renderProjectsList = currUserProjects => {
    const { assetStore, currentlyEditingAssetInfo, location } = this.props
    const assets = Object.assign(assetStore.assets())
    const project = this.getProjectData(currentlyEditingAssetInfo.ownerId, location.query.project)

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

  getProjectData = (ownerId, name) => {
    const data = Projects.find({ ownerId, name }).fetch()
    return data
  }

  getProjectsByOwnerId = ownerId => {
    const projectsHandler = Meteor.subscribe('projects.byUserId', ownerId)

    return projectsHandler
  }

  getAssetIdOrRouteByProject = project => {
    const { assetStore } = this.props
    let val = assetStore.getFirstAssetInProject(project)
    if (val !== __NO_ASSET__) {
      return val._id
    } else {
      return val
    }
  }

  projectChangeHandler = (e, object) => {
    const { assetStore, currUser } = this.props
    const valueID = object.value
    const valueText = object.options[_.findIndex(object.options, { value: valueID })].text
    assetStore.setProject(valueText)
    utilPushTo(
      location.query,
      `/u/${currUser.username}/asset/${this.getAssetIdOrRouteByProject(valueText)}`,
      {
        project: valueText,
      },
    )
  }

  componentDidMount() {
    const { assetStore, currUserProjects } = this.props
    const assets = assetStore.assets()
    assetStore.trackAllProjects(currUserProjects, assets)

    let projectHandler = this.getProjectsByOwnerId(this.props.currentlyEditingAssetInfo.ownerId)

    this.setState({ projectHandler })
  }

  componentDidUpdate(prevProps) {
    const { currentlyEditingAssetInfo } = this.props
    const { projectHandler } = this.state || null
    if (currentlyEditingAssetInfo.name !== prevProps.currentlyEditingAssetInfo.name && projectHandler) {
      console.log('Stopping Subscription: ', projectHandler.subscriptionId)
      projectHandler.stop()
      let newProjectHandler = this.getProjectsByOwnerId(this.props.currentlyEditingAssetInfo.ownerId)
      this.setState({ projectHandler: newProjectHandler })
    }
  }

  componentWillUnmount() {
    this.state.projectHandler.stop()
  }

  render() {
    const { currUserProjects, currUser, currentlyEditingAssetInfo, params, assetStore } = this.props
    const user = currentlyEditingAssetInfo.ownerName || this.props.user.username
    const renderedProjectsList = this.renderProjectsList(currUserProjects)
    // Set the default name/option for the projects dropdown list
    const projectName = assetStore.project() || __NO_PROJECT__
    const dropDownCurrentProjectName = _.find(renderedProjectsList, { text: projectName })
      ? _.find(renderedProjectsList, { text: projectName }).text
      : __NO_PROJECT__

    return (
      <div style={{ overflowY: 'auto' }}>
        <Grid padded columns="equal" style={{ flex: '0 0 auto' }}>
          <Grid.Column style={{ flex: '0 0 20em' }}>
            <div style={{ display: 'inline', fontSize: '2em' }}>
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
                  this.projectChangeHandler(e, obj)
                }}
                options={renderedProjectsList}
              />
            </div>
          </Grid.Column>
          <Grid.Column>
            <AssetCreateNewModal
              currUser={currUser}
              currUserProjects={currUserProjects}
              buttonProps={{ floated: 'right' }}
              viewProps={{
                showProjectSelector: false,
                suggestedParams: { projectName },
              }}
            />
            {projectName !== __NO_PROJECT__ && (
              <Button
                as={QLink}
                floated="right"
                to={`/u/${currentlyEditingAssetInfo.ownerName}/projects/${projectName}`}
              >
                Project Overview
              </Button>
            )}
          </Grid.Column>
        </Grid>
        <Grid padded columns="equal" style={{ flex: '1' }}>
          <Grid.Column stretched style={{ flex: '0 0 20em', overflowY: 'auto' }}>
            <Segment>
              <RelatedAssets
                projectName={assetStore.project() === __NO_PROJECT__ ? '_' : assetStore.project()}
                location={location}
                user={user}
                currUser={currUser}
                currUserProjects={currUserProjects}
                params={params}
                currentlyEditingAssetInfo={currentlyEditingAssetInfo}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column style={{ overflowY: 'auto' }}>{this.props.children}</Grid.Column>
        </Grid>
      </div>
    )
  }
}
