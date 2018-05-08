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

  openAsset = asset => {
    const { assets } = this.state
    // set the target project to the current project if it is in the assets list of projects,
    // if it isn't in the list of projects, open the first project on the asset. If it has no projects, default to __NO_PROJECT__
    const targetProject =
      _.find(asset.projectNames, this.state.project) || _.first(asset.projectNames) || __NO_PROJECT__
    const assetHasMultipleProjects = this.assetHasMultipleProjects(asset, targetProject)
    // console.log('Asset Has Multiple Projects?: ', assetHasMultipleProjects)
    const assetTombstone = getAssetTombstone(asset)
    let otherProjectsAssets = {}

    if (assetHasMultipleProjects) {
      for (let project in asset.projectNames) {
        if (project !== __NO_PROJECT__ && project !== targetProject) {
          let projectName = asset.projectNames[project]

          if (!this.isAlreadyOpen(assetTombstone, projectName)) {
            otherProjectsAssets[projectName] = _.union(assets[project], [assetTombstone])
          }
          console.log('PROJECT NAMES:', otherProjectsAssets)
        }
      }
    }

    const newAssets = _.union(this.state.assets[targetProject], [assetTombstone])
    let testAssets = otherProjectsAssets
    testAssets[targetProject] = newAssets

    console.log('All Projects: ', testAssets)

    // Check if asset is already open in this project branch.
    if (this.isAlreadyOpen(asset, targetProject)) {
      console.log('assetStore.openAsset() ...skipping already open asset', { project: targetProject, asset })
      // Make sure to be on the right project even if it's already open,
      // as the user may have navigated away and come back.
      if (this.state.project !== targetProject) this.setState({ project: targetProject })
      return
    }

    console.log('assetStore.openAsset()', { project: targetProject, asset, assets })

    this.setState({
      assets: testAssets,
      project: targetProject,
    })

    // this.setState({
    //   assets: {
    //     ...this.state.assets,
    //     [targetProject]: newAssets,
    //   },
    //   project: targetProject,
    // })
  }

  closeAsset = asset => {
    console.log('assetStore.closeAsset()', asset)
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
