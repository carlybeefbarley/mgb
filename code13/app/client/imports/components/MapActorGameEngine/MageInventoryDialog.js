import React, { PropTypes } from 'react'
import { Segment, Header } from 'semantic-ui-react'

// MapActorGameEngine Inventory
// This will be used as a modal/popup, and is instantiated when the game needs it. 

export default class MageInventoryDialog extends React.Component {

  render () {
    return (
      <Segment>
        <Header>INVENTORY</Header>
        <Segment raised>
          <p>...Coming</p>
          <p>...Soon</p>
        </Segment>
      </Segment>
    )
  }
}