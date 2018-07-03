import _ from 'lodash'
import { Classrooms } from '/imports/schemas'
import { Match, check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended } from './checkMgb'

const canEditClassroom = (classroom, userId) => {
  if (_.includes(classroom.teacherIds, userId) || classroom.ownerId === userId) {
    return true
  }
  return false
}

/**
 *
 * @param {Meteor Selector} selector Standard meteor collection selector syntax e.g. {_id: 'somestring'}
 * @param {Meteor Operation} options options to perform upon successfully finding the document and updating it.
 *
 * First loads the targeted Classroom Document via the Selector. Currently this only supports a single document. Attempting to modify many
 * documents at the same time will only affect the first document that the selector qualifies with.
 *
 * If the document doesn't exist, a 404 error is thrown.
 *
 * Then assures that the user is either a "teacher" or the creator of the classroom. Note: there are no differences in how the creator or teachers
 * are treated when it comes to permissions, both have full read and write access. If the user is not a teacher or creator of the classroom
 * a 401 "unauthorized" error is thrown.
 *
 * After permissions are sorted the document is then updated and time-stamped with the date of modification.
 * The document is NOT time-stamped if an error is thrown but is stamped if ANY changes are made to it, this does include overwrites
 * of data with duplicates.
 *
 * Finally the function returns the ID of the document modified for debugging purposes if changes were successful.
 */
const attemptUpdate = (selector, operation) => {
  const targetDoc = Classrooms.find(selector).fetch()[0]
  const user = Meteor.user()

  if (!targetDoc) {
    throw new Meteor.Error(404, 'File Not Found: Could not find document to update.')
  } else if (canEditClassroom(targetDoc, user._id)) {
    Classrooms.update(selector, operation)
    Classrooms.update(selector, { $set: { updatedAt: new Date() } })
    return targetDoc._id
  } else {
    throw new Meteor.Error(401, 'Unauthorized: User not permitted to edit this document.')
  }
}

/**
 *
 * @param {string} userId User Id to search classroom documents in mongo.
 */
export function classroomsMakeSelectorForStudent(userId) {
  const sel = { studentIds: userId }
  return sel
}

const optional = Match.Optional

const schema = {
  _id: String,
  ownerId: String,
  // schoolId: String, // Used to determine rights for assets, chats, students, assignments etc.
  createdAt: Date,
  updatedAt: optional(Date),
  name: String,
  description: String,
  teacherIds: optional([String]), // List of teacher account Ids
  studentIds: optional([String]), //List of student account Ids
  isDeleted: Boolean, // Flag for marking classroom as deleted
  assignmentAssetIds: optional([String]), // List of asset IDs
  // assetList: optional([String]),
  avatarAssetId: String,
}

Meteor.methods({
  'Classroom.setAvatarAsset'(classroomId, avatarAssetId) {
    check(classroomId, String)
    check(avatarAssetId, String)
    checkIsLoggedInAndNotSuspended()
    attemptUpdate(classroomId, { $set: { avatarAssetId } })
  },

  'Classroom.create'(name, description = 'No Description', teacherIds = [], studentIds = []) {
    checkIsLoggedInAndNotSuspended()
    check(name, String)
    check(description, String)
    check(teacherIds, [String])
    check(studentIds, [String])

    let now = new Date(),
      user = Meteor.user(),
      newClassroom = {
        ownerId: user._id,
        createdAt: now,
        updatedAt: now,
        name,
        description,
        teacherIds,
        studentIds,
        isDeleted: false,
        assignmentAssetIds: [],
        avatarAssetId: '', //TODO: Insert default classroom Asset ID
      }
    check(newClassroom, _.omit(schema, '_id'))
    Classrooms.insert(newClassroom)
  },

  'Classroom.updateDescription'(classroomId, description) {
    checkIsLoggedInAndNotSuspended()
    check(description, String)
    check(classroomId, String)
    attemptUpdate(classroomId, { $set: { description } })
  },
  'Classroom.addTeacher'(classroomId, teacherId) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(teacherId, String)
    attemptUpdate(classroomId, { $addToSet: { teacherIds: teacherId } })
  },
  'Classroom.addStudent'(classroomId, studentId) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(studentId, String)
    attemptUpdate(classroomId, { $addToSet: { studentIds: studentId } })
  },
  'Classroom.addAssignmentAsset'(classroomId, assetId) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(assetId, String)
    attemptUpdate(classroomId, { $addToSet: { assignmentAssetIds: assetId } })
  },
  'Classroom.removeTeacher'(classroomId, teacherId) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(teacherId, String)
    attemptUpdate(classroomId, { $pull: { teacherIds: teacherId } })
  },
  'Classroom.removeStudent'(classroomId, studentId) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(studentId, String)
    attemptUpdate(classroomId, { $pull: { studentIds: studentId } })
  },
  'Classroom.removeAssignmentAsset'(classroomId, assetId) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(assetId, String)
    attemptUpdate(classroomId, { $pull: { assignmentAssetIds: assetId } })
  },
  'Classroom.setIsDeleted'(classroomId, value) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(value, Boolean)
    attemptUpdate(classroomId, { $set: { isDeleted: value } })
  },
  'Classroom.setName'(classroomId, value) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(value, String)
    attemptUpdate(classroomId, { $set: { name: value } })
  },
})
