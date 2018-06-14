import _ from 'lodash'
import { Users } from '/imports/schemas'
import { Match, check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'

const optional = Match.Optional

const schema = {
  _id: String,
  schoolId: String, // Used to determine rights for assets, chats, students, assignments etc.
  createdAt: Date,
  teachers: optional([String]), // List of teacher account Ids
  name: String,
  students: optional([String]), //List of student account Ids
  assignments: optional([]),
  assetList: optional([String]),
  avatarUrl: String,
}
