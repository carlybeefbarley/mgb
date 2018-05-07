/*
 *************************************************************
 * This component wraps the asset editor to provide IDE-like options
 * such as creating new assets, tabs for each open asset, and quick project
 * swapping.
 *************************************************************
 */

import React from 'react'
import _ from 'lodash'
import { Grid, Dropdown, Button, Segment, Icon } from 'semantic-ui-react'
import AssetCreateNewModal from '/client/imports/components/Assets/NewAsset/AssetCreateNewModal'
import RelatedAssets from '/client/imports/components/Nav/RelatedAssets'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'

export default function AssetEditProjectContainer(props) {
  const { currUserProjects, currUser, currentlyEditingAssetInfo, params, user, assetStore } = props
  // Set the default name/option for the projects dropdown list
  const projectName = assetStore.state.project
  const __NO_ASSET__ = 'no_asset'

  return (
    <div style={{ overflowY: 'auto' }}>
      <Grid padded columns="equal" style={{ flex: '0 0 auto' }}>
        <Grid.Column style={{ flex: '0 0 20em' }}>
          <div style={{ display: 'inline', fontSize: '2em' }}>
            <Dropdown
              selectOnBlur={false}
              selectOnNavigation={false}
              button
              className="basic secondary right labeled icon"
              fluid
              search
              scrolling
              value={projectName}
              // Throws error but semantic doesnt curently support this icon positioning correctly via built in props
              text={
                <span>
                  <Icon name="sitemap" /> {projectName}
                </span>
              }
              onChange={(e, { value }) => {
                const project = { name: value }
                assetStore.setProject(project.name)
                if (assetStore.state.assets[project.name]) {
                  utilPushTo(
                    location.query,
                    `/u/${currUser.username}/asset/${assetStore.state.assets[project.name][0]._id}`,
                  )
                } else utilPushTo(location.query, `/u/${currUser.username}/asset/${__NO_ASSET__}`)
              }}
              options={_.map(currUserProjects, project => ({
                key: project.name,
                text: project.name,
                value: project.name,
                icon: 'sitemap',
              }))}
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
          <Button
            as={QLink}
            floated="right"
            to={`/u/${currentlyEditingAssetInfo.ownerName}/projects/${projectName}`}
          >
            Project Overview
          </Button>
        </Grid.Column>
      </Grid>
      <Grid padded columns="equal" style={{ flex: '1' }}>
        <Grid.Column stretched style={{ flex: '0 0 20em', overflowY: 'auto' }}>
          <Segment>
            <RelatedAssets
              projectName={projectName}
              overrideProject={assetStore.state.project}
              location={location}
              user={user}
              currUser={currUser}
              currUserProjects={currUserProjects}
              params={params}
              currentlyEditingAssetInfo={currentlyEditingAssetInfo}
            />
          </Segment>
        </Grid.Column>
        <Grid.Column style={{ overflowY: 'auto' }}>{props.children}</Grid.Column>
      </Grid>
    </div>
  )
}
