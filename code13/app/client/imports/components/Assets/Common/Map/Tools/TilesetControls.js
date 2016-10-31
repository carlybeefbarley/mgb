'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
export default class TilesetControls extends React.Component {
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

  removeTileset () {
    const parent = this.props.tileset
    const map = parent.props.info.content.map
    const tss = map.data.tilesets
    const active = map.activeTileset

    map.activeTileset = 0
    tss.splice(active, 1)
    map.fullUpdate()
  }

  render () {
    return (
      <div className='ui mini'>
        <div className='ui icon buttons mini' style={{ position: 'relative', top: '-10px' }}>

          {/*<input
            type='text'
            onKeyUp={this.addImageFromInput.bind(this)}
            ref='input'
            style={{ fontSize: '15px' }} />
          <button className="ui floated icon button">
           <i className="add icon"></i>
           </button>
           <button className="ui floated icon button">
           <i className="signal icon"></i>
           </button>
           <button className="ui floated icon button">
           <i className="shop icon"></i>
           </button>*/}

        </div>
        <div className='ui icon buttons right floated mini' title='Remove Active Tileset' style={{ position: 'relative', top: '-10px' }}>
          <button className='ui icon button' onClick={this.props.removeTileset}>
            <i className='remove icon'></i>
          </button>
        </div>
      </div>
    )
  }

  // TODO(stauzs): thees functions need to be refactored - as they adds raw image to the map
  // but they should create new graphics asset and reference it....
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
  updateTileset (img, tileset) {
    const parent = this.props.tileset
    const map = parent.props.info.content.map
    const src = TileHelper.normalizePath(img.src)
    map.images.set(src, img)
    tileset.image = src

    map.updateImages(() => {
      map.update();})
  }
}
