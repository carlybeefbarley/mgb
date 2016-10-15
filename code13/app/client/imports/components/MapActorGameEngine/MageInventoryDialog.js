import React, { PropTypes } from 'react'
import { Menu, Segment, Header, Item } from 'semantic-ui-react'

// MapActorGameEngine Inventory
// This will be used as a modal/popup, and is instantiated when the game needs it. 



const SelectedItem = () =>
{
  return (
    <Item>
      SelectedItem goes here
    </Item>
  )
}



export default class MageInventoryDialog extends React.Component {

  state = { activeItem: 'Inventory' }

  handleItemClick = (e, { name } ) => this.setState({ activeItem: name })


  render () {
    const { activeItem } = this.state

    return (
      <Segment>
        <Header>INVENTORY</Header>
        <Segment raised>

          <SelectedItem />

          <Menu attached='top' tabular>
            <Menu.Item name='Inventory' active={activeItem === 'Inventory'} onClick={this.handleItemClick} />
            <Menu.Item name='Equipped'  active={activeItem === 'Equipped'} onClick={this.handleItemClick} />
          </Menu>

          <Segment attached='bottom'>
            foobar {activeItem}
          </Segment>

        </Segment>
      </Segment>
    )
  }
}