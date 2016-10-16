import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { Segment, Icon, Label, Item } from 'semantic-ui-react'

// MapActorGameEngine NPC Dialog
// This will be used as a modal/popup, and is instantiated when the game needs it. 

const actorImgSrc = (actor, loadedGraphics) => (
  actor ? loadedGraphics[actor.content2.databag.all.defaultGraphicName].thumbnail : null
)

export default class MageNpcDialog extends Component {

  static propTypes = {
    message:            PropTypes.string,
    choices:            PropTypes.array,
    responseCallbackFn: PropTypes.func,
    activeActor:        PropTypes.object,
    graphics:           PropTypes.object
  }

  render () {
    const { leftActor, message, choices, responseCallbackFn, graphics } = this.props
    return (
      <Segment>
        <Item.Group>
          <Item>
            <Item.Image src={actorImgSrc(leftActor, graphics) } />
            <Item.Content>
              <Icon name='remove' className='right floated' onClick={() => responseCallbackFn(0)}/>
              <Item.Header as='h4'>{ message }</Item.Header>
              { _.map(choices, (choice,idx) => (choice && 
                  <Item.Description key={idx}>
                    <Label onClick={() => responseCallbackFn(idx+1)}>
                      <Icon name='comment outline' />&ensp;{choice} 
                    </Label>
                  </Item.Description>
                  )
                )
              }
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
    )
  }
}
