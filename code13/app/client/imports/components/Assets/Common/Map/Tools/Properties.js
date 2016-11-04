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
      this.settings.map.update(this.map.data)
      this.settings.layer.update(this.map.data.layers[this.map.activeLayer])
      this.settings.tileset.update(this.map.data.tilesets[this.map.activeTileset])
      if (this.activeObject) {
        const o = this.activeObject.orig ? this.activeObject.orig : this.activeObject
        this.updateObject(o)
        this.settings.object.update(o)
      }
    }
  // $(this.refs.holder).find("select").dropdown()
  }
  get map () {
    return this.props.map
  }

  get activeObject () {
    const l = this.map.getActiveLayer()
    if (l && l.pickedObject) {
      return l.pickedObject
    }
    return null
  }
  updateObject(obj){
    if(!obj){
      return
    }
    const o = obj.orig ? obj.orig : obj;
    // Otito.selfTest()
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
          console.log("deleted key:", i)
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
    var that = this;
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
            onchange: function(){
              console.log("change!!!")
            },
            array: {
              name: {
                _type: Otito.type.text,
                onchange: function(input, otito){
                  that.updateObject(otito.parent.object)
                }
              },
              value: {
                _type: Otito.type.text,
                onchange: function(input, otito){
                  that.updateObject(otito.parent.object)
                }
              }
            }
          }
        }
      }
    }, () => {
      this.map.redraw()
    })
    this.settings.object.append(this.refs.object)

    this.settings.map = new Otito(this.map.data, {
      Map: {
        _type: Otito.type.folder,
        contentClassName: 'ui content two column stackable grid',
        title: 'Hello world!',
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
          tile: {
            _type: Otito.type.folder,
            className: 'active',
            contentClassName: 'ui content two column stackable grid',
            content: {
              tilewidth: {
                _type: Otito.type.int,
                head: 'width',
                min: 1
              },
              tileheight: {
                _type: Otito.type.int,
                head: 'height',
                min: 1
              }
            }
          }
        }
      }
    }, (...args) => {
    })
    this.settings.map.append(this.refs.map)

    this.settings.layer = new Otito(this.map.data.layers[this.map.activeLayer], {
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

    })
    this.settings.layer.append(this.refs.layer)

    this.settings.tileset = new Otito(this.map.data.tilesets[this.map.activeTileset], {
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

    })
    this.settings.tileset.append(this.refs.tileset)
    $(this.refs.holder).find('select').dropdown()
    window.settings = this.settings
  }
  handleClick (layerNum) {}
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
            <div ref='tileset'></div>
            <div ref='layer'></div>
            <div ref='map'></div>
          </div>
        </div>
      </div>
    )
  }
}
