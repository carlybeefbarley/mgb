import _ from 'lodash'
import PropTypes from 'prop-types'

import { Store } from '/client/imports/stores'
import { showToast } from '/client/imports/modules'
import { logActivity } from '../../../imports/schemas/activity'
import registerDebugGlobal from '../ConsoleDebugGlobals'

// Used to group assets that do not have a project
export const __NO_PROJECT__ = '__NO_PROJECT__'

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
    project: __NO_PROJECT__,
  }

  getOpenAssets = () => {
    const { assets, project } = this.state

    return assets[project]
  }

  project = () => {
    const { project } = this.state

    return project
  }

  assetHasMultipleProjects = (asset, targetProject) => {
    if (targetProject !== __NO_PROJECT__) {
      return asset.projectNames.length > 1
    } else {
      return false
    }
  }

  isAlreadyOpen = (asset, targetProject) => {
    const { assets } = this.state
    const isAlreadyOpen = _.find(assets[targetProject], { _id: asset._id })
    if (isAlreadyOpen) {
      return true
    } else {
      return false
    }
  }

  projectHasLoadedAssets = projectName => {
    if (this.state.assets[projectName]) {
      return true
    } else {
      return false
    }
  }

  setProject = project => {
    this.setState({ project })
  }

  trackProject = (project, assets) => {
    let newAssets = Object.assign(assets)
    if (!assets[project]) {
      newAssets[project] = []
      return newAssets
    }
    return assets
  }

  // Never call this before trackProject or you will end up with improperly tracked assets.
  trackAsset = (asset, assets) => {
    let newAssets = Object.assign(assets)
    for (let index in asset.projectNames) {
      let curProject = asset.projectNames[index]
      newAssets = this.trackProject(curProject, newAssets)
      if (!_.find(newAssets[curProject], { _id: asset._id })) {
        newAssets[curProject].push(asset)
      }
    }
    return newAssets
  }

  openAsset = asset => {
    const { assets, project } = this.state

    let newAssets = {}

    // Track all of the projects this asset is in.
    newAssets = this.trackAsset(asset, assets)

    const targetProject = asset.projectNames[0]
    if (!this.isAlreadyOpen(asset, targetProject)) {
      this.setState({
        assets: newAssets,
        project: targetProject,
      })
      return
    } else if (project === __NO_PROJECT__) {
      this.setProject(targetProject)
    }
  }

  closeAsset = asset => {
    // console.log('assetStore.closeAsset()', asset)
    const { assets, project } = this.state

    this.setState({
      assets: {
        ...this.state.assets,
        [project]: _.filter(assets[project], a => a._id !== asset._id),
      },
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
