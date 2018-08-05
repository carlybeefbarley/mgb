import { Classrooms } from '/imports/schemas'
import { check } from 'meteor/check'

Meteor.publish('classrooms.byUserId', userId => {
  check(userId, String)
  const classroomsCursor = Classrooms.find({
    $or: [{ ownerId: userId }, { teacherIds: userId }, { studentIds: userId }],
  })
  return classroomsCursor
})

Meteor.publish('classrooms.byTeacherId', userId => {
  check(userId, String)
  const classroomsCursor = Classrooms.find({
    $or: [{ ownerId: userId }, { teacherIds: userId }],
  })
  return classroomsCursor
})

Meteor.publish('classrooms.byStudentId', userId => {
  check(userId, String)
  const classroomsCursor = Classrooms.find({
    studentIds: userId,
  })
  return classroomsCursor
})

Meteor.publish('classrooms.oneClassroom', classroomId => {
  check(classroomId, String)
  return Classrooms.find(classroomId)
})