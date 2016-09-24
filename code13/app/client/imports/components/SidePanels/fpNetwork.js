import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import { Message, Button } from 'stardust'

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
        <Message size="large" positive={st.connected} negative={!st.connected}>
          <Message.Header>Network {st.status}</Message.Header>
            { st.retryCount > 0 &&
              <Message.List>
                <Message.Item><small>Connection retries attempted: </small>{st.retryCount}</Message.Item>
                { retryInSeconds > 0 &&
                  <Message.Item><small>Retry Interval: </small>{retryInSeconds} <small>seconds</small></Message.Item>
                }
                { (MSTATUS_FAILED === st.status) && 
                  <Message.Item>Connection Failed reason: "{st.reason}"</Message.Item>
                }
              </Message.List>
            }
          </Message>
          <br />
        { !st.connected &&
          <Button size="large" primary onClick={() => Meteor.reconnect()}>
            Reconnect now
          </Button>
        }
        <br />
        <br />
        <br />
        <p><small>Connection ID: {cxnId}</small></p>
      </div>
    )
  }
})