
// This file must be imported by main_server.js so that the Meteor method can be registered

import { Chats } from '../schemas';
import { check, Match } from 'meteor/check';

const optional = Match.Optional     // Note that Optional does not permit null


var schema = {
  _id: String,              // ID of this chat message

  createdAt: Date,
  updatedAt: Date,          // We may allow edit


  // Identifiers for who sent the chat
  byUserName: String,       // UserName (not ID)
  byUserId: String,         // OK, _this_ one is the ID
 
  // Identifers for scope of the action
  toChannelName: optional(String),    // undefined if global 
  toProjectName: optional(String),    // undefined if not a project-scoped action... oops. what about owner of project
  toAssetId: optional(String),        // If it is an asset-scoped chat - or undefined if not asset-scoped
  toAssetName: optional(String),      // Asset's name If it is an asset-scoped chat (duplicated here for speed)
  toOwnerId: optional(String),        // Owner's user ID if @person. Only one @person... 
  toOwnerName: optional(String),      // Owner's user NAME if @person

  // the actual chat information
  message: String         // Project Name (scoped to owner). Case sensitive
};


Meteor.methods({

  /** Chats.create
   *  @param data.message        Message to send
   */
  "Chats.send": function(data) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required");      // TODO: Better access check
      
    const now = new Date()
    data.createdAt = now
    data.updatedAt = now
    data.byUserId = this.userId
    data.byUserName = Meteor.user().profile.name
    check(data, _.omit(schema, '_id'));

    let docId = Chats.insert(data);
    if (Meteor.isServer)
      console.log(`  [Chats.send]  "${data.message}"  #${docId}  `);

    return docId;
  }
  
});
