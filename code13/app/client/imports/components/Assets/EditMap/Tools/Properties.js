"use strict";
import _ from 'lodash';
import React from 'react';

export default class Properties extends React.Component {
  constructor(...args){
    super(...args);
    this.ready = 0;
    this.settings = null;

    if(!window.Otito) {
      const s = document.createElement("script");
      s.onload = () => {
        window.setTimeout(() => {
          this.runOnReady();
        }, 0);
      };
      s.src = "/lib/Otito.js";
      document.head.appendChild(s);
    }
    else{
      this.runOnReady();
    }
  }
  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} });
    this.runOnReady();
  }
  componentDidUpdate(){
    if(this.settings){
      this.settings.map.update(this.map.data);
      this.settings.layer.update(this.map.data.layers[this.map.activeLayer]);
      this.settings.tileset.update(this.map.data.tilesets[this.map.activeTileset]);
      if(this.activeObject){
        this.settings.object.update(this.activeObject);
      }
    }
    //$(this.refs.holder).find("select").dropdown();
  }
  get map(){
    return this.props.info.content.map;
  }

  get activeObject(){
    const l = this.map.getActiveLayer();
    if(l && l.pickedObject){
      return l.pickedObject;
    }
    return null;
  }

  runOnReady(){
    this.ready++;
    if(this.ready <= 1) {
      return;
    }

    this.settings = {};
    //Otito.selfTest();

    this.settings.object = new Otito(this.activeObject, {
      Object:{
        _type: Otito.type.folder,
        contentClassName: "ui content two column stackable grid",
        content: {
          width: {
            _type: Otito.type.number,
            head: "width",
            min: 1
          },
          height: {
            _type: Otito.type.number,
            head: "height",
            min: 1
          },
          x: {
            _type: Otito.type.number,
          },
          y: {
            _type: Otito.type.number,
          },
          name: {
            _type: Otito.type.string,
          },
          type: {
            _type: Otito.type.string,
          },
          visible: {
            _type: Otito.type.bool,
          },
          rotation: {
            _type: Otito.type.number,
          },
          properties: {
            _type: Otito.type.array,
            array: {
              name: {
                _type: Otito.type.text,
              },
              value: {
                _type: Otito.type.text
              }
            }
          }
        }
      }
    }, () => {

    });
    this.settings.object.append(this.refs.object);

    this.settings.map = new Otito(this.map.data, {
      Map: {
        _type: Otito.type.folder,
        contentClassName: "ui content two column stackable grid",
        title: "Hello world!",
        content: {
          width: {
            _type: Otito.type.number,
            head: "width",
            min: 1
          },
          height: {
            _type: Otito.type.number,
            head: "height",
            min: 1
          },
          tile: {
            _type: Otito.type.folder,
            className: "active",
            contentClassName: "ui content two column stackable grid",
            content:{
              tilewidth: {
                _type: Otito.type.int,
                head: "width",
                min: 1
              },
              tileheight: {
                _type: Otito.type.int,
                head: "height",
                min: 1
              }
            }
          }
        }
      }
    }, (...args) => {
      this.map.forceUpdate();
      //this.settings.update(this.map.data);
    });
    this.settings.map.append(this.refs.map);

    this.settings.layer = new Otito(this.map.data.layers[this.map.activeLayer], {
      Layer: {
        _type: Otito.type.folder,
        contentClassName: "ui content one column stackable grid",
        content: {
          name: {
            _type: Otito.type.text,
            _className: "fluid"
          },
          tiledrawdirection: {
            _type: Otito.type.hidden,
            head: "TileDraw",
            value: "rightup",
            className: "ui dropdown fluid",
            list: {
              "rightdown": "Right Down",
              "rightup": "Right Up",
              "leftdown": "Left Down",
              "leftup": "Left Up"
            },
            _className: "fluid"// fluid ui dropdown
          },
          Size: {
            _type: "folder",
            contentClassName: "ui content two column stackable grid",
            head: "Size",
            content: {
              width: {
                _type: Otito.type.number,
                head: "Width in tiles"
              },
              height: {
                _type: Otito.type.number,
                head: "Height in tiles"
              }
            }
          },
          Offset: {
            _type: "folder",
            contentClassName: "ui content two column stackable grid",
            head: "Offsets",
            content: {
              x: {
                _type: Otito.type.number,
                head: "Horzontal offset"
              },
              y: {
                _type: Otito.type.number,
                head: "Vertical offset"
              }
            }
          }
        }
      }
    },() => {
      this.map.addLayerTool();
      this.map.redraw();
    });
    this.settings.layer.append(this.refs.layer);

    this.settings.tileset = new Otito(this.map.data.tilesets[this.map.activeTileset], {
      Tileset: {
        _type: "folder",
        contentClassName: "ui content",
        content: {
          name: {
            _head: "Name",
            _type: Otito.type.text,
            _className: "fluid"
          },
          Tiling: {
            _type: "folder",
            head: "Tiling",
            contentClassName: "ui content two column stackable grid",
            content: {
              tilewidth: {
                _type: Otito.type.int,
                head: "Tile width",
                min: 1,
                // return false to discard new value
                onchange: function(input, otito){
                  if(!input.value){
                    return false;
                  }
                }
              },
              tileheight: {
                _type: Otito.type.int,
                head: "Tile height",
                min: 1
              },
              margin: {
                _type: Otito.type.int,
                head: "Margin",
                min: 0
              },
              spacing: {
                _type: Otito.type.int,
                head: "Spacing",
                min: 0
              }
            }
          }

        }
      }
    }, () => {
      this.map.updateImages(() => {
        //this.map.addTilesetTool();
        //this.map.redraw();
      });
    });
    this.settings.tileset.append(this.refs.tileset);
    $(this.refs.holder).find("select").dropdown();
    window.settings = this.settings;
  }
  handleClick(layerNum){

  }
  render() {

    const object = <div ref="object" style={{
      display: this.activeObject ? "block" : "none"
    }}></div>;
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon"></i>
              {this.props.info.title}
            </span>
          </div>
          <div className="active content menu" ref="holder">
            {object}
            <div ref="tileset"></div>
            <div ref="layer"></div>
            <div ref="map"></div>
          </div>
        </div>
      </div>
    )
  }
}
