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
    type: String,                   // These will be strings that are part of the AssetKinds defined below
    label: "Asset kind"
  },
  "content": {
    type: String,
    label: "The content of the asset"
  }
});

// Games are made up of various KINDS of asset
// Each KIND will have it's own schema for the content.
// Each KIND has various usages: for use in editor, game, etc
AssetKinds = {
  "asset-query": { label: "Asset Query", usage: ["editor"]},    // Lets us save asset queries
  "sprite-sheet": { label: "Sprite Sheet", usage: ["game"]},
  "game-object": {label: "Game Object", usage: ["game"]},
  "level-map": { label: "Level Map", usage: ["game"]},
  "game-definition": {label: "Game Definition", usage: ["game"]}
};

AssetsCollection.attachSchema( AssetsSchema );
