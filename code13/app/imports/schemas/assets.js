// ASSETS

// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Azzets } from '/imports/schemas'
import { roleSuperAdmin } from '/imports/schemas/roles'
import { check, Match } from 'meteor/check'
import { defaultWorkStateName } from '/imports/Enums/workStates'
import { defaultAssetLicense } from '/imports/Enums/assetLicenses'

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
  content2: Object,   // THIS IS NOT IN PREVIEW SUBSCRIPTIONS (see publications.js) ..TODO: Move some small but widely needed stuff like size, num frames to another field such as 'content'
  thumbnail: String,  // data-uri base 64 of thumbnail image (for example "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")

  isUnconfirmedSave: Boolean,   // This is Set on client as True (isSimulation). This is set on server as False (isSimulation)

  // Various Asset flags
  isCompleted: Boolean,     // This supports the 'is stable' flag
  isDeleted:   Boolean,     // This is a soft marked-as-deleted indicator
  isPrivate:   Boolean      // Not currently used
}

const UAKerr = "Unknown Asset Kind"     // An error message string used a few places in this file.


// Info on each kind of asset, as the UI cares about it
// .icon is as defined in http://semantic-ui.com/elements/icon.html

export const AssetKinds = {
  "palette": {
    name: "Palette",
    selfPlural: false,
    disable: true,
    longName: "Color Palette",
    icon: "block layout",
    requiresUserRole: null,
    description: "Color palette"
  },
  "graphic": {
    name: "Graphic",
    selfPlural: false,
    disable: false,
    longName: "Graphic",
    icon: "image",
    requiresUserRole: null,
    description: "Images, Sprites, tiles, animations, backgrounds etc"
  },
  "actor": {
    name: "actor",
    selfPlural: false,
    disable: false,
    longName: "Actor",
    icon: "actor child",
    requiresUserRole: null,
    description: "Mgb v1 actors"
  },
  "actormap": {
    name: "actorMap",
    selfPlural: false,
    disable: false,
    longName: "Map using Actors - makes games without coding",
    icon: "map",
    requiresUserRole: null,
    description: "MGB_v1 Map/Level used in a game"
  },
  "map": {
    name: "Map",
    selfPlural: false,
    disable: false,
    longName: "Game Level Map (TMX style for game coding)",
    icon: "map outline",
    requiresUserRole: null,
    description: "Map/Level used in a game"
  },
  "physics": {
    name: "Physics",
    selfPlural: true,
    disable: true,
    longName: "Physics Config",
    icon: "rocket",
    requiresUserRole: null,
    description: "Physics configuration"
  },
  "code": {
    name: "Code",
    selfPlural: true,
    disable: false,
    longName: "Code Script",
    icon: "code ",
    requiresUserRole: null,    
    description: "Source code script"
  },
  "doc": {
    name: "Doc",
    selfPlural: false,
    disable: true,              // Disabled 9/23/2016 by dgolds
    longName: "Document",
    icon: "file text outline",
    requiresUserRole: roleSuperAdmin,    
    description: "Text Document"
  },
  "cheatsheet": {
    name: "Cheatsheet",
    selfPlural: false,
    disable: true,
    longName: "Cheat Sheet",
    icon: "student",
    requiresUserRole: null,
    description: "Cheat Sheet to help remember useful stuff"
  },
  "cutscene": {
    name: "Cutscene",
    selfPlural: false,
    disable: true,
    longName: "Cut Scene",
    icon: "file video outline",
    requiresUserRole: null,
    description: "Cut scene used in a game"
  },
  "audio": {            // TODO: probably get rid of this since we have 'sound' and 'music' instead
    name: "Audio",
    selfPlural: true,
    disable: true,
    longName: "Audio sound",
    icon: "file audio outline",
    requiresUserRole: null,
    // description: "Sound Effect, song, voice etc"
    description: "Sound Effect, song, voice etc"
  },
  "sound": {
    name: "Sound",
    selfPlural: true,
    disable: false,
    longName: "Sound",
    icon: "volume up",
    requiresUserRole: null,
    description: "Sound Effects"
  },
  "music": {
    name: "Music",
    selfPlural: true,
    disable: false,
    longName: "Music",
    icon: "music",
    requiresUserRole: null,
    description: "Background music"
  },
  "game": {
    name: "Game",
    selfPlural: false,
    disable: true,
    longName: "Game definition",
    icon: "gamepad",
    requiresUserRole: null,
    description: "Game rules and play statistics"
  },
  // PURGED FROM DB 9/24/2016
  // "_mgbui": {
  //   name: "MGB UI",
  //   selfPlural: true,
  //   disable: true,      // Disabled 9/23/2016 by dgolds since we now have stardust!
  //   longName: "MGB UI Mockup",
  //   icon: "code",
  //   requiresUserRole: roleSuperAdmin,    
  //   description: "(MGB Dev Team Only) MGB UI Prototyping tool"
  // },
  // Helper function that handles unknown asset kinds and also appends ' icon' for convenience
  getIconClass: function(key) {
    return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].icon : "warning sign") + " icon"
  },
  getLongName: function(key) {
    return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].longName : UAKerr)
  },
  getDescription: function(key) {
    return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].description : UAKerr)
  },
  getName: function(key) {
    return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].name : UAKerr)
  },
  getNamePlural: function(key) {
    return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].name + (AssetKinds[key].selfPlural ? "" : "s") : UAKerr)
  }
}

