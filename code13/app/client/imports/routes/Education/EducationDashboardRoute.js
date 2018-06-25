import React from 'react'
import _ from 'lodash'
import { createContainer } from 'meteor/react-meteor-data'
import { Classrooms, Users } from '/imports/schemas'
import { classroomsMakeSelectorForStudent } from '/imports/schemas/classrooms'
import StudentDashboard from '/client/imports/components/Education/StudentDashboard'
import TeacherDashboard from '/client/imports/components/Education/TeacherDashboard'

class EducationDashboardRoute extends React.Component {
  render() {
    const { isTeacher } = this.props
    return isTeacher ? <TeacherDashboard {...this.props} /> : <StudentDashboard {...this.props} />
  }
}

export default createContainer(props => {
  const currUser = Meteor.user(),
    userId = currUser._id,
    handle = Meteor.subscribe('classrooms.byUserId', userId),
    cursor = Classrooms.find(classroomsMakeSelectorForStudent(userId)),
    classrooms = cursor.fetch(),
    isTeacher = !!_.find(currUser.permissions, { teamId: 'teachers' })
  let returnProps = { ...props, classrooms, isTeacher }

  // !!If users are able to be part of more than one class room this entire HOC will be completely useless.!!
  if (handle.ready() && classrooms && classrooms[0]) {
    const teacherId = classrooms[0].ownerId
    Meteor.subscribe('user', teacherId)

    const teacherNames = Users.find(teacherId).fetch()
    returnProps.teacherName = teacherNames && teacherNames[0] ? teacherNames[0].username : ''
  }

  return returnProps
}, EducationDashboardRoute)
