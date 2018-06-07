import _ from 'lodash'
import PropTypes from 'prop-types'

import { Store } from '/client/imports/stores'
import { showToast } from '/client/imports/modules'
import { logActivity } from '../../../imports/schemas/activity'
import registerDebugGlobal from '../ConsoleDebugGlobals'

// Used to group assets that do not have a project
export const __NO_PROJECT__ = '__NO_PROJECT__'
export const __NO_ASSET__ = 'no_asset'

// We only store limited necessary information about open assets
// The content2 field is massive, this allows us to keep a small footprint
/**
 * Removes unnecessary data from the object for performance reasons. 
 * @param {object} Asset Any asset
 * 
 * @returns {object} New object with a null content2 property 
 */
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
      __NO_PROJECT__: [],
    },
    project: __NO_PROJECT__,
  }

  /**
   * @returns {Array} Returns array of asset objects
   */
  getOpenAssets = () => {
    const { assets, project } = this.state

    return assets[project]
  }

  /**
   * @returns {String} The current project from the store as a String
   */

  project = () => {
    const { project } = this.state

    return project
  }

  assets = () => {
    const { assets } = this.state
    return assets
  }

  assetHasMultipleProjects = (asset, targetProject) => {
    if (targetProject !== __NO_PROJECT__) {
      return asset.projectNames.length > 1
    } else {
      return false
    }
  }

  /**
   * Checks to see if an asset is already open in a project
   * 
   * @param {Object} Asset Asset to look for in the assets list
   * 
   * @param {String} ProjectName Which project to check
   * 
   * @param {Object} AssetsObject Optional, pass custom object instead of state.assets
   * 
   * @returns {Boolean} true or false
   */
  isAlreadyOpen = (asset, targetProject, targetAssets = this.state.assets) => {
    const isAlreadyOpen = _.find(targetAssets[targetProject], { _id: asset._id })
    if (isAlreadyOpen) {
      return true
    } else {
      return false
    }
  }

  /**
   * Checks if store.assets[ProjectName] has open assets or is empty/exists. Returns false if
   * it does not exist, or has no open assets. Returns true otherwise.
   * 
   * @param {String} ProjectName The target project to check, should be a string.
   * 
   * @returns {Boolean} true or false 
   */
  projectHasLoadedAssets = projectName => {
    if (this.state.assets[projectName] && this.state.assets[projectName].length > 0) {
      return true
    } else {
      return false
    }
  }

  trackAllProjects = (userProjectsArray, assets) => {
    let newAssets = Object.assign(assets)
    for (let item in userProjectsArray) {
      newAssets = this.trackProject(userProjectsArray[item].name, newAssets)
    }

    return newAssets
  }

  setProject = project => {
    this.setState({ project })
  }

  /**
   * Tracks a new project in the assets list.
   * In most cases this shouldn't be called directly as tracking new assets
   * should be done with this.trackAsset()
   * 
   * @param {String} ProjectName A string that contains the new project's name
   * 
   * @param {Object} Assets Object of assets you would like to add a project to
   * 
   * @returns {Object} The new instance of the Assets object that now tracks the project.
   */
  trackProject = (project, assets) => {
    let newAssets = Object.assign(assets)
    if (!assets[project]) {
      newAssets[project] = []
      return newAssets
    }
    return assets
  }

  /**
   * Add an asset to the given assets object. This does NOT modify the state of the store.
   * This function is smart and will not generate duplicates and will automatically track
   * any projects that are not already in the asset store.
   * 
   * @param {Object} Asset The asset to add to the given assets object.
   * 
   * @param {Object} Assets Object that you would like to add the asset to.
   * 
   * @returns {Object} New assets object that has given asset added.
   */
  trackAsset = (asset, assets) => {
    let newAssets = Object.assign(assets)

    if (asset.projectNames.length === 0) {
      // debugger
      // if the asset has no project, track the special "no project" project
      newAssets = this.trackProject(__NO_PROJECT__, newAssets)
      if (!this.isAlreadyOpen(asset, __NO_PROJECT__)) {
        newAssets[__NO_PROJECT__].push(asset)
        // Return and exit the function, we do not need to loop over the asset's project list
      }
      return newAssets
    }

    for (let index in asset.projectNames) {
      let curProject = asset.projectNames[index]
      newAssets = this.trackProject(curProject, newAssets)
      if (!_.find(newAssets[curProject], { _id: asset._id })) {
        newAssets[curProject].push(asset)
      }
    }
    return newAssets
  }

  /**
   * Remove an asset from the given assets object. This does NOT modify the state of the store.
   * 
   * @param {Object} Asset The asset to look for and remove.
   * 
   * @param {Object} Assets Object that contains assets in the {[ProjectName]: [...assets]} format.
   * 
   * @returns {Object} New assets object that has given asset removed.
   */
  untrackAsset = (asset, assets) => {
    const { currUser } = this.props
    let newAssets = Object.assign(assets)
    // handle assets with no projects
    if (asset.projectNames.length === 0 || asset.dn_ownerName !== currUser.username) {
      let targetIndex = _.findIndex(newAssets[__NO_PROJECT__], { _id: asset._id })
      newAssets[__NO_PROJECT__].splice(targetIndex, 1)
      return newAssets
    }
    // handle assets with projects
    for (let index in asset.projectNames) {
      let indexName = asset.projectNames[index]
      if (newAssets[indexName]) {
        let targetIndex = _.findIndex(newAssets[indexName], { _id: asset._id })
        newAssets[indexName].splice(targetIndex, 1)
      }
    }
    return newAssets
  }

  /**
   * @param {Object} Asset The asset that you would like to get the project name from.
   * 
   * @returns {String} Either __NO_PROJECT__ or the asset's first project as a string.
   */
  getContextualProject = asset => {
    if (this.isAlreadyOpen(asset, this.project())) {
      return this.project()
    } else if (asset.projectNames.length === 0) {
      return __NO_PROJECT__
    } else {
      return asset.projectNames[0]
    }
  }

  setProps = props => {
    this.props = props
  }

  userIsOwner = asset => {
    const { currUser } = this.props
    if (currUser === asset.dn_ownerName) {
      return true
    } else {
      return false
    }
  }

  openAsset = asset => {
    const { assets, project } = this.state
    const tombstone = getAssetTombstone(asset)
    let newAssets = {}

    // Track all of the projects this asset is in.
    newAssets = this.trackAsset(tombstone, assets)

    const targetProject = this.getContextualProject(tombstone)

    if (!this.isAlreadyOpen(tombstone, targetProject)) {
      this.setState({
        assets: newAssets,
        project: targetProject,
      })
    } else if (project !== targetProject) {
      this.setState({ project: targetProject })
    }
  }

  closeAsset = asset => {
    const { assets } = this.state

    const newAssets = this.untrackAsset(asset, assets)

    this.setState({
      assets: newAssets,
    })
  }

  getFirstAssetInProject = project => {
    if (this.projectHasLoadedAssets(project)) {
      return this.state.assets[project][0]
    } else {
      return __NO_ASSET__
    }
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
