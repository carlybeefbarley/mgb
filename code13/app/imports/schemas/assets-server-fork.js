import _ from 'lodash'
import { Projects, Azzets } from '/imports/schemas'
import { check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'
import validate from '/imports/schemas/validate'
import { doFixupAssetReferences } from './assets-server-forkFixup'

//
// MGB ASSETS SCHEMA - SERVER-ONLY CODE  (fork-related functionality)
// This file must be imported by main_server.js so that the Meteor method can be registered
//

Meteor.methods({
  //
  // PROJECT FORK
  //
  // ..Note that the  PROJECT FORK  implementation is here in assets-server since it must perform
  //  many asset-related operations during the fork operations.

  // Parameters are in an { opts } object:
  //   opts.sourceProjectName      // Required string
  //   opts.sourceProjectOwnerId   // Required string
  //   opts.newProjectName         // Required string

  'Project.Azzets.fork'(opts = {}) {
    // 0. Perform Input/User Validations
    checkIsLoggedInAndNotSuspended()
    checkMgb.projectName(opts.newProjectName)
    checkMgb.projectName(opts.sourceProjectName)
    check(opts.sourceProjectOwnerId, String)

    // See if source project exists
    const sourceProject = Projects.findOne({
      ownerId: opts.sourceProjectOwnerId,
      name: opts.sourceProjectName,
    })
    if (!sourceProject)
      throw new Meteor.Error(
        404,
        `Source Project #${opts.sourceProjectName} does not exist for user #${opts.sourceProjectOwnerId}`,
      )

    if (!sourceProject.allowForks)
      throw new Meteor.Error(403, `Source Project #${opts.sourceProjectName} does not allow Forks`)

    // See if target project name is already taken
    const conflictingProject = Projects.findOne({ ownerId: this.userId, name: opts.newProjectName })
    if (conflictingProject) throw new Meteor.Error(402, 'A project already exists with that name')

    const now = new Date()
    const username = Meteor.user().profile.name

    // 1. Generate list of asset IDs in source project that we will need to each fork
    const azzSel = {
      ownerId: sourceProject.ownerId,
      isDeleted: false,
      projectNames: sourceProject.name,
    }

    // we need also name - as assets can be referenced from source as /assetName
    const srcAssetIds = Azzets.find(azzSel, { fields: { name: 1, _id: 1 } }).fetch()

    if (srcAssetIds.length === 0)
      return new Meteor.Error(
        404,
        `Source Project '${sourceProject.ownerName}:${opts.sourceProjectName}' contains no Assets. Cannot fork empty project`,
      )

    // Initial validations seem ok. So 'unblock' to allow other Meteor.call() requests for this client
    // since it may take a while.. Otherwise other functions like chat will be disabled during the fork work
    this.unblock()

    // TODO: loop through these assets and confirm that they can be renamed (length etc)
    //       and still be valid.   See { newAssetName: ___} stuff below for the code to use/change

    // 2. Try to create new Project

    const newProjData = {
      name: opts.newProjectName,
      description: `[Fork] ${sourceProject.description}`,
      avatarAssetId: sourceProject.avatarAssetId || '',
      // forkParentChain will be handled in the code below...
    }

    // This is the same shape as for Asset fork, but some params have different names:
    //   ≈  parentProjectName instead of parentAssetName
    newProjData.forkParentChain = sourceProject.forkParentChain ? _.clone(sourceProject.forkParentChain) : []
    newProjData.forkParentChain.push({
      parentId: sourceProject._id,
      parentOwnerName: sourceProject.ownerName,
      parentOwnerId: sourceProject.ownerId,
      parentProjectName: sourceProject.name,
      forkDate: now,
    })

    const newProjId = Meteor.call('Projects.create', newProjData)

    // Next, update the parent's forkChildren Info. We do this directly
    // here since the "Projects.update" Meteor Method is callable by client
    // and we don't want clients to be able to manipulate these records directly
    Projects.update(
      {
        _id: sourceProject._id,
      },
      {
        $push: {
          forkChildren: {
            projectId: newProjId,
            forkDate: now,
            forkedByUserId: this.userId,
            forkedByUserName: username,
          },
        },
      },
    )

    // Now we loop through the many assets and fork each
    _.each(srcAssetIds, entry => {
      Meteor.call('Azzets.fork', entry._id, {
        fixupReferences: true,
        assets: srcAssetIds,
        projectNames: [newProjData.name],
        newAssetName: opts.sourceProjectOwnerId == this.userId ? entry.name + ' (forked)' : entry.name,
      })
    })

    return {
      opts,
      numNewAssets: srcAssetIds.length,
      newProjectId: newProjId,
    }
  },

  //
  // ASSET FORK
  //

  // Fork Asset
  // @param srcId - Source ID of Asset to be forked.
  // @param {opts} All other parameters are in the opts object:
  //   opts.ownerId               // Optional (together) to create asset in other user's account
  //   opts.dn_ownerName          // Optional (together) to create asset in other user's account
  //   opts.projectNames          // null or an array with one project name string
  //   opts.newAssetName          // if null it will just append ' (fork)' to the old name
  //   opts.fixupReferences       // if true, then call the smart asset-handlers that fixup
  // references. For NOW, they assume ONLY the owner has changed
  'Azzets.fork'(srcId, opts = {}) {
    // 0. Perform Input/User Validations
    checkIsLoggedInAndNotSuspended()
    check(srcId, String)
    if (opts.newAssetName) checkMgb.assetName(opts.newAssetName)
    // Handled below... Check opts.ownerId + opts.dn_ownerName are a valid pair,
    // and the project can be placed there

    const now = new Date()
    const username = Meteor.user().profile.name

    // 1. Get and validate the existing Source Asset
    const srcAsset = Azzets.findOne(srcId)
    if (!srcAsset) throw new Meteor.Error(404, 'Source Asset Not Found')

    console.log(`  [Azzets.fork]  "${srcAsset.name}... Owner=${username}`)

    if (srcAsset.suFlagId) throw new Meteor.Error(401, 'Cannot fork flagged asset')

    if (srcAsset.suIsBanned === true) throw new Meteor.Error(401, 'Cannot fork banned asset')
    // 2. Create, Fixup and store the new forked asset
    const dstAsset = _.omit(srcAsset, '_id')
    dstAsset.updatedAt = now
    dstAsset.isDeleted = false // Yes, we allow forking of a deleted asset, and will undelete it as we fork
    dstAsset.projectNames = []
    dstAsset.heartedBy = []
    dstAsset.heartedBy_count = 0

    dstAsset.name =
      opts.newAssetName ||
      dstAsset.name + ` (fork_${now.toTimeString().slice(0, 2) + '_' + now.toTimeString().slice(3, 5)})`
    if (!dstAsset.forkParentChain) dstAsset.forkParentChain = []

    dstAsset.forkParentChain.push({
      parentId: srcId,
      parentOwnerName: srcAsset.dn_ownerName,
      parentOwnerId: srcAsset.ownerId,
      parentAssetName: srcAsset.name,
      forkDate: now,
    })

    if (dstAsset.kind === 'game') {
      // Special handling in all cases for Game Assets.. beause of playCounts and other stuff
      if (dstAsset.metadata) dstAsset.metadata.playCount = 0
    }

    if (opts.fixupReferences) doFixupAssetReferences(dstAsset, dstAsset.dn_ownerName, username, opts.assets)

    if (opts.ownerId && opts.dn_ownerName) {
      // We may in future allow the caller to set this: Main scenario is 'Create As Member Of Project'
      // TODO: Validate these further... DO THEY MATCH
      if (opts.ownerId !== this.userId || opts.dn_ownerName !== username)
        throw new Meteor.Error(500, "Fork asset to another users' account is not yet implemented")
    } else if (opts.ownerId || opts.dn_ownerName)
      throw new Meteor.Error(500, 'Must specify owner id and name together')
    else {
      // Use the caller's username & id
      dstAsset.ownerId = this.userId // We allow the caller to set this: Main scenario is 'Create As Member Of Project'
      dstAsset.dn_ownerName = username
    }

    if (this.userId === dstAsset.ownerId) {
      if (opts.projectNames && opts.projectNames.length === 1) {
        const newAzzetProjectName = opts.projectNames[0]
        if (!validate.projectName(newAzzetProjectName))
          throw new Meteor.Error(500, 'Invalid Project Name to Fork Asset to')
        dstAsset.projectNames.push(opts.projectNames[0])
      }
    } else {
      // Not yet implemented - fork to another user's project
      console.trace("This code isn't active yet. We should not be here")
      console.log(
        `TODO #insecure# check that user '${username}' is really part of project '${dstAsset
          .projectNames[0]}' `,
      )
      if (
        !opts.projectNames ||
        opts.projectNames.length === 0 ||
        opts.projectNames.length > 1 ||
        opts.projectNames[0] === ''
      )
        throw new Meteor.Error(
          401,
          "Must set exactly one ProjectName when forking an Asset into another User's context",
        )
      throw new Meteor.Error(500, "Fork asset to another users' account is not yet implemented")

      // CHECK THEY REALLY CAN DO THIS.
      // Is this.userId in Project.memberList for   project.ownerName === data.ownerName && project.name === data.projectNames[0]
      // ALSO CHECK that USERNAME AND USERID MATCH
    }

    const newForkedAssetId = Azzets.insert(dstAsset)

    // 2. Handle post-create actions and return {docId and newAsset (except content2)} of new forked Asset
    console.log(
      `  [Azzets.fork]  "${dstAsset.name}"  #${newForkedAssetId}  Kind=${dstAsset.kind}  Owner=${username}`,
    )
    Meteor.call('Slack.Assets.create', username, dstAsset.kind, dstAsset.name, newForkedAssetId)

    // Update parent asset with info of latest direct child
    Azzets.update(
      {
        _id: srcId,
      },
      {
        $push: {
          forkChildren: {
            assetId: newForkedAssetId,
            forkDate: now,
            forkedByUserId: this.userId,
            forkedByUserName: username,
          },
        },
      },
    )

    dstAsset._id = newForkedAssetId
    return {
      newId: newForkedAssetId,
      newAssetNoC2: _.omit(dstAsset, 'content2'),
    }
  },

  'Azzets.revertDataFromForkParent'(assetId, forkParentId) {
    // 0. Perform Input/User Validations
    checkIsLoggedInAndNotSuspended()
    check(assetId, String)

    // Load Asset
    const asset = Azzets.findOne(assetId)
    if (!asset) throw new Meteor.Error(404, 'Asset Not Found')

    // TODO: Access check: Must have write access to Asset #assetId via one of it's projects
    // for now, keep it simple and just support owner
    if (asset.ownerId !== this.ownerId)
      throw new Meteor.Error(
        401,
        "for now, only Asset Owners can revert-to-fork on an Asset. We will implement reverting an Asset as a Project member when it's needed",
      )

    // Check the ForkParent exists and is valid
    const fpc = asset.forkParentChain
    if (!fpc || !_.isArray(fpc) || fpc.length === 0)
      throw new Meteor.Error(404, 'Asset has no ForkParent, so cannot revert-to-fork')
    if (fpc[0].parentId !== forkParentId)
      throw new Meteor.Error(404, 'Asset does not have expected ForkParent')

    const forkParentAsset = Azzets.findOne(forkParentId)
    if (!forkParentAsset) throw new Meteor.Error(404, `ForkParent Asset #${forkParentId} Not Found`)

    // copy the data
    const data = {
      content2: _.clone(forkParentAsset.content2),
      metadata: _.clone(forkParentAsset.metadata),
      assetLicense: _.clone(forkParentAsset.assetLicense),
      thumbnail: _.clone(forkParentAsset.thumbnail),
      updatedAt: new Date(),
      isUnconfirmedSave: this.isSimulation, // should be false, but let's make sure to do it right
      // what about isCompleted ? probably not
    }

    const selector = { _id: asset._id }
    const count = Azzets.update(selector, { $set: data })
    if (count !== 1) throw new Meteor.Error(`Azzets.update() failed to revert Asset #${assetId}`)

    if (Meteor.isServer)
      console.log(
        `  [Azzets.revertDataFromForkParent]  (${count}) #${asset._id}  Kind=${asset.kind}  Owner=${asset.dn_ownerName}`,
      ) // These fields might not be provided for updates

    return count
  },
})
