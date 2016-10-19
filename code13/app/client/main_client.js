import _ from 'lodash';
import React from 'react';

import { Routes } from '/client/imports/routes'; 

import '/imports/schemas/users.js';
import '/imports/schemas/assets.js';
import '/imports/schemas/chats.js';
import '/imports/schemas/projects.js';
import '/imports/schemas/activity.js';
import '/imports/schemas/activitySnapshots.js';
import { Tracker } from 'meteor/tracker'

// prevent nasty Meteor error catching - which breaks break on exception functionality
if(Meteor.isDevelopment) {
  Tracker.Computation.prototype._recompute = function () {
    this._recomputing = true
    try {
      if (this._needsRecompute()) {
        this._compute();
      }
    } finally {
      this._recomputing = false;
    }
  }
}
