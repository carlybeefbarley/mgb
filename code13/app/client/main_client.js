
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


// import Perf from "react-addons-perf"
// // Expose the React Performance Tools on the`window` object
// window.Perf = Perf

// prevent nasty Meteor error catching - which breaks break on exception functionality
if (Meteor.isDevelopment) {
  Tracker.Computation.prototype._recompute = function () {
    this._recomputing = true
    try {
      if (this._needsRecompute())
        this._compute()
    } finally {
      this._recomputing = false
    }
  }
}
