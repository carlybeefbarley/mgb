'use strict'
import React from 'react'
import Otito from '/client/imports/helpers/Otito'

export default class Properties extends React.Component {
  constructor (...args) {
    super(...args)
    this.ready = 0
    this.settings = null
  }

  componentDidMount () {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
    this.runOnReady()
  }

  updateObject(obj){
    if (!obj)
      return

    const o = obj.orig ? obj.orig : obj;
    // Otito.selfTest()
    if (!o.mgb_properties) {
      o.mgb_properties = []
      if (o.properties){
        for (let i in o.properties) {
          o.mgb_properties.push({
            name: i,
            value: o.properties[i]
          })
        }
      }
    }
    if (!o.properties)
      o.properties = {}
    else {
      for (let i in o.properties){
        if (!o.mgb_properties.find(n => n.name === i)) {
          console.log("deleted key:", i)
          delete o.properties[i]
        }
      }
    }

    var p = o.mgb_properties

    for (let i = 0; i < p.length; i++)
      o.properties[p[i].name] = p[i].value
  
    return o
  }
  
  runOnReady () {
    this.settings = {}
    //this.updateObject(this.props.getActiveObject())

    var that = this
    this.settings.map = new Otito(this.props.data, {
      Map: {
        _type: Otito.type.folder,
        open: true,
        contentClassName: 'ui content one column stackable grid active',
        title: '',
        content: {
          width: {
            _type: Otito.type.number,
            head: 'width',
            needsConfirmation: true,
            onchange: function(input) {
              if (!input.value)
                input.value = 1
              that.props.resize()
            },
            min: 1
          },
          height: {
            _type: Otito.type.number,
            head: 'height',
            needsConfirmation: true,
            onchange: (input) => {
              if (!input.value)
                input.value = 1
              that.props.resize()
            },
            min: 1
          }
        }
      }
    })
    this.settings.map.append(this.refs.map)

    $(this.refs.holder).find('select').dropdown()
    window.settings = this.settings
  }

  handleClick(layerNum) {}

  render () {
    const object = <div ref='object' style={{ display: this.activeObject ? 'block' : 'none' }}></div>
    return (
      <div className='mgbAccordionScroller'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> Properties</span>
          </div>
          <div className='active content menu' ref='holder'>
            {object}
            <div ref='map'></div>
          </div>
        </div>
      </div>
    )
  }
}
