import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Label } from 'semantic-ui-react'
import { showToast } from '/client/imports/routes/App'

export default class AssetEdit extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    kind: PropTypes.string,
    lastUpdated: PropTypes.object,
  }
  constructor(props) {
    super(props)

    this.state = {
      timeSec: 0, // only for update UI purpose
    }
    this.timeMs = 0 // real counter
    this.dbTime = 0 // saves actual time in db
  }

  componentDidMount() {
    // get seconds from db
    if (!this.props.currUser) return null
    if (!_.isEmpty(this.props.currUser.edit_time) && this.props.currUser.edit_time[this.props.kind]) {
      this.dbTime = this.props.currUser.edit_time[this.props.kind]
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

  componentDidUpdate(prevProps, prevState) {
    if (this.props.lastUpdated !== prevProps.lastUpdated) {
      this.lastActivity = Date.now()
    }
  }

  componentWillUnmount() {
    this.unmount = true
    this._raf = () => {}
  }

  updateTimer = () => {
    const now = Date.now()
    if (!this.unmount && now < this.lastActivity + this.inactivityInterval) {
      const deltaTime = now - this.lastTime
      this.lastTime = now
      this.timeMs += deltaTime
      const timeSec = Math.floor(this.timeMs / 1000)
      // update UI
      if (timeSec != this.state.timeSec) {
        this.setState({ timeSec: timeSec })
      }
      // update DB
      if (timeSec >= this.dbTime + this.updateDBinterval) {
        this.dbTime += this.updateDBinterval
        Meteor.call('User.addEditTime', this.props.kind, this.updateDBinterval, (error, result) => {
          if (error) console.warn(error)
          else {
            Meteor.call('User.refreshBadgeStatus', (err, re) => {
              if (err) console.log('User.refreshBadgeStatus error', err)
              else {
                if (!re || re.length === 0) console.log(`No New badges awarded`)
                else showToast(`New badges awarded: ${re.join(', ')} `)
              }
            })
          }
        })
      }
    } else {
      this.startTime = now
      this.lastTime = now
    }
  }

  getTime = () => this.formatTime(this.state.timeSec)

  formatTime = timeSec => {
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

  render() {
    return <Label>{this.getTime()}</Label>
  }
}
