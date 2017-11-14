import React from 'react'

import { Routes } from '/client/imports/routes'

import '/imports/schemas/chats'
import '/imports/schemas/users'
import '/imports/schemas/assets'
import '/imports/schemas/skills'
import '/imports/schemas/activity'
import '/imports/schemas/projects'
import '/imports/schemas/settings'
import '/imports/schemas/activitySnapshots'

import { Tracker } from 'meteor/tracker'

// iOS will only fire `onClick` events on elements with cursor: pointer
// otherwise, it will only fire touch events
// On touch enabled devices, ensure the cursor is a pointer so click events fire
if ('ontouchstart' in document.documentElement) {
  document.body.style.cursor = 'pointer'
}

if (Meteor.isDevelopment) {
  // Expose the React Performance Tools on the`window` object
  window.Perf = require('react-addons-perf')

  // prevent nasty Meteor error catching - which breaks break on exception functionality
  Tracker.Computation.prototype._recompute = function() {
    this._recomputing = true
    try {
      if (this._needsRecompute()) this._compute()
    } finally {
      this._recomputing = false
    }
  }
}
