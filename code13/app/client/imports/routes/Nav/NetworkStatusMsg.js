import _ from 'lodash'
import propTypes from 'prop-types'
import React from 'react'
import { Segment, Header, List, Button } from 'semantic-ui-react'

// Meteor conection status values from https://docs.meteor.com/api/connections.html
const mStatus = {
  CONNECTED: 'connected', // the connection is up and running
  CONNECTING: 'connecting', // disconnected and trying to open a new connection
  FAILED: 'failed', // permanently failed to connect -  see .reason
  WAITING: 'waiting', // failed to connect and waiting to try to reconnect (see .retryTime)
  OFFLINE: 'offline', // user has disconnected the connection
}

const _isNetworkOK = meteorStatus =>
  _.includes([mStatus.CONNECTED, mStatus.CONNECTING], meteorStatus.status) && meteorStatus.retryCount === 0

const _doReconnect = () => Meteor.reconnect()

const style = {
  position: 'fixed',
  margin: 'auto',
  top: '6em',
  left: '2em',
  right: '2em',
  maxWidth: '50em',
}

const NetworkStatusMsg = ({ meteorStatus }) => {
  if (_isNetworkOK(meteorStatus)) return null

  const retryInSeconds =
    mStatus.WAITING === meteorStatus.status
      ? Math.ceil((meteorStatus.retryTime - new Date().getTime()) / 1000)
      : 0

  return (
    <Segment raised style={style}>
      <Header floated="left" color="red">
        Network offline: {meteorStatus.status}
      </Header>
      <Button floated="right" color="red" onClick={_doReconnect}>
        Reconnect now
      </Button>

      {meteorStatus.retryCount > 1 && (
        <List style={{ clear: 'both' }}>
          <List.Item>Connection retries attempted: {meteorStatus.retryCount}</List.Item>
          {retryInSeconds > 3 && (
            <List.Item>
              Auto-retry Interval:{' '}
              {
                retryInSeconds // 3 seconds is good to damp some of the flicker for initial quick retries
              }{' '}
              seconds
            </List.Item>
          )}
          {mStatus.FAILED === meteorStatus.status && (
            <List.Item>Connection Failed reason: "{meteorStatus.reason}"</List.Item>
          )}
        </List>
      )}
    </Segment>
  )
}

NetworkStatusMsg.propTypes = {
  meteorStatus: propTypes.object,
}

export default NetworkStatusMsg
