import _ from 'lodash'
import React from 'react'
import { Accordion, Icon, List, Button } from 'semantic-ui-react'
import LayerTypes from './LayerTypes.js'

export default class ObjectList extends React.Component {
  raise() {
    this.props.lowerOrRaiseObject()
  }

  lower() {
    this.props.lowerOrRaiseObject(true)
  }

  showOrHideObject(index) {
    this.props.showOrHideObject(index)
    // TODO: @stausz remove this in favor of setState locally for the active item
    this.forceUpdate()
  }

  handleClick(event, index) {
    // do not change selection when toggling visibility icon
    if (_.includes(event.target.classList, 'icon')) return

    this.props.setPickedObject(index)
  }

  renderBlock(content = [], active = 0) {
    let rise = '',
      lower = '',
      remove = ''
    const activeLayer = this.props.getActiveLayer()
    if (activeLayer && content && content.length) {
      const d = activeLayer.data
      const l = d.objects ? d.objects.length - 1 : 0
      rise = (
        <Button
          icon="angle up"
          disabled={!(active < l && active > -1)}
          onClick={this.raise.bind(this)}
          title="Raise Object"
        />
      )
      lower = (
        <Button
          icon="angle down"
          disabled={!(active > 0 && active > -1)}
          onClick={this.lower.bind(this)}
          title="Lower Object"
        />
      )
      remove = (
        <Button
          icon="delete"
          size="mini"
          floated="right"
          onClick={this.props.removeObject}
          title="Remove Selected Object(s)"
        />
      )
    }

    const panels = [
      {
        title: 'Object List',
        content: {
          key: 'object-list-content',
          content: (
            <div>
              <Button.Group size="mini">
                {rise}
                {lower}
              </Button.Group>
              {remove}
              <List selection>{content}</List>
            </div>
          ),
        },
      },
    ]
    return <Accordion styled fluid defaultActiveIndex={0} panels={panels} />
  }

  render() {
    const activeLayer = this.props.getActiveLayer()
    if (!activeLayer || activeLayer.type !== LayerTypes.object) return null

    const active = this.props.activeObject
    const objects = activeLayer.data.objects
    const toRender = []
    _.times(objects.length, i => {
      if (objects[i].tmp) return
      toRender.unshift(
        <List.Item
          key={i}
          active={i == active}
          onClick={e => this.handleClick(e, i)}
          content={objects[i].name || '(unnamed object)'}
          icon={{
            name: objects[i].visible ? 'unhide' : 'hide',
            onClick: e => this.showOrHideObject(i, objects[i].visible),
          }}
        />,
      )
    })
    return this.renderBlock(toRender, active)
  }
}
