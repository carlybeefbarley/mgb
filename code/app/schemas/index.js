/* global Mongo, Meteor */


export const Users = Meteor.users;
export const Teams = new Mongo.Collection('teams');
export const Plans = new Mongo.Collection('plans');
export const Todos = new Mongo.Collection('todos');
export const Azzets = new Mongo.Collection('azzets');   // Because 'Assets' is a special global for Meteor.


/*
 TODO: Joining Collections, probably with server-side transforms or references
 Need to look at an approach for this. Approaches include:
 - https://www.discovermeteor.com/blog/reactive-joins-in-meteor/ for one discussion of the overall problem
 - http://stackoverflow.com/questions/30961418/displaying-all-users-in-meteor for a discussion of scoping the users query
 - http://stackoverflow.com/questions/13537777/listing-all-users-on-client-with-meteor
 - https://github.com/englue/meteor-publish-composite
 - https://atmospherejs.com/dburles/collection-helpers  <--- looks most promising

 For very common joins on stable data onto big tables (e.g. username for Asset owner),
 the chosen approach is to denormalize at the server on update/create. See assets.js
 for an example
 */


