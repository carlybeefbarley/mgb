import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import refreshBadgeStatus from '/client/imports/helpers/refreshBadgeStatus'

// simple time displaying component
export default class AssetEdit extends React.Component {
  static propTypes = {
    time: PropTypes.string,
    asset: PropTypes.object,
  }

  render() {
    if (!this.props.time) return null
    return (
      <span>
        {_.capitalize(this.props.asset.kind)} editor experience: {this.props.time}
      </span>
    )
  }
}

// count time logic
export class EditTimeCounter {
  constructor(asset, currUser, onSecondTick) {
    this.asset = asset
    this.currUser = currUser
    this.onSecondTick = onSecondTick
    this.timeSec = 0 // only for ui
    this.timeMs = 0 // real counter
    this.dbTime = 0 // saves actual time in db

    // check if logged in
    if (!this.currUser) return null
    // count time only for user owned assets
    if (this.currUser._id != this.asset.ownerId) return null
    // get seconds from db
    if (!_.isEmpty(this.currUser.edit_time) && this.currUser.edit_time[this.asset.kind]) {
      this.dbTime = this.currUser.edit_time[this.asset.kind]
      this.timeMs = this.dbTime * 1000 // convert to miliseconds
    }

    // animframe for updating edit time
    this.startTime = Date.now()
    this.lastTime = this.startTime
    this.lastActivity = this.startTime
    this.inactivityInterval = 61 * 1000 // 61 seconds inactivity period stops timer
    this.updateDBinterval = 60 // each 60 seconds update database
    this._raf = () => {
      this.updateTimer()
      window.requestAnimationFrame(this._raf)
    }
    this._raf()
  }

  assetUpdated() {
    this.lastActivity = Date.now()
  }

  doUnmount() {
    this.unmount = true
    this._raf = () => {}
  }

  getTime() {
    return this.formatTime(this.timeSec)
  }

  updateTimer() {
    const now = Date.now()
    if (!this.unmount && now < this.lastActivity + this.inactivityInterval) {
      const deltaTime = now - this.lastTime
      this.lastTime = now
      this.timeMs += deltaTime
      const timeSec = Math.floor(this.timeMs / 1000)
      // update UI
      if (timeSec != this.timeSec) {
        this.timeSec = timeSec
        this.onSecondTick(this.formatTime(this.timeSec))
      }
      // update DB
      if (timeSec >= this.dbTime + this.updateDBinterval) {
        this.dbTime += this.updateDBinterval
        Meteor.call('User.addEditTime', this.asset.kind, this.updateDBinterval, (error, result) => {
          if (error) console.warn(error)
          else refreshBadgeStatus()
        })
      }
    } else {
      this.startTime = now
      this.lastTime = now
    }
  }

  formatTime(timeSec) {
    let formatedTime = '0s'
    if (timeSec < 60) {
      formatedTime = timeSec + 's'
    } else if (timeSec < 60 * 60) {
      const min = twoDigits(Math.floor(timeSec / 60))
      const sec = twoDigits(timeSec % 60)
      formatedTime = min + 'm' + sec + 's'
    } else if (timeSec < 60 * 60 * 24) {
      const fullMin = Math.floor(timeSec / 60)
      const hours = twoDigits(Math.floor(fullMin / 60))
      const min = twoDigits(fullMin % 60)
      formatedTime = hours + 'h' + min + 'm'
    } else {
      formatedTime = Math.floor(timeSec / 60) + 'm'
    }

    function twoDigits(num) {
      num += ''
      return num.length == 1 ? '0' + num : num
    }

    return formatedTime
  }
}
