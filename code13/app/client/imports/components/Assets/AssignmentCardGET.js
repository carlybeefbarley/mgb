import React from 'react'
import AssignmentCard from './AssignmentCard'
import { createContainer } from 'meteor/react-meteor-data'
import { Azzets } from '/imports/schemas'

const AssignmentCardLoading = props =>
  props.loading ? <div>Loading Assignment Info...</div> : <AssignmentCard {...props} />

const AssignmentCardGET = createContainer(({ assignmentId, getAssignment }) => {
  const handle = Meteor.subscribe('assets.public.byId', assignmentId)
  const assignmentAsset = Azzets.findOne(assignmentId)
  getAssignment(assignmentAsset)

  return {
    assignmentAsset,
    loading: !handle.ready(),
  }
}, AssignmentCardLoading)

export default AssignmentCardGET
