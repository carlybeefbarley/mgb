import React from 'react'
import { Grid, Segment } from 'semantic-ui-react'
import ChatMessagesView from '/client/imports/components/SidePanels/fpChat-messagesView.js'

export default class ChatPanel extends React.Component {
  render() {
    const { currUser, channelName } = this.props

    return (
      <Grid.Column stretched style={{ flex: '0 0 20em', overflowY: 'auto' }}>
        <Segment style={{ position: 'absolute', top: 0, bottom: 0 }}>
          <ChatMessagesView
            style={{ display: 'flex', flexFlow: 'column', height: '100%' }}
            pastMessageLimit={10}
            handleExtendMessageLimit={() => {
              return
            }}
            currUser={currUser}
            MessageContextComponent={null}
            channelName={channelName}
            tooltipPosition="top right"
          />
        </Segment>
      </Grid.Column>
    )
  }
}
