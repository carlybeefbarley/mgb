
// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Projects } from '/imports/schemas'
import { check, Match } from 'meteor/check'

// The projects/assets data model for MGB has some very simple axioms:
//
// Containment Axioms:
//   A 'project'' has exactly one owner
//   An 'asset' can only have one owner
//   The 'asset' owner MUST also be the project owner
//   An 'asset' can be part of zero-or-more 'projects' as long as they are all owned by the asset owner
// 
// Rights Axioms:
//  A user can ALWAYS modify/destroy/create assets they own, regardless of the asset's project memberships (including the asset being in no projects)
//  A member of a project can modify (including changing the mark-as-deleted flag) assets for projects they are members of
//  TBD: A member of a project can ?SOMETIMES? create new assets in a user's project *which would be owned by the Project Owner)
//  TBD: A member of a project can ?SOMETIMES? edit the project membership of an asset they do not own (thus adding/removing it to a project)
//
// Consequences of Axioms:
//  A project MAY contain no assets
//  An asset MAY be part of no projects
//  An asset MUST never have no owner
//  An asset MUST never have two-or-more owners
//  Every asset in a project MUST be owned by the project owner (asset.ownerId ==== project.ownerId)
//  All assets in a project MUST have the same owner
//  An asset MUST never be in two projects which have different owners (in fact our chosen data structure has no way to represent this case - intentionally)


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
      throw new Meteor.Error(401, "Login required")      // TODO: Better access check
      
    const username = Meteor.user().profile.name
    const now = new Date()
    data.createdAt = now
    data.updatedAt = now
    data.ownerId = this.userId
    data.ownerName = username
    data.memberIds = []
    data.avatarAssetId = ""

    check(data, _.omit(schema, '_id'));

    let docId = Projects.insert(data);

    if (Meteor.isServer) {
      console.log(`  [Projects.create]  "${data.name}"  #${docId}  `)
      Meteor.call('Slack.Projects.create', username, data.name, docId)
    }
    return docId
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
