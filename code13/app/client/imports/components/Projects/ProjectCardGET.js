import React from 'react'
import ProjectCard from './ProjectCard'
import { withTracker } from 'meteor/react-meteor-data'
import { Projects } from '/imports/schemas'

const ProjectCardLoading = props =>
  props.loading ? <div>Loading Project Info...</div> : <ProjectCard {...props} />

const ProjectCardGET = withTracker(({ projectId }) => {
  const handle = Meteor.subscribe('projects.oneProject', { _id: projectId })

  return {
    project: Projects.findOne(projectId),
    loading: !handle.ready(),
  }
})(ProjectCardLoading)

export default ProjectCardGET
