// ASSETS

// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Azzets, Projects } from '/imports/schemas'
import { check, Match } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'

import { defaultWorkStateName, makeWorkstateNamesArray } from '/imports/Enums/workStates'
import { defaultAssetLicense } from '/imports/Enums/assetLicenses'

import { AssetKinds } from './assets/assetKinds'
export { AssetKinds }

import { canUserEditAssetIfUnlocked } from '/imports/schemas/roles'

import { projectMakeSelector } from './projects'

const optional = Match.Optional

var schema = {
  _id: String,

  createdAt: Date, // Must be set when created and never changed
  updatedAt: Date, // Must be altered for any change that should be pushed to clients. See assetFetchers.js

  // TODO - needed to fix the annoying sort order issues
  //   contentChangedAt: Date,  // A weaker change-timestamp that is used for changes that should not alter sorts - e.g. lock/unlock or heart/unheart
  // // ***TODO: MIGRATION Need to duplicate all updatedAt -> contentChangedAt

  //teamId: String,       // team owner user id (NOT USED. TODO: REMOVE FROM DB RECORDS)
  ownerId: String, // Owner user id
  projectNames: [String], // Project Name (scoped to owner). Case sensitive

  // Some denormalized information that saves us from joins with big tables
  // for commonly used but very stable data - best example is user name
  dn_ownerName: String, // User.profile.name from userId at last asset create/update.
  // See /app/DeveloperDocs/AvoidingServerSideJoins.md for reasoning
  // ::MAINTAIN:: any user-profile-name rename function will need to update these
  // ::MIGRATE::  assets created prior to 222016 do not have this so any render code
  //              must fallback to user#userid

  //the actual asset information
  name: String, // Asset's name (Note: This is NOT necessarily unique even for the same owner+kind)
  kind: String, // Asset's kind (image, map, etc)
  text: String, // A description field

  // skillPath is a dotted path to SkillNodes
  // currently skillPath is used only for code tutorials which has automated tests
  // if skillPath is present then codeEditor shows code challenge section and offers to run tests
  // added 2/22/2017
  skillPath: String, // linked to SkillNodes. For example code.js.lang. This is OPTIONAL

  // License information. See TermsOfService.js for description of what a missing license means
  // Ideally this will be one of the well-known license tags we define in assetLicenses.js.
  assetLicense: String, // A license that covers this asset.

  workState: String, // A value matching a key from workStates.js
  content: String, // depends on asset type (I THINK THIS IS DEAD AND WAS REPLACED BY CONTENT2)
  content2: Object, // THIS IS *NOT* IN PREVIEW SUBSCRIPTIONS (see publications.js) since it is huge ..TODO: Move some small but widely needed stuff like size, num frames to another field: metadata
  thumbnail: String, // Can be data-uri base 64 of thumbnail image (for example "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==") OR a link to an external URL

  // Fork information
  forkChildren: Array, // Array of peer direct children
  forkParentChain: Array, // Array of parent forks

  //heartedBy an array of userIds that represents people who hearted an asset
  heartedBy: optional(Array),
  heartedBy_count: optional(Number), //just how many people have hearted something

  // Metadata field wwas added 10/29/2016 so earlier objects do NOT have it.
  // The 'metdata' field is intended for a SMALL subset of data that is important for good asset-preview (previews exclude 'content2').
  // The fields are asset-kind-specific. Examples of metadata would be
  //   graphic: framecounts, image sizes
  //   game:    playCounts,  etc.
  //   actor:   actorTypeIndex,

  metadata: Object,

  // The isUnconfirmedSave field is used to disambiguate pending vs saved data on the client.
  // See https://www.discovermeteor.com/blog/advanced-latency-compensation/
  isUnconfirmedSave: Boolean, // This is set on client as True (isSimulation) and will have that value until the server responds with the authoritative data - This is set on server as False (isSimulation)

  // Various Asset flags
  isCompleted: Boolean, // This supports the 'is stable' flag
  isDeleted: Boolean, // This is a soft marked-as-deleted indicator
  isPrivate: Boolean, // Not currently used

  // The su fields can only be changed by a superAdmin User.. They typically relate to workflows or system counts
  suIsBanned: Boolean, // Optional. If true, then this image has been banned. See suFlagId for the flagging workflow
  suFlagId: String, // Optional. (TODO) non-null / non-empty if there is a Flag record for this message (See Flags.js)
}

