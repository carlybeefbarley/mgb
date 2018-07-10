// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Projects, Azzets } from '/imports/schemas'
import { check } from 'meteor/check'
import { isUserSuperAdmin } from './roles'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'
import { logActivity } from './activity'

// SERVER-ONLY Project METHODS

if (!Meteor.isServer) console.error('projects-server.js should not be on client')

/**
 *
 * This does a DB lookup on the server to see if the user has project access
 * @export
 * @param {String} userId
 * @param {String} projectId
 */
export function lookupIsUseridInProject(userId, projectId) {
  const proj = Projects.findOne({ _id: projectId }, { fields: { ownerId: 1, memberIds: 1 } })
  if (!proj) return false

  return userId === proj.ownerId || _.includes(proj.memberIds, userId)
}

Meteor.methods({
  'Projects.countNonDeletedAssets'(projectName) {
    return Azzets.find({ ownerId: this.userId, projectNames: projectName }).count()
  },

  // deleteProject.. this requires the members and assets to be removed first,
  // so it's not a big deal.. but still, for simplicity we define it
  // server-side only and the client UI is careful to disable other
  // project operations while this is happening
  'Projects.deleteProjectId'(projectId, fAutoDeleteAssets) {
    check(projectId, String)
    checkIsLoggedInAndNotSuspended()
    console.log('Delete Project #', projectId)

    // Check project still exists, is owned by this person, and has no members
    const project = Projects.findOne(projectId)
    if (!project) throw new Meteor.Error(404, `Project #${projectId} not found `)

    console.log('  Found project:', project.name, project._id)
    if (project.ownerId !== this.userId) {
      if (isUserSuperAdmin(Meteor.user())) console.log("Allowing SuperAdmin to delete another user's project")
      else throw new Meteor.Error(401, 'Not Project owner')
    }

    if (project.memberIds && project.memberIds.length > 0)
      throw new Meteor.Error(401, `Project still has members`)

    const now = new Date()

    if (fAutoDeleteAssets) {
      const assets = Azzets.find(
        { ownerId: this.userId, projectNames: project.name },
        {
          fields: {
            // Fields needed for basic processing of this flow
            _id: 1,
            isDeleted: 1,
            projectNames: 1,
            // Fields Needed for nice logging using logActivity()
            name: 1,
            kind: 1,
            ownerId: 1,
            dn_ownerName: 1,
          },
        },
      ).fetch()
      _.forEach(assets, a => {
        const sel = { _id: a._id }
        const inExactlyThisProject = a.projectNames.length === 1 && a.projectNames[0] === project.name
        if (a.isDeleted) {
          if (inExactlyThisProject) {
            // WAS marked-as-deleted, and is ONLY in this project, so only REMOVE-FROM-PROJECT
            Azzets.update(sel, { $set: { updatedAt: now, projectNames: [] } })
            logActivity(
              'asset.project',
              `Removed deleted-Asset from sole project '${project.name}' while deleting project`,
              null,
              a,
            )
          } else {
            // WAS marked-as-deleted, and is in MULTIPLE projects, so only REMOVE-FROM-PROJECT.
            // Behavior is same is prior case, but logActivity() message is slightly different
            // in order to help when debugging potential delete-project bugs in future.
            Azzets.update(sel, {
              $set: { updatedAt: now, projectNames: _.without(a.projectNames, project.name) },
            })
            logActivity(
              'asset.project',
              `Removed deleted-Asset from project '${project.name}' while deleting project`,
              null,
              a,
            )
          }
        } else {
          // !a.isDeleted cases...
          if (inExactlyThisProject) {
            // Was NOT marked-as-deleted, and is ONLY in this project, so MARK-AS-DELETED _AND_ REMOVE-FROM-PROJECT
            Azzets.update(sel, { $set: { updatedAt: now, isDeleted: 1, projectNames: [] } })
            logActivity(
              'asset.project',
              `Removed + Deleted Asset from project '${project.name}' while deleting project`,
              null,
              a,
            )
            logActivity('asset.delete', `Delete asset (during delete of project '${project.name}')`, null, a)
          } else {
            // Was NOT marked-as-deleted, and is in MULTIPLE projects, so only REMOVE-FROM-PROJECT
            Azzets.update(sel, {
              $set: { updatedAt: now, projectNames: _.without(a.projectNames, project.name) },
            })
            logActivity(
              'asset.project',
              `Removed Asset from project '${project.name}' while deleting project`,
              null,
              a,
            )
          }
        }
      })
    }

    // Check the project has no assets (including deleted assets)

    const numAssets = Azzets.find({ ownerId: this.userId, projectNames: project.name }).count()
    if (numAssets > 0)
      throw new Meteor.Error(
        401,
        `Project still contains ${numAssets} Assets. You must Remove all Assets from the project before deleting the project. Have you checked deleted assets also?`,
      )

    // Ok, let's do it'
    const result = Projects.remove(projectId)
    return result
  },
})
