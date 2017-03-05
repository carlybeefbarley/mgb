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


Meteor.publish('projects.search', 
  function (
    userId,                       // can be null
    nameSearch,                   // can be null
    showOnlyForkable = false,
    hideWorkstateMask=0,          // As defined for use by assetMakeSelector()
    ) 
  {
    const selector = projectMakeSelector(
      userId, 
      nameSearch,
      showOnlyForkable,
      hideWorkstateMask)
  
    return Projects.find(selector)
  }
)

//
//    PROJECTS Indexes
//

Projects._ensureIndex({"updatedAt": -1})
Projects._ensureIndex({"workState": -1})
Projects._ensureIndex({"workState": 1, "updatedAt": -1})
