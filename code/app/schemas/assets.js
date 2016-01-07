import {Azzets} from '../schemas';

var schema = {
  _id: String,
  createdAt: Date,
  updatedAt: Date,
  teamId: String, //team owner user id
  ownerId: String, // owner user id

  //the actual asset information
  name: String,   // Asset's name
  kind: String,   // Asset's kind (image, map, etc)
  text: String,   // [TODO:DGOLDS].. Will rename as CONTENT

  //various flags
  isCompleted: Boolean,
  isDeleted: Boolean,
  isPrivate: Boolean
};


export const AssetKinds = {
  "query": "Asset Query",
  "spriteSet": "Sprite Set",
  "map": "Game Map",
  "game": "Game Definition"
};

export const AssetKindKeys = Object.keys(AssetKinds);  // For convenience.

Meteor.methods({

  "Azzets.create": function(data) {
    var docId;
    if (!this.userId) throw new Meteor.Error(401, "Login required");

    data.ownerId = this.userId;
    data.createdAt = new Date();
    data.updatedAt = new Date();

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
