'use strict'
import _ from 'lodash'
import React from 'react'
import LayerTypes from './LayerTypes.js'

export default class Layers extends React.Component {

  componentDidMount () {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

  raise () {
    this.props.lowerOrRaiseObject()
  }

  lower () {
    this.props.lowerOrRaiseObject(true)
  }

  showOrHideObject (index) {

  }
  handleClick (index) {
    this.props.setPickedObject(index)
  }
  renderBlock (content = [] , active = 0) {
    let rise = '', lower = ''
    const activeLayer = this.props.getActiveLayer()
    if (activeLayer && content && content.length) {
      const d = activeLayer.data
      const l = d.objects ? d.objects.length - 1 : 0
      rise = (
        <button className={active < l && active > -1 ? 'ui floated icon button' : 'ui floated icon button disabled'} onClick={this.raise.bind(this)} title='Raise Object'>
          <i className='angle up icon'></i>
        </button>
      )
      lower = (
        <button className={active > 0 && active > -1 ? 'ui floated icon button' : 'ui floated icon button disabled'} onClick={this.lower.bind(this)} title='Lower Object'>
          <i className='angle down icon'></i>
        </button>
      )
    }

    return (
      <div className='mgbAccordionScroller'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> Objects </span>
          </div>
          <div className='active content menu'>
            <div className='ui mini' style={{ position: 'relative', top: '-10px' }}>
              <div className='ui icon buttons mini'>
                {rise}
                {lower}
              </div>
            </div>
            {content}
          </div>
        </div>
      </div>
    )
  }
  render () {
    const activeLayer = this.props.getActiveLayer()
    if (!activeLayer || activeLayer.type != LayerTypes.object) {
      return null
    }

    // TODO: refactor - so I don't need to access "private" member
    const active = this.props.activeObject
    const objects = activeLayer.data.objects
    const toRender = []

    for (let i = objects.length - 1; i > -1; i--) {
      let className = 'icon'
      + (objects[i].visible ? ' unhide' : ' hide')

      toRender.push(
        <div key={i} className={(i == active ? 'bold active' : 'item')} onClick={this.handleClick.bind(this, i)}>
          <i className={className} onClick={this.showOrHideObject.bind(this, i, objects[i].visible)}></i>
          <a href='javascript:;'>
            {objects[i].name || '(unnamed object)'}
          </a>
        </div>
      )
    }
    return this.renderBlock(toRender, active)
  }
}
