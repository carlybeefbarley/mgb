/* global Mongo, Meteor */


export const Users = Meteor.users;
export const Teams = new Mongo.Collection('teams');
export const Plans = new Mongo.Collection('plans');
export const Todos = new Mongo.Collection('todos');


/*
 XXXX Joining Collections to get _ownerName not yet working
 See https://www.discovermeteor.com/blog/reactive-joins-in-meteor/ for one discussion of the overall problem

See http://stackoverflow.com/questions/30961418/displaying-all-users-in-meteor for a discussion of scoping the users query
also http://stackoverflow.com/questions/13537777/listing-all-users-on-client-with-meteor
also https://github.com/englue/meteor-publish-composite

or https://atmospherejs.com/dburles/collection-helpers  <--- looks most promising
 */


export const Azzets = new Mongo.Collection('azzets', {
  transform: function (doc) {   // Note that the transform happens on fetch..

 //   is the Users subscription even set up?  See the InviteUsers.js example to do so and wait for ready() when the cursor is loaded

    console.log(Users.find().fetch());
    var user = Users.findOne(doc.ownerId);     // XXXX is only finding current user id. Needs full list?
    console.log(user)
    doc.ownerName = user ? user.profile.name : "UNKNOWN"
    return doc;
  }});   // Because 'Assets' is a special global for Meteor.
