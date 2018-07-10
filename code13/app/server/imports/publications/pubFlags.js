import { Flags } from '/imports/schemas'

//
//    FLAG LOG Publication
//
//TODO add resolvedAT to index
Meteor.publish('flagged.recent.unresolved', function() {
  let selector = { resolvedAt: { $exists: false } }
  let options = { sort: { createdAt: -1 } }

  return Flags.find(selector, options)
})

//
//Flags Indexes
Flags._ensureIndex({ createdAt: -1 })
