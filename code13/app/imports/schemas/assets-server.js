import _ from 'lodash'
import { Projects, Azzets } from '/imports/schemas'
import { check, Match } from 'meteor/check'
import validate from '/imports/schemas/validate'
import { doFixupAssetReferences } from './assets-server-forkFixup'
// ASSETS

// This file must be imported by main_server.js so that the Meteor method can be registered

// Fork is server-side only

Meteor.methods({
  // Fork Project
  //   opts.sourceProjectName      // Required string
  //   opts.sourceProjectOwnerId   // Required string
  //   opts.newProjectName         // Required string

  "Project.Azzets.fork": function (opts = {}) {
    if (!this.userId)
      throw new Meteor.Error(401, "Login required") // TODO: Better base access check

    // Check params are good
    check(opts.newProjectName, String)
    check(opts.sourceProjectName, String)
    check(opts.sourceProjectOwnerId, String)

    // See if source project exists

    const sourceProject = Projects.findOne( { ownerId: opts.sourceProjectOwnerId, name: opts.sourceProjectName } )
    if (!sourceProject)
      throw new Meteor.Error(404, `Source Project #${opts.sourceProjectName} does not exist for user #${opts.sourceProjectOwnerId}`)

    if (!sourceProject.allowForks)
      throw new Meteor.Error(403, `Source Project #${opts.sourceProjectName} does not allow Forks`)


    // Generate list of asset IDs in source project
    const azzSel = {
      ownerId: sourceProject.ownerId,
      isDeleted: false,
      projectNames: sourceProject.name
    }
    const ids = Azzets.find(azzSel, { fields: { name: 1, _id: 1 } } ).fetch()
    if (ids.length === 0)
     return new Meteor.Error(404, `Source Project #${opts.sourceProjectName} contains no assets`)

    console.log("List of content to Fork Project = ", ids)

    // Try to create new Project
    const newProj={ name: opts.newProjectName, description: `Project Created via Fork of ${sourceProject.ownerName}:${sourceProject.name}`}
    const newProjId = Meteor.call("Projects.create", newProj)

    _.each(ids, (entry, index) => {
        Meteor.call(
          "Azzets.fork",
          entry._id,
          {
            fixupReferences: true,
            projectNames: [newProj.name],
            newAssetName: opts.sourceProjectOwnerId == this.userId ? entry.name + ' (forked)' : entry.name
          }
        )
    })

    return ids.length
  },


  // Fork Asset
  //   opts.ownerId               // Optional (together) to create asset in other user's account
  //   opts.dn_ownerName          // Optional (together) to create asset in other user's account
  //   opts.projectNames          // null or an array with one project name string
  //   opts.newAssetName          // if null it will just append ' (fork)' to the old name
  //   opts.fixupReferences       // if true, then call the smart asset-handlers that fixup
                                  // references. For NOW, they assume ONLY the owner has changed
  "Azzets.fork": function (srcId, opts = {}) {
    if (!this.userId)
      throw new Meteor.Error(401, "Login required") // TODO: Better access check

    check(srcId, String)

    const srcAsset = Azzets.findOne(srcId)
    if (!srcAsset)
      throw new Meteor.Error(404, "Source Asset Not Found")

    const username = Meteor.user().profile.name
    console.log(`  [Azzets.fork]  "${srcAsset.name}... Owner=${username}`)

    const now = new Date()
    const dstAsset = _.omit(srcAsset, '_id')
    dstAsset.updatedAt = now
    dstAsset.projectNames = []
    dstAsset.name = opts.newAssetName || (dstAsset.name + ' (fork)')
    if (!dstAsset.forkParentChain)
      dstAsset.forkParentChain = []

    dstAsset.forkParentChain.push({
      parentId: srcId,
      parentOwnerName: srcAsset.dn_ownerName,
      parentOwnerId: srcAsset.ownerId,
      parentAssetName: srcAsset.name,
      forkDate: now
    })

    if (dstAsset.kind === 'game') {
      // Special handling in all cases for this one:
      if (dstAsset.metadata)
        dstAsset.metadata.playCount = 0
    }

    if (opts.fixupReferences)
      doFixupAssetReferences(dstAsset, dstAsset.dn_ownerName, username)


    if (opts.ownerId && opts.dn_ownerName) {
      // We allow the caller to set this: Main scenario is 'Create As Member Of Project'
      // TODO: Validate these further. Provide
      dstAsset.ownerId = opts.ownerId
      dstAsset.dn_ownerName = opts.dn_ownerName
    } else if (opts.ownerId || opts.dn_ownerName)
      throw new Meteor.Error(500, "Must specify owner id and name together")
    else {
      // Use the caller's username & id
      dstAsset.ownerId = this.userId // We allow the caller to set this: Main scenario is 'Create As Member Of Project'
      dstAsset.dn_ownerName = username
    }

    if (this.userId === dstAsset.ownerId)
    {
      if (opts.projectNames && opts.projectNames.length === 1)
      {
        const newAzzetProjectName = opts.projectNames[0]
        if (!validate.projectName(newAzzetProjectName))
          throw new Meteor.Error(500, "Invalid Project Name to Fork Asset to")
        dstAsset.projectNames.push(opts.projectNames[0])
      }
    }
    else
    {
      if (!opts.projectNames || opts.projectNames.length === 0 || opts.projectNames.length > 1 || opts.projectNames[0] === "")
        throw new Meteor.Error(401, "Must set exactly one ProjectName when forking an Asset into another User's context")

      console.log(`TODO #insecure# check that user '${username}' is really part of project '${dstAsset.projectNames[0]}' `)
      // CHECK THEY REALLY CAN DO THIS.
      // Is this.userId in Project.memberList for   project.ownerName === data.ownerName && project.name === data.projectNames[0]
      // ALSO CHECK that USERNAME AND USERID MATCH
    }

    const newDocId = Azzets.insert(dstAsset)

    console.log(`  [Azzets.fork]  "${dstAsset.name}"  #${newDocId}  Kind=${dstAsset.kind}  Owner=${username}`)
    Meteor.call('Slack.Assets.create', username, dstAsset.kind, dstAsset.name, newDocId)

    // TODO - update parent asset
    Azzets.update({
      _id: srcId
    }, {
      $push: {
        forkChildren: {
          assetId: newDocId,
          forkDate: now,
          forkedByUserId: this.userId,
          forkedByUserName: username
        }
      }
    })

    dstAsset._id = newDocId
    return {
      newId: newDocId,
      newAssetNoC2: _.omit(dstAsset, 'content2')
    }
  }
})
