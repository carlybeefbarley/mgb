
// This file must be imported by main_server.js so that the Meteor method can be registered

import { Projects, Users } from '/imports/schemas';
import { check, Match } from 'meteor/check';

var schema = {
  _id: String,

  createdAt: Date,
  updatedAt: Date,

  ownerId:   String,          // owner user id
  ownerName: String,          // owner user id

  // the actual project information
  name: String,             // Project Name (scoped to owner). Case sensitive
  description: String,      // A description field
  memberIds: [String],      // Array of memberIds ()
  avatarAssetId: String     // Asset that will be used as the avatar for this project (should be a graphic)
};


/** This is intended for use by publications.js and any Meteor.subscribe calls
 *  Selector will return projects relevant to this userId.. This includes owner, member, etc

 */
export function projectMakeSelector(userId) 
{
  return {
    "$or": [
      { ownerId: userId },
      { memberIds: { $in: [userId]} }
    ]
  }
}


Meteor.methods({

//   "Projects.fixup": function() {
    
// console.log("Starting fixup (dry run)")
// console.log(` Invoked by `)
// console.log(Meteor.user())

//     let allProjects = Projects.find().fetch()
//     _.each(allProjects, p => {
//       console.log("Project ", p._id, p.name, p.ownerId)
//       var u = Meteor.users.findOne( { _id: p.ownerId} )
//       if (u)
//       {
//         var uname = u.profile.name
//         console.log(`  UserId ${p.ownerId} is username ${uname}`)
//         var selector = {_id: p._id};
//         var data = { ownerName: uname}
//         console.log("Selector: ", selector)
//         console.log("Data: ", data)
//         var count = Projects.update(selector, {$set: data})
//         console.log(`  [Projects.fixup - update]  (${count}) `); 
//       }
//       else
//         console.log(`  UserId ${p.ownerId} not found`)
//     })

//   },

  /** Projects.create
   *  @param data.name           Name of Project
   *  @param data.description    Description field
   */
  "Projects.create": function(data) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required");      // TODO: Better access check
      
    const now = new Date();
    data.createdAt = now
    data.updatedAt = now
    data.ownerId = this.userId
    data.ownerName = Meteor.user().profile.name
    data.memberIds = []
    data.avatarAssetId = ""

    check(data, _.omit(schema, '_id'));

    let docId = Projects.insert(data);

    console.log(`  [Projects.create]  "${data.name}"  #${docId}  `);
    return docId;
  },
  

  "Projects.update": function(docId, canEdit, data) {
    var count, selector;
    var optional = Match.Optional;

    check(docId, String);
    if (!this.userId)
      throw new Meteor.Error(401, "Login required");

    // TODO: Move this access check to be server side..
    //   Or check publications have correct deny rules.
    //   See comment below for selector = ...
    if (!canEdit)
      throw new Meteor.Error(401, "You don't have permission to edit this.");   //TODO - make this secure,

    data.updatedAt = new Date();
    
    // whitelist what can be updated
    check(data, {
      updatedAt: schema.updatedAt,
      name: optional(schema.name),
      description: optional(schema.description),
      memberIds: optional(schema.memberIds),   
      avatarAssetId: optional(schema.avatarAssetId)
    });

    // if caller doesn't own doc, update will fail because fields like ownerId won't match
    selector = {_id: docId};

    count = Projects.update(selector, {$set: data});

    console.log(`  [Projects.update]  (${count}) #${docId}`); 

    return count;
  }

});