// safeAssetKindStringSepChar is the separator to be used in the URL for encoding query.kinds
//     Note that "," and "+" and others can get messy due to url encoding schemes.
//     The safest ones are - _ . and ~ and so we picked _ at random-ish
//   TODO: Add an Assert to ensure that this character is NOT in ANY of the AssetKinds keys
//   NOTE - this is used in our URLs, so changing this character would break existing
//          query strings with a set of kinds (e.g as used in the assetList ui)
export const safeAssetKindStringSepChar = '-'
export const AssetKindKeysALL = Object.keys(AssetKinds) // For convenience. This gets ALL keys (including functions and disabled)

// map {actor:"actor"} - to avoid direct strings
export const AssetKindEnum = {}
// All valid Asset kinds that are enabled for all users
export const AssetKindKeys = _.filter(AssetKindKeysALL, k => {
  const shouldFilter = typeof AssetKinds[k] !== 'function' && AssetKinds[k].disable !== true
  if (shouldFilter) AssetKindEnum[k] = k
  return shouldFilter
})

export const isAssetKindsStringComplete = ks =>
  ks.split(safeAssetKindStringSepChar).length === AssetKindKeys.length

/** This is intended for use by publications.js and any Meteor.subscribe calls
 *  assetMakeSelector
 *
 * @export
 * @param {string} userId
 * @param {Array} selectedAssetKinds
 * @param {string} nameSearch. Null, undefined, or '' will be ignored. Otherwise it will be used as part of a case-insensitive word search using a regex
 * @param {string} [projectName=null]
 * @param {boolean} [showDeleted=false]
 * @param {boolean} [showStable=false]
 * @param {boolean} [showChallengeAssets=false]
 * @returns
 */
export function assetMakeSelector(
  userId,
  selectedAssetKinds,
  nameSearch,
  projectName = null, // '_' means 'not in a project'.   null means In any/all projects
  showDeleted = false,
  showStable = false,
  hideWorkstateMask = 0,
  showChallengeAssets = false,
) {
  const selector = {
    isDeleted: Boolean(showDeleted),
    //    skillPath: { '$exists': Boolean(showChallengeAssets) }
  }

  // TEMP HACK UNTIL DB CLEANED UP

  if (showChallengeAssets) selector.skillPath = { $nin: ['', null] }
  else selector.skillPath = { $in: ['', null] }

  if (projectName === '_') selector['projectNames'] = []
  else if (projectName && projectName.length > 0) selector['projectNames'] = projectName

  if (
    showStable === true // This means ONLY show stable assets
  )
    selector['isCompleted'] = showStable

  if (userId && userId !== -1) selector['ownerId'] = userId

  if (selectedAssetKinds && selectedAssetKinds.length > 0) selector['kind'] = { $in: selectedAssetKinds }

  if (hideWorkstateMask > 0) {
    const wsNamesToLookFor = makeWorkstateNamesArray(hideWorkstateMask)
    selector['workState'] = { $in: wsNamesToLookFor }
  }

  if (nameSearch && nameSearch.length > 0) {
    // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
    selector['name'] = { $regex: new RegExp('^.*' + nameSearch, 'i') }
  }

  return selector
}

export const assetSorters = {
  edited: { updatedAt: -1 },
  created: { createdAt: -1 },
  name: { name: 1 },
  loves: { heartedBy_count: -1 },
  kind: { kind: 1 },
}

export const gameSorters = {
  edited: { updatedAt: -1 },
  created: { createdAt: -1 },
  loves: { heartedBy_count: -1 },
  name: { name: 1 },
  plays: { 'metadata.playCount': -1 },
}

