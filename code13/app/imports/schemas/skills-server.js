// Server-side only functions related to the skills table
// See also ./skills.js for context

import { Skills } from '/imports/schemas'

export function createInitialSkills(userId) {
  if (!Meteor.isServer || !userId) return

  const skills = Skills.findOne(userId)
  if (skills) {
    console.log(`Skills object already exists for #${userId}`)
    return // No need to create one
  }

  // Ok, so let's create an empty skills object..
  let data = {
    _id: userId, // Skills._id is SAME as User._id
    updatedAt: new Date(),
  }

  let docId = Skills.insert(data)
  console.log(`  createInitialSkills(${data._id}) -> #${docId}`)
}
