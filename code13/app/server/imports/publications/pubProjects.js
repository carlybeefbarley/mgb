import { Projects } from '/imports/schemas'
import { projectMakeSelector, projectMakeFrontPageListSelector } from '/imports/schemas/projects'

//
//    PROJECTS Publications
//

// Return one project. This is a good subscription for ProjectOverviewRoute
Meteor.publish('projects.forProjectId', function(projectId) {
  return Projects.find(projectId)
})


// Return projects relevant to this userId.. This includes owner, member, etc
Meteor.publish('projects.byUserId', function(userId, showOnlyForkable = false) {
  const selector = projectMakeSelector(userId, showOnlyForkable)
  return Projects.find(selector)
})

Meteor.publish('projects.frontPageList', function (limitCount=5) {
  const selector = projectMakeFrontPageListSelector()
  return Projects.find(selector, { limit: limitCount, sort: {updatedAt: -1} } )
})

//
//    PROJECTS Indexes
//

Projects._ensureIndex({"updatedAt": -1})
Projects._ensureIndex({"workState": -1})
Projects._ensureIndex({"workState": 1, "updatedAt": -1})
