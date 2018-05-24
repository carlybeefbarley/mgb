import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { showToast } from '/client/imports/modules'

import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'

import ImportGraphic from '/client/imports/components/Import/ImportGraphic'

const ImportRoute = React.createClass({
  propTypes: {
    params: PropTypes.object, // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object, // Maybe absent if route is /assets
    currUser: PropTypes.object, // Currently Logged in user
    currUserProjects: PropTypes.array,
    ownsProfile: PropTypes.bool,
    location: PropTypes.object, // We get this from react-router
  },

  contextTypes: {
    urlLocation: PropTypes.object,
  },

  createAsset(
    assetKindKey,
    assetName,
    projectName,
    projectOwnerId,
    projectOwnerName,
    content2,
    thumbnail,
    assetLicense,
    workState,
    isCompleted,
  ) {
    if (!this.props.currUser) {
      showToast.error('You must be logged-in to create a new Asset')
      return
    }

    let newAsset = {
      name: assetName,
      kind: assetKindKey,
      assetLicense,
      workState,
      thumbnail,
      content2,
      dn_ownerName: this.props.currUser.username, // Will be replaced below if in another project

      isCompleted,
      isDeleted: false,
      isPrivate: false,
    }
    if (projectName && projectName !== '') {
      newAsset.projectNames = [projectName]
      newAsset.dn_ownerName = projectOwnerName
      newAsset.ownerId = projectOwnerId
    }

    // console.log(newAsset)

    Meteor.call('Azzets.create', newAsset, (error, result) => {
      if (error) {
        showToast.error('cannot create Asset because: ' + error.reason)
      } else {
        newAsset._id = result // So activity log will work
        logActivity('asset.create', `Bulk import ${assetKindKey}`, null, newAsset)
      }
    })
  },

  render() {
    return (
      <div>
        <h1>Bulk Import</h1>
        <ImportGraphic
          currUser={this.props.currUser}
          currUserProjects={this.props.currUserProjects}
          createAsset={this.createAsset}
        />
      </div>
    )
  },
})

export default ImportRoute
