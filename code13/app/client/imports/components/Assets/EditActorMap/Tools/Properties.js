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

  componentDidUpdate () {
    if (this.settings) {
      this.settings.map.update(this.map.data)
      //this.settings.layer.update(this.map.data.layers[this.map.activeLayer])
      //this.settings.tileset.update(this.map.data.tilesets[this.map.activeTileset])
      /*if (this.activeObject) {
        const o = this.activeObject.orig ? this.activeObject.orig : this.activeObject
        this.updateObject(o)
        this.settings.object.update(o)
      }*/
    }
  // $(this.refs.holder).find("select").dropdown()
  }

  get map () {
    return this.props.info.content.map
  }

  get activeObject () {
    const l = this.map.getActiveLayer()
    if (l && l.pickedObject)
      return l.pickedObject
    return null
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
    this.updateObject(this.activeObject)
    var that = this
    this.settings.map = new Otito(this.map.data, {
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
              that.map.resize()
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
              that.map.resize()
            },
            min: 1
          }
        }
      }
    }, (...args) => {
      this.map.forceUpdate()
      this.map.save("Updating map settings")
    // this.settings.update(this.map.data)
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
            <span className='explicittrigger'><i className='dropdown icon'></i> {this.props.info.title}</span>
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
