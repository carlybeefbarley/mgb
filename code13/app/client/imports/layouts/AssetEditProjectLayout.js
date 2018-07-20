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
import ChatPanel from '/client/imports/components/Chat/ChatPanel'
import { makeChannelName } from '/imports/schemas/chats'

import { isPathChallenge, isPathCodeTutorial } from '/imports/Skills/SkillNodes/SkillNodes'

export default class AssetEditProjectContainer extends React.Component {
  renderProjectsList = currUserProjects => {
    const { assetStore } = this.props
    const assets = Object.assign(assetStore.assets())
    let data = [],
      keys = Object.keys(assets)

    for (let index in keys) {
      data.push({ key: keys[index], text: keys[index], value: keys[index], icon: 'sitemap' })
    }

    return data
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

  projectChangeHandler = (e, { value }) => {
    const { assetStore, currUser } = this.props
    assetStore.setProject(value)
    utilPushTo(location.query, `/u/${currUser.username}/asset/${this.getAssetIdOrRouteByProject(value)}`, {
      project: value,
    })
  }

  componentDidMount() {
    const { assetStore, currUserProjects } = this.props
    assetStore.trackAllProjects(currUserProjects, assetStore.assets())
  }

  render() {
    const { currUserProjects, currUser, currentlyEditingAssetInfo, params, assetStore } = this.props
    const user = currentlyEditingAssetInfo.ownerName
    const renderedProjectsList = this.renderProjectsList(currUserProjects)
    // Set the default name/option for the projects dropdown list
    const projectName = assetStore.project() || __NO_PROJECT__
    const dropDownCurrentProjectName = _.find(renderedProjectsList, { value: projectName })
      ? _.find(renderedProjectsList, { value: projectName }).text
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
                onChange={(e, { value }) => {
                  this.projectChangeHandler(e, { value })
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
