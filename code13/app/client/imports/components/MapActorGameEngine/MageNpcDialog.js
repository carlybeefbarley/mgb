import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { Segment, Header, Button, Icon, Label } from 'semantic-ui-react'

// MapActorGameEngine NPC Dialog
// This will be used as a modal/popup, and is instantiated when the game needs it. 

export default class MageNpcDialog extends Component {

  static propTypes = {
    message:            PropTypes.string,
    choices:            PropTypes.array,
    responseCallbackFn: PropTypes.func,
    activeActor:        PropTypes.object
  }

  render () {
    const { leftActor, message, choices, responseCallbackFn} = this.props
    return (
      <Segment>
        <Header as='h3'>{ message }</Header>
        <p>says '{leftActor.name}'</p>
        { _.map(choices, (choice,idx) => ( choice && 
            <p key={idx}>
              <Label onClick={() => responseCallbackFn(idx+1)}>
                <Icon name='comment outline' />&emsp;{choice} 
              </Label>
            </p>
            )
          )
        }
        <Button content='ok?' onClick={() => responseCallbackFn(0)}/>
      </Segment>
    )
  }
}
