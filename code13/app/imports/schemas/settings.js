// Data model for MGB per-user settings.
//
// This is for more verbose stuff that we don't want to clog up the 'users'
// record with - we would only get it for the CURRENTLY logged in user

// This file must be imported by main_server.js so that the Meteor method can be registered

import { Settings } from '/imports/schemas'

var schema = {
  // ID of this settings object.
  // THIS WILL BE EQUAL TO THE ID OF THE USER - simplest way to ensure and manage a 1:1 mapping of user:settings
  _id: String,

  updatedAt: Date, // Always handy to have this

  fLevels: Object, // { toolbar-level-key: (NumValue of the slider feature Level) }
  toolbars: Object, // { toolbar-data-key: {opaque Toolbar object} }
  skills: Object, // Format TBD
  prefs: Object, // Format TBD
}

Meteor.methods({
  /** Settings.save
   */
  'Settings.save'(data) {
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    data.updatedAt = new Date()
    const count = Settings.update(this.userId, { $set: data })

    if (Meteor.isServer)
      console.log(`  [Settings.save] userId=${this.userId}   Updated records = #${count}  `)

    return count
  },
})

// Client Helpers are in settings-client.js
