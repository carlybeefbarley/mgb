import React, { PropTypes } from 'react'
import { Message, Button } from 'semantic-ui-react'

// Meteor conection status values from https://docs.meteor.com/api/connections.html
export const mStatus = {
  CONNECTED:   'connected',       // the connection is up and running
  CONNECTING:  'connecting',      // disconnected and trying to open a new connection
  FAILED:      'failed',          // permanently failed to connect -  see .reason
  WAITING:     'waiting',         // failed to connect and waiting to try to reconnect (see .retryTime)
  OFFLINE:     'offline'          // user has disconnected the connection
}

// The is a React.createClass() so it's easy to use Meteor.status() reactively

const fpNetwork = ( { meteorStatus } ) => {
  const st = meteorStatus
  const cxnId = Meteor.default_connection._lastSessionId

  if (!st)
    return <div className="ui sub header">No Connection Status</div>

  const retryInSeconds = (mStatus.WAITING === st.status) ? Math.ceil((st.retryTime - (new Date()).getTime())/1000) : 0

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
              { (mStatus.FAILED === st.status) && 
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
      <p className='mgb-show-on-parent-div-hover'><small>Meteor Connection ID: {cxnId}</small></p>
    </div>
  )
}

fpNetwork.propTypes = {
  meteorStatus:    PropTypes.object
}

export default fpNetwork