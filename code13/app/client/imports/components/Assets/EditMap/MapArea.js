import _ from 'lodash'
import React from 'react'

import BaseMapArea from '../Common/Map/BaseMapArea.js'

import TileMapLayer from '../Common/Map/Layers/TileMapLayer.js'
import GridLayer from '../Common/Map/Layers/GridLayer.js'
import ImageLayer from '../Common/Map/Layers/ImageLayer.js'
import ObjectLayer from '../Common/Map/Layers/ObjectLayer.js'

import TileSet from '../Common/Map/Tools/TileSet.js'
import Layers from './Tools/Layers.js'
import Properties from '../Common/Map/Tools/Properties.js'
import ObjectList from '../Common/Map/Tools/ObjectList.js'

import TileHelper from '../Common/Map/Helpers/TileHelper.js'
import ObjectHelper from '../Common/Map/Helpers/ObjectHelper.js'

import LayerTypes from '../Common/Map/Tools/LayerTypes.js'
import PositionInfo from '../Common/Map/Tools/PositionInfo.js'
import Camera from '../Common/Map/Camera.js'

import MapToolbar from './Tools/MapToolbar.js'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import Plural from '/client/imports/helpers/Plural.js'
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'

export default class MapArea extends BaseMapArea {

  constructor (props) {
    super(props)
  }


  set data (val) {
    // get layer first as later data won't match until full react sync
    const l = this.getActiveLayer()
    this.activeAsset.content2 = val
    l && l.clearCache && l.clearCache()
  }
  get data () {
    if (this.activeAsset && !this.activeAsset.content2.width) {
      this.activeAsset.content2 = TileHelper.genNewMap()
    }
    return this.activeAsset.content2
  }

  componentDidMount () {
    super.componentDidMount()
    this.fullUpdate(() => {
      this.isLoading = false
    })
  }

  /*
   * TODO: move tools to the EditMap.js
   * MapArea should not handle tools
   * */
  addLayerTool () {
    this.addTool('Layers', 'Layers', {map: this}, Layers)
  }
  addTileSetTool () {
    this.addTool('Tileset', 'Tilesets', {map: this}, TileSet)
  }
  addPropertiesTool () {
    this.addTool('Properties', 'Properties', {map: this}, Properties, true)
  }
  addObjectTool () {
    this.addTool('Objects', 'Object List', {map: this}, ObjectList, true)
  }

  addTools () {
    this.addLayerTool()
    this.addTileSetTool()
    this.addPropertiesTool()
    this.addObjectTool()
  }


  /* events */
  importFromDrop (e) {
    if (!this.props.parent.props.canEdit) {
      this.props.parent.props.editDeniedReminder()
      return
    }

    const layer = this.getActiveLayer()
    if (layer && layer.onDrop) {
      // layer by it's own can handle drop
      // e.g. image layer adds image
      // true - layer did something with dropped stuff
      if (layer.onDrop(e)) {
        return
      }
    }
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (asset) {
      // TODO: use enums for asset types
      if (asset.kind == 'graphic') {
        const layer_data = this.addLayer(LayerTypes.image)
        this.onImageLayerDrop(e, layer_data)
      // this.activateLayer(this.data.layers.length - 1)
      }
      return
    }

    const files = e.dataTransfer.files; // FileList object.
    // file has been dropped
    if (files.length) {
      Array.prototype.forEach.call(files, (file, i) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const ext = file.name.split('.').pop().toLowerCase()
          const method = 'handleFileByExt_' + ext
          if (this[method]) {
            this[method](file.name, e.target.result)
          }
        }
        reader.readAsArrayBuffer(file)
      })
    }
  }
  /* endof events */
  renderMap () {
    const data = this.data
    const layers = []
    layers.length = 0
    if (!data || !data.layers) {
      return (<div className='map-empty' ref='mapElement' />)
    }else {
      let i = 0
      for (; i < data.layers.length; i++) {
        if (!data.layers[i].visible) {
          continue
        }
        if (data.layers[i].type == LayerTypes.tile) {
          layers.push(<TileMapLayer
            data={data.layers[i]}
            key={i}
            anotherUsableKey={i}
            map={this}
            active={this.activeLayer == i} />)
        }
        else if (data.layers[i].type == LayerTypes.image) {
          layers.push(<ImageLayer
            data={data.layers[i]}
            key={i}
            map={this}
            anotherUsableKey={i}
            active={this.activeLayer == i} />)
        }
        else if (data.layers[i].type == LayerTypes.object) {
          layers.push(<ObjectLayer
            data={data.layers[i]}
            key={i}
            map={this}
            anotherUsableKey={i}
            active={this.activeLayer == i} />)
        }
      }
      layers.push(
        <GridLayer map={this} key={i} ref='grid' />
      )
      // TODO: adjust canvas size
      return (
        <div ref='mapElement' onContextMenu={e => {
                                       e.preventDefault(); return false;}} style={{ /*width: (640)+"px",*/ height: (640) + 'px', position: 'relative', margin: '10px 0' }}>
          {layers}
        </div>
      )
    }
  }

  render () {
    return (
      <div
        className='tilemap-wrapper'
        onDragOver={this.prepareForDrag.bind(this)}
        onDrop={this.importFromDrop.bind(this)}
        onWheel={this.handleOnWheel.bind(this)}>
        <MapToolbar map={this} ref='toolbar' />
        {this.getNotification()}
        {this.renderMap()}
        <PositionInfo getInfo={this.getInfo.bind(this)} ref='positionInfo' />
      </div>
    )
  }
}
