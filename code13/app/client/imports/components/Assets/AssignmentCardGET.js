import React from 'react'
import AssignmentCard from './AssignmentCard'
import { createContainer } from 'meteor/react-meteor-data'
import { isUserTeacher } from '/imports/schemas/roles'
import { Azzets } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'

const AssignmentCardLoading = props =>
  props.loading ? <Spinner loadingMsg="Loading Assignment..." /> : <AssignmentCard {...props} />

export default createContainer(({ assignmentId }) => {
  const isTeacher = isUserTeacher(Meteor.user())
  const assignmentHandler = Meteor.subscribe('assets.public.byId', assignmentId)
  const assignmentAsset = Azzets.findOne(assignmentId)

  return {
    assignmentAsset,
    loading: !assignmentHandler.ready(),
    isTeacher,
  }
}, AssignmentCardLoading)
