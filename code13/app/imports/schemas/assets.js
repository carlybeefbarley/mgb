
// This file must be imported by main_server.js so that the Meteor method can be registered


import {Azzets} from '../schemas';
import { check, Match } from 'meteor/check';


var schema = {
  _id: String,

  createdAt: Date,
  updatedAt: Date,

  teamId: String,       // team owner user id (FOR FUTURE USE)
  ownerId: String,      // owner user id
  projectNames: [String],   // Project Name (scoped to owner). Case sensitive

  // Some denormalized information that saves us from joins with big tables
  // for commonly used but very stable data - best example is user name
  dn_ownerName: String, // User.profile.name from userId at last asset create/update
                        // ::MAINTAIN:: any user-profile-name rename function will need to update these
                        // ::MIGRATE::  assets created prior to 222016 do not have this so any render code
                        //              must fallback to user#userid

  //the actual asset information
  name: String,       // Asset's name
  kind: String,       // Asset's kind (image, map, etc)
  text: String,       // A description field
  content: String,    // depends on asset type
  content2: Object,   // THIS IS NOT IN PREVIW DOWNLOADS..TODO: Move some small but widely needed stuff like size, num frames to another field like content
  thumbnail: String,  // data-uri base 64 of thumbnail image

  //various flags
  isCompleted: Boolean,
  isDeleted: Boolean,
  isPrivate: Boolean
};


// Info on each kind of asset, as the UI cares about it
// .icon is as defined in http://semantic-ui.com/elements/icon.html
export const AssetKinds = {
//  "search":  { name: "Search",  disable: true,  longName: "Search query",    icon: "find", description: "Saved search query" },
  "palette": { name: "Palette", disable: true,  longName: "Color Palette",   icon: "block layout", description: "Color palette" },
  "graphic": { name: "Graphic", disable: false, longName: "Graphic",         icon: "file image outline", description: "Images, Sprites, tiles, animations, backgrounds etc" },
  "map":     { name: "Map",     disable: false, longName: "Game Level Map",  icon: "marker", description: "Map/Level used in a game" },
  "physics": { name: "Physics", disable: true,  longName: "Physics Config",  icon: "rocket", description: "Physics configuration" },
  "code":    { name: "Code",    disable: false, longName: "Code Script",     icon: "puzzle", description: "Source code script" },
  "cheatsheet": { name: "Cheatsheet", disable: true, longName: "Cheat Sheet",icon: "student", description: "Cheat Sheet to help reember useful stuff" },
  "cutscene":{ name: "Cutscene",disable: true,  longName: "Cut Scene",       icon: "file video outline", description: "Cut scene used in a game" },
  "audio":   { name: "Audio",   disable: true,  longName: "Audio sound",     icon: "file audio outline", description: "Sound Effect, song, voice etc"},
  "game":    { name: "Game",    disable: true,  longName: "Game definition", icon: "gamepad", description: "Game rules and definition"},
  "_mgbui":  { name: "MGB UI",  disable: false, longName: "MGB UI Mockup",   icon: "code", description: "HTML using Semantic UI for mocking up MGB UI" },
  // Helper function that handles unknown asset kinds and also appends ' icon' for convenience
  getIconClass: function (key) { return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].icon : "warning sign") + " icon"},
  getLongName:  function (key) { return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].longName : "Unknown Asset Kind")},
  getName:  function (key) { return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].name : "Unknown Asset Kind")}
};

// Suggested separator to be used for query.kinds. Note that "," and "+" and others can get messy
// due to url encoding schemes. The safest ones are - _ . and ~
//  TODO: Add an assert to ensure that this character is NOT one of the AssetKinds keys!
//  NOTE - this is used in our URLs, so changing this character would break existing query strings with a set of kinds (e.g as used in the assetList ui) 
export const safeAssetKindStringSepChar = "-"   
export const AssetKindKeysALL = Object.keys(AssetKinds);  // For convenience. This gets ALL keys (including functions and disabled)

// All valid Asset kinds that are enabled for all users
export const AssetKindKeys = _.filter(AssetKindKeysALL, (k) => {
  return (typeof(AssetKinds[k]) !== 'function' && AssetKinds[k].disable !== true) 
});

// All valid Asset kinds including disabled ones
export const AssetKindKeysIncludingDisabled = _.filter(AssetKindKeysALL, (k) => {
  return (typeof(AssetKinds[k]) !== 'function') 
});


/** This is intneded for use by publications.js and any Meteor.subscribe calls
 * 
 */
export function AssetMakeSelector(
                      userId, 
                      selectedAssetKinds, 
                      nameSearch, 
                      projectName=null, 
                      showDeleted=false, 
                      showStable=false) 
{
  let selector = {
    isDeleted: showDeleted,
  }  

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


Meteor.methods({

  "Azzets.create": function(data) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required");      // TODO: Better access check
      
    const now = new Date();
    data.createdAt = now
    data.updatedAt = now
    data.ownerId = this.userId
    data.dn_ownerName = Meteor.user().profile.name;
    data.content = "";
    data.projectNames = [];
    data.thumbnail = "";
    data.content2 = {};

    check(data, _.omit(schema, '_id'));

    let docId = Azzets.insert(data);

    console.log(`  [Azzets.create]  "${data.name}"  #${docId}  Kind=${data.kind}  Owner=${data.dn_ownerName}`);
    return docId;
  },

  "Azzets.update": function(docId, canEdit, data) {
    var count, selector;
    var optional = Match.Optional;

    check(docId, String);
    if (!this.userId)
      throw new Meteor.Error(401, "Login required");

    // TODO: Move this access check to be server side..
    //   Or check publications have correct deny rules.
    //   See comment below for selector = ...
    if (!canEdit)
      throw new Meteor.Error(401, "You don't have permission to edit this.");   //TODO - make this secure,

    data.updatedAt = new Date();
    
    // whitelist what can be updated
    check(data, {
      updatedAt: schema.updatedAt,
//    dn_ownerName: optional(schema.dn_ownerName),    // may do this lazily in future?
      projectNames: optional(schema.projectNames),   // This was introduced later so we don't force it yet
      name: optional(schema.name),
      kind: optional(schema.kind),
      text: optional(schema.text),
      content: optional(schema.content),
      content2: optional(schema.content2),
      thumbnail: optional(schema.thumbnail),

      isCompleted: optional(schema.isCompleted),
      isDeleted: optional(schema.isDeleted),
      isPrivate: optional(schema.isPrivate)
    });

    // if caller doesn't own doc, update will fail because fields like ownerId won't match
    selector = {_id: docId};

    count = Azzets.update(selector, {$set: data});

    console.log(`  [Azzets.update]  (${count}) #${docId}  Kind=${data.kind}  Owner=${data.dn_ownerName}`); // These fields might not be provided for updates

    return count;
  },
  
  

});
