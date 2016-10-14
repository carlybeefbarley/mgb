'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
export default class ActorControls extends React.Component {

  addImageFromInput (e) {
    // enter key
    if (e.which != 13) {
      return
    }
    this.addTilesetFromUrl(this.refs.input.value)
    this.refs.input.value = ''
  }

  addTilesetFromUrl (url, asset) {
    if (!url) {
      return
    }
    let val = TileHelper.normalizePath(url)

    let img = new Image()
    img.onload = (e) => {
      this.addTileset(img, asset)
    }
    img.onerror = (e) => {
      console.error('failed to load image:', url, val)
    }
    img.src = val
  }
  updateTilesetFromUrl (url, tileset) {
    if (!url) {
      return
    }
    let val = TileHelper.normalizePath(url)
    let img = new Image()
    img.onload = (e) => {
      tileset.imagewidth = img.width
      tileset.imageheight = img.height
      this.updateTileset(img, tileset)
    }
    img.onerror = (e) => {
      console.error('failed to load image:', url, val)
    }
    img.src = val
  }

  updateTileset (img, tileset) {
    const parent = this.props.tileset
    const map = parent.props.info.content.map
    const src = TileHelper.normalizePath(img.src)
    map.images.set(src, img)
    tileset.image = src

    map.updateImages(() => {
      map.update();})
  }

  addTileset (img, asset) {
    const parent = this.props.tileset
    const map = parent.props.info.content.map
    const tss = map.data.tilesets
    const name = asset ? asset.name : img.src.split('/').pop()
    const ts = TileHelper.genTileset(map.data, img.src, img.width, img.height,
      map.data.tilewidth, map.data.tileheight, name
    )

    tss.push(ts)
    map.images.set(TileHelper.normalizePath(img.src), img)
    map.updateImages()
    parent.selectTileset(tss.length - 1)
  }
  updateTilesetFromData (data, ref = null) {
    const parent = this.props.tileset
    const map = parent.props.info.content.map
    let ts
    // guess tile size
    if (data.imagewidth == data.tilewidth) {
      ts = TileHelper.genTileset(map.data, data.image, data.imagewidth, data.imageheight)
    }
    // set known size
    else {
      ts = TileHelper.genTileset(map.data, data.image, data.imagewidth, data.imageheight,
        data.tilewidth, data.tileheight, data.name
      )
    }
    ts.tiles = data.tiles
    const tss = map.data.tilesets

    if(!ref) {
      tss.push(ts)
    }
    else{
      for(let i in ts){
        if(i == "firstgid"){
          continue;
        }
        ref[i] = ts[i]
      }
      // sen name for tilesets with one image
      if(data.name){
        ref.name = data.name
      }
    }

    const img = new Image()
    img.onload = () => {
      map.images.set(TileHelper.normalizePath(img.src), img)
      map.updateImages()
      if(!ref) {
        parent.selectTileset(tss.length - 1)
      }
    }
    img.src = data.image
  }

  removeTileset () {
    const parent = this.props.tileset
    const map = parent.props.info.content.map
    const tss = map.data.tilesets
    const active = map.activeTileset

    map.activeTileset = 0
    tss.splice(active, 1)

    // TODO: clean up map

    map.fullUpdate()
  }
  get active(){
    return this.props.tileset.props.info.content.map.activeTileset
  }
  render () {
    return (
      <div className='ui mini'>
        <div className='ui icon buttons mini' style={{ position: 'relative', top: '-10px' }}>
          {/*
          <button className="ui floated icon button">
             <i className="add icon"></i>
             </button>
             <button className="ui floated icon button">
             <i className="signal icon"></i>
             </button>
             <button className="ui floated icon button">
             <i className="shop icon"></i>
           </button>
             */}
        </div>
        {this.active > 0 &&
        <div className='ui icon buttons right floated mini' title='Remove Actor'
             style={{ position: 'relative', top: '-10px' }}>
          <button className='ui icon button' onClick={this.removeTileset.bind(this)}>
            <i className='remove icon'></i>
          </button>
        </div>
        }
      </div>
    )
  }
}
