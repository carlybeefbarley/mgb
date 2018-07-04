import React from 'react'
import AssignmentsList from './AssignmentsList'
import { createContainer } from 'meteor/react-meteor-data'
import Spinner from '/client/imports/components/Nav/Spinner'
import { Azzets, Classrooms, Projects } from '/imports/schemas'
import { classroomsMakeSelectorForStudent } from '/imports/schemas/classrooms'

const AssignmentsListLoading = props =>
  props.loading ? <Spinner loadingMsg={`Loading Assignments...`} /> : <AssignmentsList {...props} />

const AssignmentsListGET = createContainer(props => {
  const userId = Meteor.user()._id
  const handle = Meteor.subscribe('classrooms.byUserId', userId)
  const cursor = Classrooms.find(classroomsMakeSelectorForStudent(userId))
  const classrooms = cursor.fetch()
  let returnProps = { ...props, classrooms, loading: !handle.ready(), assignmentAssets }

  const projectsHandle = Meteor.subscribe('projects.byUserId', userId)
  const projectsCursor = Projects.find({ ownerId: userId })
  const projects = projectsCursor.fetch()
  returnProps.projects = projects
  // !!If users are able to be part of more than one class room this entire HOC will be completely useless.!!
  if (handle.ready() && classrooms && classrooms[0]) {
    returnProps.assignmentAssetIds = classrooms && classrooms[0] ? classrooms[0].assignmentAssetIds : []
    Meteor.subscribe('assets.public.byId', { _id: { $in: returnProps.assignmentAssetIds } }) // Technically correct
    const assignmentAssetsCursor = Azzets.find({ _id: { $in: returnProps.assignmentAssetIds } })
    returnProps.assignmentAssets = assignmentAssetsCursor.fetch()
  }

  return returnProps
  }
}, AssignmentsListLoading)

export default AssignmentsListGET
