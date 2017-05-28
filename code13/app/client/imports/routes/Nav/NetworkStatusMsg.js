import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Segment, Message, Button } from 'semantic-ui-react'

// Meteor conection status values from https://docs.meteor.com/api/connections.html
const mStatus = {
  CONNECTED:   'connected',       // the connection is up and running
  CONNECTING:  'connecting',      // disconnected and trying to open a new connection
  FAILED:      'failed',          // permanently failed to connect -  see .reason
  WAITING:     'waiting',         // failed to connect and waiting to try to reconnect (see .retryTime)
  OFFLINE:     'offline'          // user has disconnected the connection
}

const _isNetworkOK = meteorStatus => (
  _.includes([mStatus.CONNECTED, mStatus.CONNECTING], meteorStatus.status) && meteorStatus.retryCount === 0 
)
 
const _doReconnect = () => Meteor.reconnect()

const NetworkStatusMsg = ( { meteorStatus } ) => {
  if (_isNetworkOK(meteorStatus))
    return null
    
  const retryInSeconds = (mStatus.WAITING === meteorStatus.status) ? 
    Math.ceil((meteorStatus.retryTime - (new Date()).getTime())/1000) : 0
  
  return (
    <Segment basic padded> 
      <Message error>
        <Message.Header>
            Network offline: {meteorStatus.status}
            <Button floated='right' compact primary onClick={_doReconnect}>
              Reconnect now
            </Button>
        </Message.Header>

        { meteorStatus.retryCount > 0 &&
          <Message.List>
            <Message.Item>
              Connection retries attempted: {meteorStatus.retryCount}
            </Message.Item>
            { retryInSeconds > 0 &&
              <Message.Item>
                Retry Interval: {retryInSeconds} seconds
              </Message.Item>
            }
            { (mStatus.FAILED === meteorStatus.status) &&
                <Message.Item>
                  Connection Failed reason: "{meteorStatus.reason}"
                </Message.Item>
            }
          </Message.List>
        }
      </Message>
    </Segment>
  )
}

NetworkStatusMsg.PropTypes = {
  meteorStatus: PropTypes.object
}

export default NetworkStatusMsg