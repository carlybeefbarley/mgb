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
    label: "Asset name."
  },
  "content": {
    type: String,
    label: "The content of the asset."
  }
});

AssetsCollection.attachSchema( AssetsSchema );
