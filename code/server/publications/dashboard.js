Meteor.publish( 'dashboard', function() {
  return People.find();
});


Meteor.publish( 'assets', function() {
  return AssetsCollection.find();
});

