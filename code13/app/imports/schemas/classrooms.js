import _ from 'lodash'
import { Classrooms } from '/imports/schemas'
import { Match, check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'
import { swearjar } from '/server/imports/swearjar'

export makeClassroomSelector = () => {

}

const optional = Match.Optional

const schema = {
  _id: String,
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
  'Classroom.storeProfileImage'(assetId, classroomId) {
    check(url, String)
    checkIsLoggedInAndNotSuspended()

    try {
      Classrooms.update(classroomId, { $set: { 'avatarAssetId': assetId } })
    } catch (exception) {
      console.log('Classroom.storeProfileImage:', exception)
      return exception
    }
  },

  'Classroom.setAvatarId'(id, classroomId) {
    check(url, String)
    checkIsLoggedInAndNotSuspended()
    Classrooms.update(classroomId, { $set: { 'avatarUrl': url } })
  },

  'Classroom.create'(name){
    check(name, String)


  }
})