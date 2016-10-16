import React, { PropTypes } from 'react'
import { Menu, Segment, Header, Item, Label, Image } from 'semantic-ui-react'

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

  state = { activeTab: 'Inventory' }

  handleItemClick = (e, { name } ) => this.setState({ activeTab: name })

  render () {
    const { activeTab } = this.state
    const { inventory, graphics } = this.props

    return (
      <Segment>
        <Header>INVENTORY</Header>
        <Segment raised>

          <SelectedItem />

          <Menu attached='top' tabular>
            <Menu.Item name='Inventory' active={activeTab === 'Inventory'} onClick={this.handleItemClick} />
            <Menu.Item name='Equipped'  active={activeTab === 'Equipped'} onClick={this.handleItemClick} />
          </Menu>

          <Segment attached='bottom'>
            { _.map( inventory._invArray, (item, idx) => {
              const imageSrc  = graphics[item.actor.content2.databag.all.defaultGraphicName].thumbnail
              return (
                <Label key={idx} >
                  <Image src={imageSrc} /> {item.name}
                </Label>
              )
            })
            }
          </Segment>

        </Segment>
      </Segment>
    )
  }
}