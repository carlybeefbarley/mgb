import _ from 'lodash'
import { Classrooms } from '/imports/schemas'
import { Match, check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'
// import { swearjar } from '/server/imports/swearjar'

export const makeClassroomSelector = () => {
  return 0
}

const canEditClassroom = (classroom, userId) => {
  if (_.includes(classroom.teacherIds, userId) || classroom.ownerId === userId) {
    return true
  }
  return false
}

const optional = Match.Optional

const schema = {
  _id: String,
  creatorId: String,
  // schoolId: String, // Used to determine rights for assets, chats, students, assignments etc.
  createdAt: Date,
  teachers: optional([String]), // List of teacher account Ids
  name: String,
  students: optional([String]), //List of student account Ids
  assignments: optional([String]), // List of asset IDs
  // assetList: optional([String]),
  avatarAssetId: String,
}

Meteor.methods({
  'Classroom.storeProfileImage'(classroomId, assetId) {
    check(assetId, String)
    checkIsLoggedInAndNotSuspended()

    try {
      Classrooms.update(classroomId, { $set: { avatarAssetId: assetId } })
    } catch (exception) {
      console.log('Classroom.storeProfileImage:', exception)
      return exception
    }
  },

  'Classroom.setAvatarId'(classroomId, avatarAssetId) {
    check(avatarAssetId, String)
    checkIsLoggedInAndNotSuspended()
    Classrooms.update(classroomId, { $set: { avatarAssetId } })
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
        name,
        description,
        createdAt: now,
        updatedAt: now,
        ownerId: user._id,
        teacherIds,
        studentIds,
        isDeleted: false,
        assignmentAssetIds: [],
        avatarAssetId: '', //TODO: Insert default classroom Asset ID
      }

    Classrooms.insert(newClassroom)
  },

  'Classroom.updateDescription'(classroomId, description) {
    checkIsLoggedInAndNotSuspended()
    check(description, String)
    check(classroomId, String)
    const user = Meteor.user(),
      targetDoc = Classrooms.findOne(classroomId)

    if (!targetDoc) {
      throw new Meteor.Error(404, 'File Not Found: Could not find document to update.')
    } else if (canEditClassroom(targetDoc, user._id)) {
      Classrooms.update({ _id: classroomId }, { $set: { description } })
      return targetDoc._id
    } else {
      throw new Meteor.Error(401, 'Unauthorized: User not permitted to edit this document.')
    }
  },
  'Classroom.addTeacher'(classroomId, teacherId) {
    checkIsLoggedInAndNotSuspended()
    check(classroomId, String)
    check(teacherId, String)
    const user = Meteor.user(),
      targetDoc = Classrooms.findOne(classroomId)

    if (!targetDoc) {
      throw new Meteor.Error(404, 'File Not Found: Could not find document to update.')
    } else if (canEditClassroom(targetDoc, user._id)) {
      Classrooms.update(classroomId, { $addToSet: { teacherIds: teacherId } })
    } else {
      throw new Meteor.Error(401, 'Unauthorized: User not permitted to edit this document.')
    }
  },
})
