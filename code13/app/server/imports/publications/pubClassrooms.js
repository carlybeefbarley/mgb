import { Classrooms } from '/imports/schemas'

Meteor.publish('classrooms.byId', sel => {
  return Classrooms.find({ _id: sel })
})

Meteor.publish('classrooms.oneClassroom', sel => {
  return Classrooms.findOne(sel)
})
