import _ from 'lodash'
import { Classrooms } from '/imports/schemas'

Meteor.publish('classrooms.byUserId', function(userId) {
  // const byOwner = Classrooms.find({ ownerId: userId }),
  //   byTeacherId = Classrooms.find({ teacherIds: userId }),
  //   byStudentId = Classrooms.find({ studentIds: userId }),
  const target = Classrooms.find({
    $or: [{ ownerId: userId }, { teacherIds: userId }, { studentIds: userId }],
  })

  // let returnArray = _.union(_.union(byOwner, byTeacherId), byStudentId)

  // console.log(target)
  return target
  // return Classrooms.find({ _id: sel })
})

Meteor.publish('classrooms.oneClassroom', sel => {
  return Classrooms.findOne(sel)
})
