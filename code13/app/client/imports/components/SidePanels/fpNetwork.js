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
  
  getMeteorData: function() {
    return { meteorStatus: Meteor.status() }
  },

  render: function () {    
    const st = this.data.meteorStatus
    const cxnId = Meteor.default_connection._lastSessionId

    if (!st)
      return <div className="ui sub header">No Connection Status</div>

    const retryInSeconds = (MSTATUS_WAITING === st.status) ? Math.ceil((st.retryTime - (new Date()).getTime())/1000) : 0

    return (
      <div>
        <div className={`ui large ${st.connected ? "positive" : "negative"} message`}>
          <div className="header">Network {st.status}</div>
            { st.retryCount > 0 &&
              <ul className="list">
                <li><small>Connection retries attempted: </small>{st.retryCount}</li>
                { retryInSeconds > 0 &&
                  <li><small>Retry Interval: </small>{retryInSeconds} <small>seconds</small></li>
                }
                { (MSTATUS_FAILED === st.status) && 
                  <li>Connection Failed reason: "{st.reason}"</li>
                }
              </ul>
            }
          </div>
          <br />
        { !st.connected &&
          <a className="ui large primary button" onClick={() => Meteor.reconnect()}>
            Reconnect now
          </a>
        }
        <br />
        <br />
        <br />
        <p><small>Connection ID: {cxnId}</small></p>
      </div>
    )
  }
})