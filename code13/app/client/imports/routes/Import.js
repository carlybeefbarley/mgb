import React, { PropTypes, Component } from 'react'

import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'

import ImportGraphic from '/client/imports/components/Import/ImportGraphic'


export default ImportRoute = React.createClass({

  propTypes: {
    params: PropTypes.object,           // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object,             // Maybe absent if route is /assets
    currUser: PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array, 
    ownsProfile: PropTypes.bool,
    location: PropTypes.object          // We get this from react-router
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  createAsset: function(assetKindKey, assetName, projectName, projectOwnerId, projectOwnerName, content2, thumbnail) {
    if (!this.props.currUser) {
      alert("You must be login to create a new Asset")
      return
    }

    let newAsset = {
      name: assetName,
      kind: assetKindKey,
      text: "",
      thumbnail: thumbnail || "",
      content2: content2,
      dn_ownerName: this.props.currUser.name,         // Will be replaced below if in another project

      isCompleted: false,
      isDeleted:   false,
      isPrivate:   false
    }
    if (projectName && projectName !== "") {
      newAsset.projectNames = [projectName]
      newAsset.dn_ownerName = projectOwnerName
      newAsset.ownerId = projectOwnerId
    }

    console.log('bulkImport', newAsset)

    Meteor.call('Azzets.create', newAsset, (error, result) => {
      if (error) {
          alert("cannot create Asset because: " + error.reason)
      } else {
        newAsset._id = result             // So activity log will work
        logActivity("asset.create",  `Bulk import ${assetKindKey}`, null, newAsset)
      }
    })
  },

  render: function(){
    return (
      <div>
        <h1>Bulk Import</h1>
        <span style={{color:"red"}}>
        Import is not ready yet.<br/>
        TODO: progress, license, status, prefix, project selection, asset selection
        </span>
        <ImportGraphic 
          createAsset={this.createAsset}
        />
      </div>
    )
  },

})