// safeAssetKindStringSepChar is the separator to be used in the URL for encoding query.kinds    
//     Note that "," and "+" and others can get messy due to url encoding schemes. 
//     The safest ones are - _ . and ~ and so we picked _ at random-ish
//   TODO: Add an Assert to ensure that this character is NOT in ANY of the AssetKinds keys
//   NOTE - this is used in our URLs, so changing this character would break existing 
//          query strings with a set of kinds (e.g as used in the assetList ui) 
export const safeAssetKindStringSepChar = "-"
export const AssetKindKeysALL = Object.keys(AssetKinds)  // For convenience. This gets ALL keys (including functions and disabled)

// All valid Asset kinds that are enabled for all users
export const AssetKindKeys = _.filter(AssetKindKeysALL, (k) => {
  return (typeof(AssetKinds[k]) !== 'function' && AssetKinds[k].disable !== true) 
})

// All valid Asset kinds including disabled ones
export const AssetKindKeysIncludingDisabled = _.filter(AssetKindKeysALL, (k) => {
  return (typeof(AssetKinds[k]) !== 'function') 
})

/** This is intended for use by publications.js and any Meteor.subscribe calls
 */
export function assetMakeSelector(
                      userId, 
                      selectedAssetKinds, 
                      nameSearch, 
                      projectName=null, 
                      showDeleted=false, 
                      showStable=false) 
{
  let selector = { isDeleted: showDeleted }  

  if (projectName && projectName.length > 0)
    selector["projectNames"] = projectName

  if (showStable === true)  // This means ONLY show stable assets
    selector["isCompleted"] = showStable

  if (userId && userId !== -1)
    selector["ownerId"] = userId
    
  if (selectedAssetKinds && selectedAssetKinds.length > 0)
    selector["$or"] = _.map(selectedAssetKinds, (x) => { return { kind: x} } )  // TODO: Could use $in ?

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

Meteor.methods({
  "Azzets.create": function(data) {
    const username = Meteor.user().profile.name

    if (!data.ownerId) data.ownerId = this.userId                   // We allow the caller to set this: Main scenario is 'Create As Member Of Project'
    if (!data.dn_ownerName) data.dn_ownerName = username

    if (!this.userId)
      throw new Meteor.Error(401, "Login required")                 // TODO: Better access check

    if (this.userId !== data.ownerId)
    {
      if (!data.projectNames || data.projectNames.length === 0 || data.projectNames.length > 1 || data.projectNames[0] === "")
        throw new Meteor.Error(401, "Must exactly one ProjectName when creating Asset in another User's context")

      if (Meteor.isServer)
      {
        console.log(`TODO #insecure# check that user '${username}' is really part of project '${data.projectNames[0]}' `)
        // CHECK THEY REALLY CAN DO THIS.  
        // Is this.userId in Project.memberList for   project.ownerName === data.ownerName && project.name === data.projectNames[0]
        // ALSO CHECK that USERNAME AND USERID MATCH
      } 
    }

    const now = new Date()
    data.createdAt = data.createdAt || now    // -- useful for asset import from MGB1
    data.updatedAt = now
    data.workState = defaultWorkStateName
    data.content = ''                                // This is stale. Can be removed one day
    data.text = data.text || ''                      // Added to schema 6/18/2016. Earlier assets do not have this field if not edited
    if (!data.projectNames)
      data.projectNames = []
    data.thumbnail = data.thumbnail || ""
    data.assetLicense = data.assetLicense || defaultAssetLicense
    data.isUnconfirmedSave = this.isSimulation
    // TODO: this will get moved
    data.content2 = data.content2 || {}

    check(data, _.omit(schema, '_id'))

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
    
    // whitelist what can be updated
    check(data, {
      updatedAt: schema.updatedAt,
//    dn_ownerName: optional(schema.dn_ownerName),    // may do this lazily in future?
      projectNames: optional(schema.projectNames),   // This was introduced later so we don't force it yet
      name: optional(schema.name),
      kind: optional(schema.kind),
      text: optional(schema.text),
      workState: optional(schema.workState),
      assetLicense: optional(schema.assetLicense),
      content: optional(schema.content),
      content2: optional(schema.content2),
      thumbnail: optional(schema.thumbnail),
      isUnconfirmedSave: optional(schema.isUnconfirmedSave),

      isCompleted: optional(schema.isCompleted),
      isDeleted: optional(schema.isDeleted),
      isPrivate: optional(schema.isPrivate)
    })

    // if caller doesn't own doc, update will fail because fields like ownerId won't match
    selector = { _id: docId }
    count = Azzets.update(selector, { $set: data } )

    if (Meteor.isServer)      
      console.log(`  [Azzets.update]  (${count}) #${docId}  Kind=${data.kind}  Owner=${data.dn_ownerName}`) // These fields might not be provided for updates
    
    return count
  }
})
