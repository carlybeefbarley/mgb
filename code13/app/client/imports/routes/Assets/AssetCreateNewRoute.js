import _ from 'lodash'
import React, { PropTypes } from 'react'
import { showToast } from '/client/imports/routes/App'
import Helmet from 'react-helmet'
import AssetCreateNew from '/client/imports/components/Assets/NewAsset/AssetCreateNew'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { logActivity } from '/imports/schemas/activity'

import { utilPushTo } from '/client/imports/routes/QLink'
import { Container, Segment } from 'semantic-ui-react'
import Hotjar from '/client/imports/helpers/hotjar.js'


// Default params we will accept in ? params on url
const suggestedParamNames = 'projectName,assetName,assetKind'.split(',')

export default AssetCreateNewRoute = React.createClass({

  propTypes: {
    params: PropTypes.object,           // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object,             // Maybe absent if route is /assets
    currUser: PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array, 
    ownsProfile: PropTypes.bool,
    location: PropTypes.object          // We get this from react-router
  },

  componentDidMount(){
    // setTimeou just to be sure that everything is loaded
    setTimeout( () => Hotjar('trigger', 'asset-create-new'), 200)
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  render: function() {

    return (
      <Segment basic>
        <Helmet
          title="Create a new Asset"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />
        <Container>
          <AssetCreateNew 
              handleCreateAssetClick={this.handleCreateAssetClickFromComponent}
              currUser={this.props.currUser}
              currUserProjects={this.props.currUserProjects}
              suggestedParams={_.pick(this.props.location.query, suggestedParamNames)}
              />
        </Container>
      </Segment>
    )
  },

  /**
   * 
   * 
   * @param {string} assetKindKey - must be one of assetKindKey
   * @param {string} assetName - string. Can be "" but that is discouraged
   * @param {string} projectName - can be "" or null/undefined; those values indicate No Project
   * @param {string} projectOwnerId - if projectName is a nonEmpty string, should be a valid projectOwnerId
   * @param {string} projectOwnerName - if projectName is a nonEmpty string, should be a valid projectOwnerName
   */
  handleCreateAssetClickFromComponent(assetKindKey, assetName, projectName, projectOwnerId, projectOwnerName) {
    if (!this.props.currUser) {
      showToast("You must be logged-in to create a new Asset", 'error')
      return
    }

    let newAsset = {
      name:         assetName,
      kind:         assetKindKey,
      text:         "",
      thumbnail:    "",
      content2:     {},
      dn_ownerName: this.props.currUser.name,         // Will be replaced below if in another project

      isCompleted:  false,
      isDeleted:    false,
      isPrivate:    false
    }
    if (projectName && projectName !== "") {
      newAsset.projectNames = [projectName]
      newAsset.dn_ownerName = projectOwnerName
      newAsset.ownerId = projectOwnerId
    }

    Meteor.call('Azzets.create', newAsset, (error, result) => {
      if (error) {
        showToast("Failed to create new Asset because: " + error.reason, 'error')
      } else {
        newAsset._id = result             // So activity log will work
        logActivity("asset.create",  `Create ${assetKindKey}`, null, newAsset)
        joyrideCompleteTag(`mgbjr-CT-asset-create-new`)
        joyrideCompleteTag(`mgbjr-CT-asset-create-new-${newAsset.kind}`)
        // Now go to the new Asset
        utilPushTo(this.context.urlLocation.query, `/u/${newAsset.dn_ownerNam}/asset/${result}`)
      }
    })
  }
})