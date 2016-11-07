'use strict'
import _ from 'lodash'
import React from 'react'
import Otito from '/client/imports/helpers/Otito.js'

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
      this.settings.map.update(this.props.map)
      this.settings.layer.update(this.props.layer)
      this.settings.tileset.update(this.props.tileset)
      if (this.activeObject) {
        // selection wraps some objects (shapes) .. but we need raw object data
        const o = this.activeObject.orig ? this.activeObject.orig : this.activeObject
        this.updateObject(o)
        this.settings.object.update(o)
      }
    }
  }
  get map () {
    return this.props.map
  }

  get activeObject () {
    return this.props.getActiveObject()
  }
  updateObject(obj){
    if(!obj){
      return
    }
    const o = obj.orig ? obj.orig : obj;
    if (!o.mgb_properties) {
      o.mgb_properties = []
      if(o.properties){
        for(let i in o.properties){
          o.mgb_properties.push({
            name: i,
            value: o.properties[i]
          })
        }
      }
    }
    if (!o.properties) {
      o.properties = {}
    }
    else{
      for(let i in o.properties){
        if(!o.mgb_properties.find(n => n.name === i)){
          delete o.properties[i]
        }
      }
    }

    var p = o.mgb_properties;
    for (let i = 0; i < p.length; i++) {
      o.properties[p[i].name] = p[i].value
    }

    return o
  }
  runOnReady () {
    this.settings = {}
    this.updateObject(this.activeObject)
    this.settings.object = new Otito(this.activeObject, {
      Object: {
        _type: Otito.type.folder,
        contentClassName: 'ui content two column stackable grid',
        content: {
          width: {
            _type: Otito.type.number,
            head: 'width',
            min: 1
          },
          height: {
            _type: Otito.type.number,
            head: 'height',
            min: 1
          },
          x: {
            _type: Otito.type.number
          },
          y: {
            _type: Otito.type.number
          },
          name: {
            _type: Otito.type.string
          },
          type: {
            _type: Otito.type.string
          },
          visible: {
            _type: Otito.type.bool
          },
          rotation: {
            _type: Otito.type.number
          },
          mgb_properties: {
            /*get head(){
              debugger;
              return "Properties"
            },
            set head(x){
              debugger;
            },*/
            head: "Properties",
            _type: Otito.type.array,
            onchange: () => {
              //console.log("change!!!")
            },
            array: {
              name: {
                _type: Otito.type.text,
                onchange: (input, otito) => {
                  this.updateObject(otito.parent.object)
                }
              },
              value: {
                _type: Otito.type.text,
                onchange: (input, otito) => {
                  this.updateObject(otito.parent.object)
                }
              }
            }
          }
        }
      }
    }, () => {
      this.props.updateObject(this.settings.object.object)
    })
    this.settings.object.append(this.refs.object)

    this.settings.map = new Otito(this.props.map, {
      Map: {
        _type: Otito.type.folder,
        contentClassName: 'ui content two column stackable grid',
        title: 'Hello world!',
        content: {
          width: {
            _type: Otito.type.number,
            head: 'width',
            min: 1,
            needsConfirmation: true,
            onchange: (input) => {
              if (!input.value)
                input.value = 1
              this.props.resize(this.settings.map.object)
            }
          },
          height: {
            _type: Otito.type.number,
            head: 'height',
            min: 1,
            needsConfirmation: true,
            onchange: (input) => {
              if (!input.value)
                input.value = 1
              this.props.resize(this.settings.map.object)
            }
          },
          tile: {
            _type: Otito.type.folder,
            className: 'active',
            contentClassName: 'ui content two column stackable grid',
            content: {
              tilewidth: {
                _type: Otito.type.int,
                head: 'width',
                min: 1,
                needsConfirmation: true,
                onchange: (input) => {
                  if (!input.value)
                    input.value = 1
                  this.props.changeTileSize(this.settings.map.object)
                }
              },
              tileheight: {
                _type: Otito.type.int,
                head: 'height',
                min: 1,
                needsConfirmation: true,
                onchange: (input) => {
                  if (!input.value)
                    input.value = 1
                  this.props.changeTileSize(this.settings.map.object)
                }
              }
            }
          }
        }
      }
    }, (...args) => {
      //this.props.updateMap(this.settings.map.object)
    })
    this.settings.map.append(this.refs.map)

    this.settings.layer = new Otito(this.props.layer, {
      Layer: {
        _type: Otito.type.folder,
        contentClassName: 'ui content one column stackable grid',
        content: {
          name: {
            _type: Otito.type.text,
            _className: 'fluid'
          },
          tiledrawdirection: {
            _type: Otito.type.hidden,
            head: 'TileDraw',
            value: 'rightup',
            className: 'ui dropdown fluid',
            list: {
              'rightdown': 'Right Down',
              'rightup': 'Right Up',
              'leftdown': 'Left Down',
              'leftup': 'Left Up'
            },
            _className: 'fluid' // fluid ui dropdown
          },
          Size: {
            _type: 'folder',
            contentClassName: 'ui content two column stackable grid',
            head: 'Size',
            content: {
              width: {
                _type: Otito.type.number,
                head: 'Width in tiles'
              },
              height: {
                _type: Otito.type.number,
                head: 'Height in tiles'
              }
            }
          },
          Offset: {
            _type: 'folder',
            contentClassName: 'ui content two column stackable grid',
            head: 'Offsets',
            content: {
              x: {
                _type: Otito.type.number,
                head: 'Horzontal offset'
              },
              y: {
                _type: Otito.type.number,
                head: 'Vertical offset'
              }
            }
          }
        }
      }
    }, () => {
      this.props.updateLayer(this.settings.layer.object)
    })
    this.settings.layer.append(this.refs.layer)

    this.settings.tileset = new Otito(this.props.tileset, {
      Tileset: {
        _type: 'folder',
        contentClassName: 'ui content',
        content: {
          name: {
            _head: 'Name',
            _type: Otito.type.text,
            _className: 'fluid'
          },
          Tiling: {
            _type: 'folder',
            head: 'Tiling',
            contentClassName: 'ui content two column stackable grid',
            content: {
              tilewidth: {
                _type: Otito.type.int,
                head: 'Tile width',
                min: 1,
                // return false to discard new value
                onchange: function (input, otito) {
                  if (!input.value) {
                    return false
                  }
                }
              },
              tileheight: {
                _type: Otito.type.int,
                head: 'Tile height',
                min: 1
              },
              margin: {
                _type: Otito.type.int,
                head: 'Margin',
                min: 0
              },
              spacing: {
                _type: Otito.type.int,
                head: 'Spacing',
                min: 0
              }
            }
          }

        }
      }
    }, () => {
      this.props.updateTileset(this.settings.tileset.object)
    })
    this.settings.tileset.append(this.refs.tileset)
    $(this.refs.holder).find('select').dropdown()
  }
  handleClick (layerNum) {}
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
            <div ref='tileset'></div>
            <div ref='layer'></div>
            <div ref='map'></div>
          </div>
        </div>
      </div>
    )
  }
}
