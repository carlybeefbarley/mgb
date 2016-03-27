import {Azzets} from '../schemas';
import { check, Match } from 'meteor/check';
var schema = {
  _id: String,

  createdAt: Date,
  updatedAt: Date,

  teamId: String,     // team owner user id (FOR FUTURE USE)
  ownerId: String,    // owner user id

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
                      //   data-uri base 64 - for graphic
  content2: Object,
  thumbnail: String,  // data-uri base 64 of thumbnail image

  //various flags
  isCompleted: Boolean,
  isDeleted: Boolean,
  isPrivate: Boolean
};


// Info on each kind of asset, as the UI cares about it
// .icon is as defined in http://semantic-ui.com/elements/icon.html
export const AssetKinds = {
  "search":  { name: "Search",  longName: "Search query",    icon: "find", description: "Saved search query" },
  "graphic": { name: "Graphic", longName: "Graphic",         icon: "file image outline", description: "Images, Sprites, tiles, animations, backgrounds etc" },
  "palette": { name: "Palette", longName: "Color Palette",   icon: "block layout", description: "Color palette" },
  "map":     { name: "Map",     longName: "Game Level Map",  icon: "marker", description: "Map used in a game" },
  "code":    { name: "Code",    longName: "Code Script",     icon: "puzzle", description: "Source code script" },
  "bug":     { name: "Bug",     longName: "Bug Report",      icon: "bug",    description: "Report and status of a problem (aka bug)" },
  "cutscene":{ name: "Cutscene",longName: "Cut Scene",       icon: "spinner",description: "Cut scene used in a game" },
  "audio":   { name: "Audio",   longName: "Audio sound",     icon: "announcement", description: "Sound Effect, song, voice etc"},
  "game":    { name: "Game",    longName: "Game definition", icon: "gamepad", description: "Game rules and definition"},
  // Helper function that handles unknown asset kinds and also appends ' icon' for convenience
  getIconClass: function (key) { return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].icon : "warning sign") + " icon"},
  getLongName:  function (key) { return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].longName : "Unknown Asset Kind")}
};

export const AssetKindKeys = Object.keys(AssetKinds);  // For convenience.

Meteor.methods({

  "Azzets.create": function(data) {
    var docId;
    if (!this.userId) throw new Meteor.Error(401, "Login required");

    data.ownerId = this.userId;
    if (Meteor.isServer)
    {
      // TODO: Do we have the current User/profile to hand instead of looking it up?
      let ownerUser = Meteor.users.findOne(data.ownerId);
      data.dn_ownerName = ownerUser ? ownerUser.profile.name : "(Unknown)";
      console.log(`TRACE: denormalized asset.OwnerName on create as ${data.dn_ownerName}`)
    }
    data.createdAt = new Date();
    data.updatedAt = new Date();
    data.content = "";
    data.thumbnail = "";
    data.content2 = {};

    check(data, _.omit(schema, '_id'));

    docId = Azzets.insert(data);

    console.log(`  [Azzets.create]  #${docId}  kind=${data.kind}  owner:`, data.dn_ownerName || "(no_ownerName)");
    return docId;
  },

  "Azzets.update": function(docId, canEdit, data) {   // TODO:DGOLDS Asset.___
    var count, selector;
    var optional = Match.Optional;

    check(docId, String);
    if (!this.userId)
      throw new Meteor.Error(401, "Login required");

    // TODO: Move this access check to be server side..
    //   Or check publications have correct deny rules.
    //   See comment below for selector = ...
    if (!canEdit)
      throw new Meteor.Error(401, "You don't have permission to edit this.");

    data.updatedAt = new Date();

    // whitelist what can be updated
    check(data, {
      updatedAt: schema.updatedAt,
//    dn_ownerName: optional(schema.dn_ownerName),    // may do this lazily in future?

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

    console.log(`  [Azzets.update] (${count}) #${docId}  kind=${data.kind}  owner:`, data.dn_ownerName ); // These fields might not be provided for updates

    return count;
  },

});
