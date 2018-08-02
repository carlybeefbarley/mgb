import { createContainer } from 'meteor/react-meteor-data'
import React from 'react'
import StudentProfile from '/client/imports/components/Education/Profile/StudentProfile'
import TeacherProfile from '/client/imports/components/Education/Profile/TeacherProfile'
import { joyrideStore } from '/client/imports/stores'
import { Classrooms, Users } from '/imports/schemas'
import { isUserTeacher } from '/imports/schemas/roles'

class EducationProfileRoute extends React.Component {
  handleAvatarChange = newUrl => {
    const { user } = this.props
    Meteor.call('User.updateProfile', user._id, { 'profile.avatar': newUrl })
    joyrideStore.completeTag('mgbjr-CT-profile-set-field-profile.avatar')
  }

  render() {
    const { isTeacher } = this.props
    return isTeacher ? (
      <TeacherProfile {...this.props} handleAvatarChange={this.handleAvatarChange} />
    ) : (
      <StudentProfile {...this.props} handleAvatarChange={this.handleAvatarChange} />
    )
  }
}

export default createContainer(props => {
  const handleForUsers = Meteor.subscribe('user.byName', props.params.username)
  const user = Users.findOne({ username: props.params.username })
  const isTeacher = isUserTeacher(props.currUser)
  const canEdit = props && props.currUser && user && user._id === props.currUser._id

  const handleForClassroom = Meteor.subscribe('classrooms.byStudentId', props.currUser._id)
  const classroom = Classrooms.findOne()
  return { ...props, isTeacher, user, canEdit, classroom }
}, EducationProfileRoute)
