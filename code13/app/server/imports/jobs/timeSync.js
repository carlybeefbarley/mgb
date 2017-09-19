Meteor.methods({
  syncTime(date) {
    return { now: Date.now(), diff: Date.now() - date.now }
  },
})
