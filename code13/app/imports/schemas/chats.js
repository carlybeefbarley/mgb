// Data model for MGB Chats. 
// See https://github.com/devlapse/mgb/issues/40 for discussion of requirements

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

export const ChatChannels = {
  SYSTEM: { 
    name:         "mgb-system",
    icon:         "announcement",
    description:  "Global announcements from core MGB engineering team",
    subscopes:    {}
  },
  GENERAL: { 
    name:         "general",
    icon:         "world",
    description:  "General suggestions, discussions and questions related to MGB",
    subscopes:    {}
  },
  RANDOM: {
    name:         "random",
    icon:         "random",
    description:  "Off-topic discussions not related to MGB",
    subscopes:    {}
  },
  MGBBUGS: { 
    name:         "mgb-bugs",
    icon:         "bug",
    description:  "Discussions about potential bugs and fixes in MGB",
    subscopes:    {}
  },
  MGBHELP: { 
    name:         "mgb-help",
    icon:         "help circle",
    description:  "Ask for help in how to use the MGB site",
    subscopes:    {}
  },
  LOOKINGFORGROUP: { 
    name:         "lfg",
    icon:         "users",
    description:  "Looking for group - message here to find people to work with on MGB projects",
    subscopes:    {}
  },
 
  // ASSET: { 
  //   name:         "asset",
  //   icon:         "write",
  //   description:  "Discussion about the currently viewed/edited asset",
  //   subscopes:    { assetId: true }
  // },
 
 
  // TODO: Project chat is a bit complex.. will do that later: Limited membership, viewership etc
  // PROJECTMEMBERS: { 
  //   name:         "project-members",
  //   icon:         "",
  //   description:  "Comments/Discussion by project members about a specific project",
  //   subscopes:    { projectId: true },
  //   index:        110
  // },
  // PROJECTPUBLIC: { 
  //   name:         "project-public",
  //   icon:         "",
  //   description:  "Comments/Discussion by anyone about a specific project",
  //   subscopes:    { projectId: true },
  //   index:        120
  // },
  getIconClass: function (key) { return (ChatChannels.hasOwnProperty(key) ? ChatChannels[key].icon : "warning sign") + " icon"},
  sortedKeys: ["SYSTEM", "GENERAL", "RANDOM", "MGBBUGS", "MGBHELP", "LOOKINGFORGROUP"]
}

 
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
