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

  updatedAt: Date,          // Always handy to have this

  fLevels:   Object,    // { toolbar-level-key: (NumValue of the slider feature Level) }
  toolbars:  Object,    // { toolbar-data-key: {opaque Toolbar object} }
  skills:    Object,    // Format TBD
  prefs:     Object     // Format TBD
}


Meteor.methods({

  /** Settings.setFeatureLevel
   */
  "Settings.setFeatureLevel": function(featureKey, level) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    let data = { updatedAt: new Date() }
    data["fLevels." + featureKey] = level
    const count = Settings.update(this.userId, {$set: data})

    if (Meteor.isServer)
      console.log(`  [Settings.setFeatureLevel]  "${featureKey}=${level}"  #${count}  `)

    return count
  },

 /** Settings.setToolbarData
   */
  "Settings.setToolbarData": function(featureKey, tdata) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    // TODO: Check TDATA is a string of some expected size range
    // TODO: Check featureKey is a string of some expected range

    let data = { updatedAt: new Date() }
    data["toolbars." + featureKey] = tdata
    const count = Settings.update(this.userId, {$set: data})
    if (Meteor.isServer)
      console.log(`  [Settings.setToolbarData]  "${featureKey}=${tdata}"  #${count}  `)

    return count
  }
})


// Client Helpers are in settings-client.js
