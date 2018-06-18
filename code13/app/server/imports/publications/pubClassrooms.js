import { Classrooms } from '/imports/schemas'

Meteor.publish('classrooms.byUserId', sel => {
  return Classrooms.find({ ownerId: sel, teacherIds: sel, studentIds: sel, assignmentAssetIds: sel }).fetch()
  // return Classrooms.find({ _id: sel })
})

Meteor.publish('classrooms.oneClassroom', sel => {
  return Classrooms.findOne(sel)
})
