import React from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import SubmissionFeed from './SubmissionFeed'
import { Projects, Users, Azzets, Classrooms } from '/imports/schemas'

export default createContainer(props => {
  const userId = Meteor.user()._id
  const handleForClassrooms = Meteor.subscribe('classrooms.byUserId', userId)
  const cursorForClassrooms = Classrooms.find({
    $or: [{ ownerId: userId }, { teacherIds: userId }, { studentIds: userId }],
  })
  const classrooms = cursorForClassrooms.fetch()

  // Gets all classes and maps them into an array of studentIds arrays, then removes all undefined, null & ''
  // Finally unions all of those arrays via spread operator with _.union
  const allClassroomUsers = _.union(
    ..._.compact(
      _.map(classrooms, classroom => {
        if (classroom.studentIds.length) return classroom.studentIds
      }),
    ),
  )

  // Grab all the projects that are owned by a user in any of our classrooms that have an assignment and the
  // workState is set to complete, aka ready for review by the teacher
  const projectSelector = {
    $or: [{ ownerId: { $in: allClassroomUsers } }, { teacherIds: { $in: allClassroomUsers } }],
    assignmentId: { $exists: true },
    workState: { $eq: 'unknown' }, // TODO: Change this to whatever we're using for the ready for review workState
  }
  const handleForProjects = Meteor.subscribe('projects.oneProject', projectSelector)
  const cursorForProjects = Projects.find(projectSelector)
  const projects = cursorForProjects.fetch()

  const allProjectAssignments = _.map(projects, project => {
    return project.assignmentId
  })

  const assignmentsSelector = { _id: { $in: allProjectAssignments } }
  const hadleForAssignments = Meteor.subscribe('assets.byAssignmentsList', allProjectAssignments)
  const cursorForAssignments = Azzets.find(assignmentsSelector)
  const assignments = cursorForAssignments.fetch()

  return { ...props, classrooms, projects, assignments }
}, SubmissionFeed)
