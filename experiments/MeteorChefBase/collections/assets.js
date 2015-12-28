AssetsCollection = new Meteor.Collection( 'assets' );

AssetsCollection.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

AssetsCollection.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

let AssetsSchema = new SimpleSchema({
  "name": {
    type: String,
    label: "Asset name"
  },
  "kind": {
    type: String,                         // These will be strings that are part of the AssetKinds const defined below
    label: "Asset kind"
  },
  "content": {
    type: String,
    label: "The content of the asset"
  },
  "ownerId": {
    type: Number,
    label: "Owner user id"                 // Numeric so we can support user rename easily
  }
});

// Games are made up of various KINDS of asset
// Each KIND will have it's own schema for the content.
// Each KIND has various usages: for use in editor, game, etc
AssetKinds = {
  "asset-query": {index: 0, label: "Asset Query", icon: "glyphicon glyphicon-search", usage: ["editor"]},    // Lets us save asset queries
  "sprite-sheet": {index: 1, label: "Sprite Sheet", icon: "glyphicon glyphicon-file", usage: ["game"]},
  "game-object": {index: 2, label: "Game Object", icon: "glyphicon glyphicon-knight", usage: ["game"]},
  "level-map": {index: 3, label: "Level Map", icon: "glyphicon glyphicon-picture", usage: ["game"]},
  "game-definition": {index: 4, label: "Game Definition", icon: "glyphicon glyphicon-play", usage: ["game"]}
};

AssetsCollection.attachSchema( AssetsSchema );
