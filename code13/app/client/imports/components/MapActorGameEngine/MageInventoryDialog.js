import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Menu, Segment, Header, Icon, Item, Image, Button, Popup } from 'semantic-ui-react'

// MapActorGameEngine Inventory Dialog
// This will be used as a modal/popup, and is instantiated when the game needs it.

const itemImgSrc = (item, loadedGraphics) =>
  item ? loadedGraphics[item.actor.content2.databag.all.defaultGraphicName].thumbnail : null

const SelectedItem = props => {
  const { item, loadedGraphics, itemActionFn } = props
  return (
    <Item.Group style={{ height: '6.5em' }}>
      <Item>
        {item ? (
          <Item.Image
            size="tiny"
            src={itemImgSrc(item, loadedGraphics)}
            style={{ width: 'auto', maxWidth: '10em' }}
          />
        ) : (
          <p style={{ color: 'grey' }}>(Nothing selected)</p>
        )}

        {item && (
          <Item.Content>
            <Item.Header>{item.description}</Item.Header>
            <Item.Description>{item.equipDescription}</Item.Description>
            <Item.Extra>
              <Button
                size="small"
                content={item.equipped ? 'Un-Equip' : 'Equip'}
                disabled={!(item.equippable && !item.autoEquippable)}
                onClick={() => itemActionFn('EQUIP', item)}
              />
              <Button
                size="small"
                content="Use"
                disabled={!item.usable}
                onClick={() => itemActionFn('USE', item)}
              />
              <Button
                size="small"
                content="Drop"
                disabled={item.autoEquippable}
                onClick={() => itemActionFn('DROP', item)}
              />
              <Button
                size="small"
                content="Destroy"
                disabled={!item.autoEquippable}
                onClick={() => itemActionFn('DESTROY', item)}
              />
            </Item.Extra>
          </Item.Content>
        )}
      </Item>
    </Item.Group>
  )
}

export default class MageInventoryDialog extends React.Component {
  static propTypes = {
    inventory: PropTypes.object,
    graphics: PropTypes.object,
    itemActionFn: PropTypes.func,
    hideMe: PropTypes.func.isRequired,
  }

  state = { activeTab: 'Inventory', selectedInventory: -1, selectedEquipped: -1 }

  handleItemClick = (e, { name }) => this.setState({ activeTab: name })

  render() {
    const { activeTab } = this.state
    const { inventory, graphics, hideMe, itemActionFn } = this.props
    const selectionKey = 'selected' + activeTab
    const selectedIdx = this.state[selectionKey]
    const isInventory = activeTab === 'Inventory'
    const isEquipment = activeTab === 'Equipped'
    const itemsToShow = _.filter(inventory._invArray, item => item && item.equipped === isEquipment)

    return (
      <Segment>
        <Popup
          wide
          trigger={
            <Header>
              Inventory
              <span style={{ float: 'right' }}>
                <Icon name="close" onClick={hideMe} />
              </span>
            </Header>
          }
        >
          <Popup.Header>Player's Inventory.</Popup.Header>
          <Popup.Content>
            <p>This list lets you equip, drop or destroy items you have picked up.</p>
            <p>
              Use the <span className="mgb-keycap-button">I</span> key to hide/show this list
            </p>
          </Popup.Content>
        </Popup>
        <Segment>
          <SelectedItem
            item={selectedIdx === -1 ? null : itemsToShow[selectedIdx]}
            loadedGraphics={graphics}
            itemActionFn={(item, action) => {
              itemActionFn(item, action)
              this.setState({ [selectionKey]: -1 })
            }}
          />

          <p>
            Equipment Effect:{' '}
            {inventory.fullEquipmentEffectSummary || <span style={{ color: 'grey' }}>none</span>}
          </p>

          <Menu attached="top" tabular>
            <Menu.Item name="Inventory" active={isInventory} onClick={this.handleItemClick} />
            <Menu.Item name="Equipped" active={isEquipment} onClick={this.handleItemClick} />
          </Menu>

          <Segment attached="bottom">
            {_.map(itemsToShow, (item, idx) => (
              <Image
                key={idx}
                size="tiny"
                bordered={idx === selectedIdx}
                onClick={() => this.setState({ [selectionKey]: idx })}
                src={itemImgSrc(item, graphics)}
              />
            ))}
            {(!itemsToShow || itemsToShow.length === 0) && (
              <p style={{ color: 'grey' }}>
                {isEquipment ? '(No items equipped)' : '(No unequipped items in inventory)'}
              </p>
            )}
          </Segment>
        </Segment>
      </Segment>
    )
  }
}
