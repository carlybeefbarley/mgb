import _ from 'lodash'
import PropTypes from 'prop-types'

import { Store } from '/client/imports/stores'
import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'
import { logActivity } from '../../../imports/schemas/activity'

class AssetStore extends Store {
  static storeShape = {
    state: PropTypes.shape({}),
  }

  state = {
    openAssets: [],
  }

  openAsset = asset => {
    console.log('openAsset', asset)
    this.setState({ openAssets: _.uniq([...this.state.openAssets, asset]) })
  }

  closeAsset = asset => {
    console.log('closeAsset', asset)
    this.setState({ openAssets: _.filter(this.state.openAssets, a => a._id !== asset._id) })
  }

  createAsset = (currUser, assetKindKey, assetName, projectName, projectOwnerId, projectOwnerName) => {
    return new Promise((resolve, reject) => {
      if (!currUser) {
        showToast.error('You must be logged-in to create a new Asset')
        return
      }

      const newAsset = {
        name: assetName,
        kind: assetKindKey,
        text: '',
        thumbnail: '',
        content2: {},
        dn_ownerName: currUser.username, // Will be replaced below if in another project
        ownerId: currUser._id,
        isCompleted: false,
        isDeleted: false,
        isPrivate: false,
      }
      if (projectName) {
        newAsset.projectNames = [projectName]
        newAsset.dn_ownerName = projectOwnerName
        newAsset.ownerId = projectOwnerId
      }

      Meteor.call('Azzets.create', newAsset, (error, result) => {
        if (error) {
          showToast.error('Failed to create new Asset. ' + error.reason)
          reject(error)
        } else {
          newAsset._id = result // So activity log will work
          logActivity('asset.create', `Create ${assetKindKey}`, null, newAsset)
          // Now go to the new Asset
          resolve(newAsset)
        }
      })
    })
  }
}

export default new AssetStore()
