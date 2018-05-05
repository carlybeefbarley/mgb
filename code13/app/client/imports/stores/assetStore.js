import _ from 'lodash'
import PropTypes from 'prop-types'

import { Store } from '/client/imports/stores'
import { showToast } from '/client/imports/modules'
import { logActivity } from '../../../imports/schemas/activity'
import registerDebugGlobal from '../ConsoleDebugGlobals'

// Used to group assets that do not have a project
const NO_PROJECT = '__NO_PROJECT__'

// We only store limited necessary information about open assets
// The content2 field is massive, this allows us to keep a small footprint
const getAssetTombstone = asset => ({ ...asset, content2: null })

class AssetStore extends Store {
  static storeShape = {
    state: PropTypes.shape({
      asset: PropTypes.arrayOf(PropTypes.object),
      project: PropTypes.string,
    }),
  }

  state = {
    assets: {
      // [project]: [...assetTombstone] },
      // pacman: [pacmanGraphic, pacmanMap, coinSound] },
      // otherProject: [asdf, zxvc] },
      // __NO_PROJECT__: [...assetTombstone] },
    },
    project: NO_PROJECT,
  }

  getOpenAssets = () => {
    const { assets, project } = this.state

    return assets[project]
  }

  project = () => {
    const { project } = this.state

    return project
  }

  openAsset = asset => {
    const { assets } = this.state

    const targetProject = _.first(asset.projectNames) || NO_PROJECT

    const isAlreadyOpen = _.find(assets[targetProject], { _id: asset._id })
    if (isAlreadyOpen) {
      console.log('assetStore.openAsset() ...skipping already open asset', { project: targetProject, asset })
      // Make sure to be on the right project even if it's already open,
      // as the user may have navigated away and come back.
      if (this.state.project !== targetProject) this.setState({ project: targetProject })
      return
    }

    const assetTombstone = getAssetTombstone(asset)
    const newAssets = _.union(this.state.assets[targetProject], [assetTombstone])
    console.log('assetStore.openAsset()', { project: targetProject, asset, assets })

    this.setState({
      assets: {
        ...this.state.assets,
        [targetProject]: newAssets,
      },
      project: targetProject,
    })
  }

  closeAsset = asset => {
    console.log('assetStore.closeAsset()', asset)
    const { assets, project } = this.state
    let filteredAssets = {}

    // Copy all the arrays that are not 'project' into results
    for (let item in assets) {
      if (item !== project) {
        filteredAssets[item] = assets[item]
      }
    }

    // filter the array that is 'project' and remove the asset
    const newAssetTabs = _.filter(assets[project], a => a._id !== asset._id)

    // Merge the newly filtered asset list into the copied object containing the arrays
    filteredAssets[project] = newAssetTabs

    this.setState({ assets: filteredAssets })
  }

  setProject = project => {
    this.setState({
      ...this.state,
      project,
    })
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

const assetStore = new AssetStore()

registerDebugGlobal('assetStore', assetStore, __filename)

export default assetStore
