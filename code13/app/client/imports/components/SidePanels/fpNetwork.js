import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'

// Meteor conection status values from https://docs.meteor.com/api/connections.html
const MSTATUS_CONNECTED = "connected"         // the connection is up and running
const MSTATUS_CONNECTING = "connecting"       // disconnected and trying to open a new connection
const MSTATUS_FAILED = "failed"               // permanently failed to connect -  see .reason
const MSTATUS_WAITING = "waiting"             // failed to connect and waiting to try to reconnect (see .retryTime)
const MSTATUS_OFFLINE = "offline"             // user has disconnected the connection

export default fpNetwork = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:        PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:            PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:      PropTypes.string.isRequired   // Typically something like "200px". 
  },
  
  getMeteorData: function() {
    return {
      meteorStatus: Meteor.status()
    }
  },

  render: function () {    
    const st = this.data.meteorStatus

    if (!st)
      return <div>No Status</div>

    const retryInSeconds = (MSTATUS_WAITING === st.status) ? Math.ceil((st.retryTime - (new Date()).getTime())/1000) : 0

    return (
      <div>
        <div className="ui sub header">Connection Status</div>
        <ul>
          <li>Connection: {st.connected ? "Connected" : "Disconnected"}</li>
          { st.retryCount > 0 &&
            <li>Connection retries attempted: {st.retryCount}</li>
          }
          { retryInSeconds > 0 &&
            <li>Retry Interval: {retryInSeconds} seconds</li>
          }
          <li>Status: {st.status}</li>
          { (MSTATUS_FAILED === st.status) && 
            <li>Failed reason: {st.reason}</li>
          }
        </ul>
      </div>
    )
  },


})