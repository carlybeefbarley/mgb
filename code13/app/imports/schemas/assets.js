// ASSETS

// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Azzets } from '/imports/schemas'
import { check, Match } from 'meteor/check'
import { checkIsLoggedIn, checkMgb } from './checkMgb'

import { defaultWorkStateName } from '/imports/Enums/workStates'
import { defaultAssetLicense } from '/imports/Enums/assetLicenses'

import { AssetKinds } from './assets/assetKinds'
export { AssetKinds }

var schema = {
  _id: String,

  createdAt: Date,
  updatedAt: Date,

//teamId: String,       // team owner user id (NOT USED. TODO: REMOVE FROM DB RECORDS)
  ownerId: String,      // Owner user id
  projectNames: [String],   // Project Name (scoped to owner). Case sensitive

  // Some denormalized information that saves us from joins with big tables
  // for commonly used but very stable data - best example is user name
  dn_ownerName: String, // User.profile.name from userId at last asset create/update.
                        // See /app/DeveloperDocs/AvoidingServerSideJoins.md for reasoning
                        // ::MAINTAIN:: any user-profile-name rename function will need to update these
                        // ::MIGRATE::  assets created prior to 222016 do not have this so any render code
                        //              must fallback to user#userid

  //the actual asset information
  name: String,       // Asset's name
  kind: String,       // Asset's kind (image, map, etc)
  text: String,       // A description field

  // skillPath is a dotted path to SkillNodes
  // currently skillPath is used only for code tutorials which has automated tests
  // if skillPath is present then codeEditor shows code challenge section and offers to run tests
  // added 2/22/2017
  skillPath: String,  // linked to SkillNodes. For example code.js.lang

  // License information. See TermsOfService.js for description of what a missing license means
  assetLicense: String,    // A license that covers this asset. Ideally this will be one of the well-know license tags we define in assetLicenses.js.


// Intended future Data for cloning. These may all be missing/null:
  // clonedFromAssetId: String,        // An MGB Asset ID that we cloned this from
  // clonedFromAssetVer: String,       // Version of the Asset ID that we cloned this from
  // clonedFromAssetDate: String,      // Version of the Asset that we cloned this from (not yet implementable)
  // clonedFromOwnerId: String,        // The UsserId whowe cloned this from
  // clonedFromOwnerName: String,      // An asset id that we cloned this from
  // clonedFromExternalSource: String,

  workState: String,  // A value matching a key from workStates.js
  content: String,    // depends on asset type
  content2: Object,   // THIS IS NOT IN PREVIEW SUBSCRIPTIONS (see publications.js) ..TODO: Move some small but widely needed stuff like size, num frames to another field: metadata
  thumbnail: String,  // Can be data-uri base 64 of thumbnail image (for example "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==") OR a link to an external URL

  // Fork information
  forkChildren:    Array,   // Array of peer direct children
  forkParentChain: Array,   // Array of parent forks

  // Metadata field wwas added 10/29/2016 so earlier objects do NOT have it.
  // The 'metdata' field is intended for a SMALL subset of data that is important for good asset-preview (previews exclude 'content2').
  // The fields are asset-kind-specific. Examples of metadata would be
  //   graphic: framecounts, image sizes
  //   game:    playCounts,  etc.
  //   actor:   actorTypeIndex,

  metadata: Object,

  // The isUnconfirmedSave field is used to disambiguate pending vs saved data on the client.
  // See https://www.discovermeteor.com/blog/advanced-latency-compensation/
  isUnconfirmedSave: Boolean,   // This is set on client as True (isSimulation) and will have that value until the server responds with the authoritative data - This is set on server as False (isSimulation)

  // Various Asset flags
  isCompleted: Boolean,     // This supports the 'is stable' flag
  isDeleted:   Boolean,     // This is a soft marked-as-deleted indicator
  isPrivate:   Boolean      // Not currently used
}



// safeAssetKindStringSepChar is the separator to be used in the URL for encoding query.kinds
//     Note that "," and "+" and others can get messy due to url encoding schemes.
//     The safest ones are - _ . and ~ and so we picked _ at random-ish
//   TODO: Add an Assert to ensure that this character is NOT in ANY of the AssetKinds keys
//   NOTE - this is used in our URLs, so changing this character would break existing
//          query strings with a set of kinds (e.g as used in the assetList ui)
export const safeAssetKindStringSepChar = "-"
export const AssetKindKeysALL = Object.keys(AssetKinds)  // For convenience. This gets ALL keys (including functions and disabled)

// map {actor:"actor"} - to avoid direct strings
export const AssetKindEnum = {}
// All valid Asset kinds that are enabled for all users
export const AssetKindKeys = _.filter(AssetKindKeysALL, (k) => {
  const shouldFilter = (typeof(AssetKinds[k]) !== 'function' && AssetKinds[k].disable !== true)
  if (shouldFilter)
    AssetKindEnum[k] = k
  return shouldFilter
})

export const isAssetKindsStringComplete = ks => ks.split(safeAssetKindStringSepChar).length === AssetKindKeys.length

// All valid Asset kinds including disabled ones
export const AssetKindKeysIncludingDisabled = _.filter(AssetKindKeysALL, (k) => {
  return (typeof(AssetKinds[k]) !== 'function')
})

/** This is intended for use by publications.js and any Meteor.subscribe calls
 *  assetMakeSelector
 *
 * @export
 * @param {string} userId
 * @param {Array} selectedAssetKinds
 * @param {string} nameSearch
 * @param {string} [projectName=null]
 * @param {boolean} [showDeleted=false]
 * @param {boolean} [showStable=false]
 * @returns
 */
