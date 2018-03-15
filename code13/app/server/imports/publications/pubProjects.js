import { Projects } from '/imports/schemas'
import { projectMakeSelector, projectMakeFrontPageListSelector } from '/imports/schemas/projects'

//
//    PROJECTS Publications
//

// Return one project by ID. This is a good subscription for ProjectOverviewRoute
// sel is either of the form { _id : projectId } or { ownerId: user._id, name: projectName }
Meteor.publish('projects.oneProject', function(sel) {
  return Projects.find(sel)
})

// Return projects relevant to this userId.. This includes owner, member, etc
Meteor.publish('projects.byUserId', function(userId, showOnlyForkable = false) {
  const selector = projectMakeSelector(userId, showOnlyForkable)
  return Projects.find(selector)
})

Meteor.publish('projects.frontPageList', function(limitCount = 5) {
  const selector = projectMakeFrontPageListSelector()
  return Projects.find(selector, { limit: limitCount, sort: { updatedAt: -1 } })
})

Meteor.publish('projects.search', function(
  userId, // can be null
  nameSearch, // can be null
  showOnlyForkable = false,
) {
  const selector = projectMakeSelector(userId, nameSearch, showOnlyForkable, {
    sort: { updatedAt: -1 },
  })

  return Projects.find(selector)
})

//
//    PROJECTS Indexes
//

Projects._ensureIndex({ updatedAt: -1 })
Projects._ensureIndex({ updatedAt: -1 })

Projects._ensureIndex({ ownerId: 1, name: 1 })
