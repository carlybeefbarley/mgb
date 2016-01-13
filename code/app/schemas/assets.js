import {Azzets} from '../schemas';

var schema = {
  _id: String,

  createdAt: Date,
  updatedAt: Date,

  teamId: String,     // team owner user id
  ownerId: String,    // owner user id

  //the actual asset information
  name: String,       // Asset's name
  kind: String,       // Asset's kind (image, map, etc)
  text: String,       // A description field
  content: String,    // depends on asset type
                      //   data-uri base 64 - for graphic
  thumbnail: String,  // data-uri base 64 of thumbnail image

  //various flags
  isCompleted: Boolean,
  isDeleted: Boolean,
  isPrivate: Boolean
};


// Info on each kind of asset, as the UI cares about it
// .icon is as defined in http://semantic-ui.com/elements/icon.html
export const AssetKinds = {
  "search":  { name: "Search",  icon: "find", description: "Saved search query" },
  "graphic": { name: "Graphic", icon: "file image outline", description: "Images, Sprites, tiles, animations, backgrounds etc" },
  "map":     { name: "Map",     icon: "marker", description: "Map used in a game" },
  "game":    { name: "Game",    icon: "gamepad", description: "Game rules and definition"},
  // Helper function that handles unknown asset kinds and also appends ' icon' for convenience
  getIconClass: function (key) { return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].icon : "warning sign") + " icon"}
};

export const AssetKindKeys = Object.keys(AssetKinds);  // For convenience.

Meteor.methods({

  "Azzets.create": function(data) {
    var docId;
    if (!this.userId) throw new Meteor.Error(401, "Login required");

    data.ownerId = this.userId;
    data.createdAt = new Date();
    data.updatedAt = new Date();
    data.content = "";
    data.thumbnail = "";

    check(data, _.omit(schema, '_id'));

    docId = Azzets.insert(data);

    console.log("[Azzets.create]", docId);
    return docId;
  },

  "Azzets.update": function(docId, canEdit, data) {   // TODO:DGOLDS Asset.___
    var count, selector;
    var optional = Match.Optional;

    check(docId, String);
    if (!this.userId) throw new Meteor.Error(401, "Login required");
    if (!canEdit) throw new Meteor.Error(401, "You don't have permission to edit this.");

    data.updatedAt = new Date();

    // whitelist what can be updated
    check(data, {
      updatedAt: schema.updatedAt,

      name: optional(schema.text),
      kind: optional(schema.text),
      text: optional(schema.text),
      content: optional(schema.text),
      thumbnail: optional(schema.text),

      isCompleted: optional(schema.isCompleted),
      isDeleted: optional(schema.isDeleted),
      isPrivate: optional(schema.isPrivate)
    });

    // if caller doesn't own doc, update will fail because fields won't match
    selector = {_id: docId};

    count = Azzets.update(selector, {$set: data});

    console.log("  [Azzets.update]", count, docId);
    return count;
  },

});