// This is used by the publication. It's the merge of assetSorters, gameSorters, ...
export const allSorters = {
  edited: { updatedAt: -1 },
  created: { createdAt: -1 },
  loves: { heartedBy_count: -1 },
  name: { name: 1 },
  kind: { kind: 1 },
  plays: { 'metadata.playCount': -1 },
}

export const isValidCodeGame = g =>
  g &&
  g.metadata &&
  (g.metadata.gameType === 'codeGame' && g.metadata.startCode && g.metadata.startCode !== '')

export const isValidActorMapGame = g =>
  g &&
  g.metadata &&
  g.metadata.gameType === 'actorGame' &&
  g.metadata.startActorMap &&
  g.metadata.startActorMap !== ''

Meteor.methods({
  'Azzets.create'(data) {
    checkIsLoggedInAndNotSuspended()
    const username = Meteor.user().profile.name
    const now = new Date()

    if (!data.ownerId) data.ownerId = this.userId // We allow the caller to set this: Main scenario is 'Create As Member Of Project'
    if (!data.dn_ownerName) data.dn_ownerName = username

    if (!_.isUndefined(data.suIsBanned) || !_.isUndefined(data.suFlagId)) checkMgb.checkUserIsSuperAdmin()

    if (this.userId !== data.ownerId) {
      if (
        !data.projectNames ||
        data.projectNames.length === 0 ||
        data.projectNames.length > 1 ||
        data.projectNames[0] === ''
      )
        throw new Meteor.Error(
          401,
          "Must set exactly one ProjectName when creating Asset in another User's context",
        )

      if (Meteor.isServer) {
        console.log(
          `TODO #insecure# check that user '${username}' is really part of project '${data
            .projectNames[0]}' `,
        )
        // CHECK THEY REALLY CAN DO THIS.
        // Is this.userId in Project.memberList for   project.ownerName === data.ownerName && project.name === data.projectNames[0]
        // ALSO CHECK that USERNAME AND USERID MATCH
      }
    }
    data.name = _.trim(data.name)
    checkMgb.assetName(data.name)

    if (data.text) {
      data.text = _.trim(data.text)
      checkMgb.assetDescription(data.text)
    }
    if (Meteor.isServer) Meteor.call('Azzets.Name.isProfane', data.name)

    data.createdAt = data.createdAt || now // -- useful for asset import from MGB1
    data.updatedAt = now
    // Note data.skillPath is optional. not-exists means not part of a SkillPath
    data.workState = data.workState || defaultWorkStateName
    data.content = '' // This is stale. Can be removed one day
    data.text = _.trim(data.text) || '' // Added to schema 6/18/2016. Earlier assets do not have this field if not edited
    if (!data.projectNames) data.projectNames = []
    data.thumbnail = data.thumbnail || ''
    data.metadata = data.metadata || {}
    data.assetLicense = data.assetLicense || defaultAssetLicense
    data.isUnconfirmedSave = this.isSimulation
    // TODO: this will get moved one day. See #34
    data.content2 = data.content2 || {}

    check(data, {
      ...{ skillPath: optional(schema.skillPath) },
      ..._.omit(schema, ['_id', 'forkChildren', 'forkParentChain', 'skillPath', 'suIsBanned', 'suFlagId']),
    })

    let docId = Azzets.insert(data)

    if (Meteor.isServer) {
      console.log(`  [Azzets.create]  "${data.name}"  #${docId}  Kind=${data.kind}  Owner=${username}`)
      Meteor.call('Slack.Assets.create', username, data.kind, data.name, docId)
    }
    return docId
  },

  'Azzets.toggleHeart'(docId, userId) {
    checkIsLoggedInAndNotSuspended()
    check(docId, String)
    check(userId, String)
    if (userId !== this.userId) throw new Meteor.Error(404, 'User Id does not match current user Id')
    const selector = { _id: docId }
    const asset = Azzets.findOne(selector, { fields: { heartedBy: 1, heartedBy_count: 1 } })
    if (!asset) throw new Meteor.Error(404, 'Asset Id does not exist')
    const currUserLoves = _.includes(asset.heartedBy, userId)
    var newHeartedBy
    if (!currUserLoves) newHeartedBy = _.union(asset.heartedBy, [userId])
    else newHeartedBy = _.without(asset.heartedBy, userId)

    const newData = {
      $set: {
        heartedBy: newHeartedBy,
        heartedBy_count: newHeartedBy.length,
        updatedAt: new Date(),
      },
    }
    const count = Azzets.update(selector, newData)
    if (Meteor.isServer) console.log(`  [Assets.toggleHeart]  (${count}) #${docId} '${asset.name}'`)

    return { count, newLoveState: !currUserLoves }
  },

  // This does not allow changes to the su* fields. It is much simpler
  // and more robust to handle those cases in a simpler, privileged path instead of
  // complicating the general update path
  'Azzets.update'(docId, canEdit, data) {
    checkIsLoggedInAndNotSuspended()
    check(docId, String)
    // TODO: Move this access check to be server side..
    //   Or check publications have correct deny rules.
    //   See comment below for selector = ...
    if (!canEdit) throw new Meteor.Error(401, "You don't have permission to edit this.") //TODO - make this secure. #insecure#

    data.updatedAt = new Date()
    data.isUnconfirmedSave = this.isSimulation

    if (data.name) {
      data.name = _.trim(data.name)
      checkMgb.assetName(data.name)
    }

    if (data.text) {
      data.text = _.trim(data.text)
      checkMgb.assetDescription(data.text)
    }

    // whitelist what can be updated. Note that su* are INTENTIONALLY excluded.
    check(data, {
      updatedAt: schema.updatedAt,
      //    dn_ownerName: optional(schema.dn_ownerName),    // may do this lazily in future?
      projectNames: optional(schema.projectNames), // This was introduced later so we don't force it yet
      name: optional(schema.name),
      kind: optional(schema.kind),
      text: optional(schema.text),
      skillPath: optional(schema.skillPath),
      workState: optional(schema.workState),
      assetLicense: optional(schema.assetLicense),
      content: optional(schema.content),
      content2: optional(schema.content2),
      thumbnail: optional(schema.thumbnail),
      metadata: optional(schema.metadata),
      isUnconfirmedSave: optional(schema.isUnconfirmedSave),

      isCompleted: optional(schema.isCompleted),
      isDeleted: optional(schema.isDeleted),
      isPrivate: optional(schema.isPrivate),
    })

    const selector = { _id: docId }
    // client can have empty minimongo and fail event when it shouldn't - so do extra checks only on server side
    if (Meteor.isServer) {
      // access DB only after data check
      // get real asset and check if user can REALLY edit asset
      const asset = Azzets.findOne(selector, {
        fields: { ownerId: 1, projectNames: 1, isCompleted: 1, suFlagId: 1, suIsBanned: 1 },
      })
      if (asset.suFlagId) throw new Meteor.Error(401, 'Cannot edit flagged asset')
      if (asset.suIsBanned === true) throw new Meteor.Error(401, 'Cannot edit banned asset')

      const userProjects = Projects.find(projectMakeSelector(this.userId), {
        fields: { name: 1, ownerId: 1 },
      }).fetch()
      if (!canUserEditAssetIfUnlocked(asset, userProjects, Meteor.user()))
        throw new Meteor.Error(401, "You don't have permission to edit this asset. canUserEditAsset:failed")

      if (asset.isCompleted && data.isCompleted !== false)
        throw new Meteor.Error(401, 'You cannot edit locked asset.')
    }

    // if caller doesn't own doc, update will fail because fields like ownerId won't match

    const count = Azzets.update(selector, { $set: data })

    if (Meteor.isServer)
      console.log(`  [Azzets.update]  (${count}) #${docId}  Kind=${data.kind}  Owner=${data.dn_ownerName}`) // These fields might not be provided for updates

    return count
  },
})