export function assetMakeSelector(
                      userId,
                      selectedAssetKinds,
                      nameSearch,
                      projectName=null,   // '_' means 'not in a project'.   null means In any/all projects
                      showDeleted=false,
                      showStable=false)
{
  let selector = { isDeleted: showDeleted }

  if (projectName === '_')
    selector["projectNames"] = []
  else if (projectName && projectName.length > 0)
    selector["projectNames"] = projectName

  if (showStable === true)  // This means ONLY show stable assets
    selector["isCompleted"] = showStable

  if (userId && userId !== -1)
    selector["ownerId"] = userId

  if (selectedAssetKinds && selectedAssetKinds.length > 0)
    selector["$or"] = _.map(selectedAssetKinds, x => ( { kind: x } ) )  // TODO: Could use $in ?

  if (nameSearch && nameSearch.length > 0)
  {
    // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
    selector["name"]= {$regex: new RegExp("^.*" + nameSearch, 'i')}
  }

  return selector
}

export const assetSorters = {
  "edited": { updatedAt: -1},
  "name":   { name: 1 },
  "kind":   { kind: 1 }
}

export const gameSorters = {
  "edited": { updatedAt: -1},
  "name":   { name: 1 },
  "plays":  { 'metadata.playCount': -1 }
}

// This is used by the publication. It's the merge of assetSorters, gameSorters, ...
export const allSorters = {
  "edited": { updatedAt: -1},
  "name":   { name: 1 },
  "kind":   { kind: 1 },
  "plays":  { 'metadata.playCount': -1 }
}


Meteor.methods({
  "Azzets.create": function(data) {
    const username = Meteor.user().profile.name
    const now = new Date()
    checkIsLoggedIn()

    if (!data.ownerId) 
      data.ownerId = this.userId                   // We allow the caller to set this: Main scenario is 'Create As Member Of Project'
    if (!data.dn_ownerName) 
      data.dn_ownerName = username

    if (this.userId !== data.ownerId)
    {
      if (!data.projectNames || data.projectNames.length === 0 || data.projectNames.length > 1 || data.projectNames[0] === "")
        throw new Meteor.Error(401, "Must set exactly one ProjectName when creating Asset in another User's context")

      if (Meteor.isServer)
      {
        console.log(`TODO #insecure# check that user '${username}' is really part of project '${data.projectNames[0]}' `)
        // CHECK THEY REALLY CAN DO THIS.
        // Is this.userId in Project.memberList for   project.ownerName === data.ownerName && project.name === data.projectNames[0]
        // ALSO CHECK that USERNAME AND USERID MATCH
      }
    }
    data.name = _.trim(data.name)
    checkMgb.assetName(data.name)

    if (data.text)
    {
      data.text = _.trim(data.text)
      checkMgb.assetDescription(data.text)
    }

    data.createdAt = data.createdAt || now    // -- useful for asset import from MGB1
    data.updatedAt = now
    data.skillPath = data.skillPath || ''
    data.workState = data.workState || defaultWorkStateName
    data.content = ''                                // This is stale. Can be removed one day
    data.text = _.trim(data.text) || ''                      // Added to schema 6/18/2016. Earlier assets do not have this field if not edited
    if (!data.projectNames)
      data.projectNames = []
    data.thumbnail = data.thumbnail || ''
    data.metadata = data.metadata || {}
    data.assetLicense = data.assetLicense || defaultAssetLicense
    data.isUnconfirmedSave = this.isSimulation
    // TODO: this will get moved
    data.content2 = data.content2 || {}

    check(data, _.omit(schema, ['_id', 'forkChildren', 'forkParentChain']))

    let docId = Azzets.insert(data)

    if (Meteor.isServer)
    {
      console.log(`  [Azzets.create]  "${data.name}"  #${docId}  Kind=${data.kind}  Owner=${username}`)
      Meteor.call('Slack.Assets.create', username, data.kind, data.name, docId)
    }
    return docId
  },

  "Azzets.update": function(docId, canEdit, data) {
    var count, selector
    var optional = Match.Optional
    checkIsLoggedIn()

    check(docId, String)
    if (!this.userId)
      throw new Meteor.Error(401, "Login required")

    // TODO: Move this access check to be server side..
    //   Or check publications have correct deny rules.
    //   See comment below for selector = ...
    if (!canEdit)
      throw new Meteor.Error(401, "You don't have permission to edit this.")   //TODO - make this secure,

    data.updatedAt = new Date()
    data.isUnconfirmedSave = this.isSimulation

    if (data.name)
    {
      data.name = _.trim(data.name)
      checkMgb.assetName(data.name)
    }

    if (data.text)
    {
      data.text = _.trim(data.text)
      checkMgb.assetDescription(data.text)
    }

    // whitelist what can be updated
    check(data, {
      updatedAt: schema.updatedAt,
//    dn_ownerName: optional(schema.dn_ownerName),    // may do this lazily in future?
      projectNames: optional(schema.projectNames),   // This was introduced later so we don't force it yet
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
      isPrivate: optional(schema.isPrivate)
    })

    // if caller doesn't own doc, update will fail because fields like ownerId won't match
    selector = { _id: docId }
    count = Azzets.update(selector, { $set: data } )

    if (Meteor.isServer) {
      console.log(`  [Azzets.update]  (${count}) #${docId}  Kind=${data.kind}  Owner=${data.dn_ownerName}`) // These fields might not be provided for updates
    }
    return count
  }
})
