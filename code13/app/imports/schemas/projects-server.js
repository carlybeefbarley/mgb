// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Projects, Azzets } from '/imports/schemas'
import { check } from 'meteor/check'
import { logActivity } from './activity'

// SERVER-ONLY Project METHODS

if (!Meteor.isServer)
  console.error('projects-server.js should not be on client')

/**
 * 
 * This does a DB lookup on the server to see if the user has project access
 * @export
 * @param {String} userId
 * @param {String} projectId
 */
export function lookupIsUseridInProject(userId, projectId) {
  const proj = Projects.findOne( { _id: projectId }, { fields: { ownerId: 1, memberIds: 1 } } )
  if (!proj)
    return false

  return (userId === proj.ownerId || _.includes(proj.memberIds, userId) )
}

Meteor.methods({

  "Projects.countNonDeletedAssets": function (projectName) {
    return Azzets.find( { ownerId: this.userId, projectNames: projectName } ).count()
  },

  // deleteProject.. this requires the members and assets to be removed first,
  // so it's not a big deal.. but still, for simplicity we define it 
  // server-side only and the client UI is careful to disable other 
  // project operations while this is happening
  "Projects.deleteProjectId": function(projectId, fAutoDeleteAssets) {
    check(projectId, String)
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    console.log("Delete Project #", projectId)

    // Check project still exists, is owned by this person, and has no members
    const project = Projects.findOne(projectId)
    if (!project) 
      throw new Meteor.Error(404, `Project #${projectId} not found `)

    console.log("  Found project:", project.name, project._id)
    if (project.ownerId !== this.userId) 
      throw new Meteor.Error(401, "Not Project owner")

    if (project.memberIds && project.memberIds.length > 0)
      throw new Meteor.Error(401, `Project still has members`)

    const now = new Date()

    if (fAutoDeleteAssets)
    {
      const assets = Azzets.find( 
        { ownerId: this.userId, projectNames: project.name },
        { 
          fields: { 
            // Needed for basic processing of this flow
            _id: 1, 
            isDeleted: 1, 
            projectNames: 1,
            // Needed for nice logging using logActivity()
            name: 1, 
            kind: 1,
            ownerId: 1,
            dn_ownerName: 1
          } 
        }
      ).fetch()
      _.forEach(assets, a => {
        const sel = { _id: a._id }
        // We will mark-as-deleted any items that ONLY have this projectName and have not been deleted.
        if (!a.isDeleted && a.projectNames.length === 1 && a.projectNames[0] === project.name)
        {
          Azzets.update( sel, { $set: { updatedAt: now, isDeleted: 1, projectNames: [] } } )
          logActivity("asset.project", `Removed + Deleted Asset from project '${project.name}' while deleting project`, null, a)
          logActivity("asset.delete",  `Delete asset (during delete of project '${project.name}')`, null, a)        
        }
        else
        {
          Azzets.update( sel, { $set: { updatedAt: now, projectNames: _.without(a.projectNames) } } )
          logActivity("asset.project", `Removed Asset from project '${project.name}' while deleting project`, null, a)
        }
      }) 
    }

    // Check the project has no assets (including deleted assets)

    const numAssets = Azzets.find( { ownerId: this.userId, projectNames: project.name } ).count()
    if (numAssets > 0)
      throw new Meteor.Error(401, `Project still contains ${numAssets} Assets. You must Remove all Assets from the project before deleting the project. Have you checked deleted assets also?`)

    // Ok, let's do it'
    const result = Projects.remove(projectId)
    return result
  }

})
