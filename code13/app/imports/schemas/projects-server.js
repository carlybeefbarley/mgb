// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Projects, Azzets } from '/imports/schemas'
import { check } from 'meteor/check'

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
  // deleteProject.. this requires the members and assets to be removed first,
  // so it's not a big deal.. but still, for simplicity we define it 
  // server-side only and the client UI is careful to disable other 
  // project operations while this is happening
  "Projects.deleteProjectId": function(projectId) {
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

    // Check the project has no assets (including deleted assets)

    const numAssets = Azzets.find( { ownerId: this.userId, projectNames: project.name } ).count()
    if (numAssets > 0)
      throw new Meteor.Error(401, `Project still contains ${numAssets} Assets. You must Remove all Assets from the project before deleting the project. Have you checked deleted assets also?`)

    // Ok, let's do it'
    const result = Projects.remove(projectId)
    return result
  }

})


