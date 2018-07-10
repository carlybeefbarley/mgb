// Server-side only functions related to the settings table
// See also ./settings.js for context

import { Settings } from '/imports/schemas'

export function createInitialSettings(userId) {
  if (!Meteor.isServer || !userId) return

  const settings = Settings.findOne(userId)
  if (settings) {
    console.log(`Settings object already exists for #${userId}`)
    return // No need to create one
  }

  // Ok, so let's create an empty settings object..
  let data = {
    _id: userId, // Settings._id is SAME as User._id
    updatedAt: new Date(),
    fLevels: {},
    toolbars: {},
    skills: {},
    prefs: {},
  }

  let docId = Settings.insert(data)
  console.log(`  createInitialSettings(${data._id}) -> #${docId}`)
}
