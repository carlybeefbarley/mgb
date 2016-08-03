'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import TilesetControls from './TilesetControls.js'
import SelectedTile from './SelectedTile.js'
import TileCollection from './TileCollection.js'

import EditModes from './EditModes.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'

export default class TileSet extends React.Component {
  /* lifecycle functions */
  constructor (...args) {
    super(...args)
    this.prevTile = null
    this.spacing = 1
    this.mouseDown = false
    this.mouseRightDown = false
    this.startingtilePos = null

    this.globalMouseMove = (e) => {
      if (!this.mouseRightDown) {
        return
      }
      this.onMouseMove(e)
    }
    this.globalMouseUp = (e) => {
      this.onMouseUp(e)
    }
  }
  componentDidMount () {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })

    this.adjustCanvas()
    this.props.info.content.map.tilesets.push(this)
    // racing condition!!!!
    // TODO: create global event handler with priorities
    window.addEventListener('mousemove', this.globalMouseMove, true)
    window.addEventListener('mouseup', this.globalMouseUp)
  }
  componentWillUnmount () {
    const mapTilesets = this.props.info.content.map.tilesets
    const index = mapTilesets.indexOf(this)
    if (index > -1) {
      mapTilesets.splice(mapTilesets.indexOf(this), 1)
    }
  }
  /* endof lifecycle functions */

  get map () {
    return this.props.info.content.map
  }
  get data () {
    const map = this.map
    const tss = map.data.tilesets
    const data = tss[map.activeTileset]
    return data
  }
  /* helpers */
  adjustCanvas () {
    const map = this.props.info.content.map
    const ts = map.map.tilesets[map.activeTileset]
    const canvas = this.refs.canvas

    if (ts) {
      canvas.width = TileHelper.getTilesetWidth(ts)
      canvas.height = TileHelper.getTilesetHeight(ts)
    }else {
      canvas.width = 1
      canvas.height = 1
    }

    this.ctx = canvas.getContext('2d')
  }
  getTilePosInfo (e) {
    const map = this.map
    const ts = map.data.tilesets[map.activeTileset]
    // image has not been loaded
    if (!ts) {
      return
    }
    const pos = new SelectedTile()
    pos.updateFromMouse(e, ts, this.spacing)
    return pos
  }
  /* endof helpers */

  /* functionality */
  selectTile (e, clear) {
    const map = this.map
    if (!this.prevTile) {
      this.prevTile = this.getTilePosInfo(e)
      // failed to get prev tile.. e.g. click was out of bounds
      if (!this.prevTile) {
        return
      }
    }
    const l = map.getActiveLayer()
    l && l.resetRotation && l.resetRotation()
    map.collection.pushOrRemove(new SelectedTile(this.prevTile))
    this.highlightTile(e.nativeEvent, true)
  }
  selectRectangle (e) {
    const map = this.map
    const ts = map.data.tilesets[map.activeTileset]
    // new map!
    if (!ts) {
      return
    }
    const pos = this.getTilePosInfo(e)

    if (!e.ctrlKey) {
      map.clearActiveSelection()
    }

    let startx, endx, starty, endy
    if (this.startingtilePos.x < pos.x) {
      startx = this.startingtilePos.x
      endx = pos.x
    }else {
      startx = pos.x
      endx = this.startingtilePos.x
    }
    if (this.startingtilePos.y < pos.y) {
      starty = this.startingtilePos.y
      endy = pos.y
    }else {
      starty = pos.y
      endy = this.startingtilePos.y
    }

    for (let y = starty; y <= endy; y++) {
      pos.y = y
      for (let x = startx; x <= endx; x++) {
        pos.x = x
        pos.getGid(ts, this.spacing)
        map.collection.pushUnique(new SelectedTile(pos))
      }
    }
    const l = map.getActiveLayer()
    l && l.resetRotation && l.resetRotation()
    this.drawTiles()
  }
  selectTileset (tilesetNum) {
    this.props.info.content.map.activeTileset = tilesetNum
    this.adjustCanvas()
    this.drawTiles()
    this.map.updateTools()
  }
  /* endof functionlity */

  /* drawing on canvas*/
  drawTiles () {
    this.prevTile = null

    const map = this.props.info.content.map
    // mas is not loaded
    if (!map.data) {
      return
    }
    const tss = map.data.tilesets
    const ts = tss[map.activeTileset]
    const ctx = this.ctx
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!ts) {
      return
    }
    const palette = map.gidCache
    const mapData = map.data

    const pos = {x: 0, y: 0}
    const spacing = map.spacing

    let gid = 0
    for (let i = 0; i < ts.tilecount; i++) {
      gid = ts.firstgid + i
      TileHelper.getTilePosRel(i, Math.floor((ts.imagewidth + spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, pos)
      const pal = palette[gid]
      // missing image
      if (!pal) {
        return
      }
      let tinfo = null
      if (ts.tiles && ts.tiles[i]) {
        tinfo = ts.tiles[i]
      }

      this.drawTile(pal, pos, tinfo)
    }
  }
  drawTile (pal, pos, info, clear = false) {
    if (clear) {
      this.ctx.clearRect(pos.x * (pal.ts.tilewidth + this.spacing), pos.y * (pal.ts.tileheight + this.spacing), pal.w, pal.h)
    }
    const map = this.props.info.content.map
    const drawX = pos.x * (pal.ts.tilewidth + this.spacing)
    const drawY = pos.y * (pal.ts.tileheight + this.spacing)
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w, pal.h,
      drawX, drawY, pal.w, pal.h
    )

    if (info && info.animation) {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 1)'
      // TODO: add nice animation icon
      this.ctx.beginPath()
      this.ctx.arc(drawX + pal.w - 10, drawY + pal.h - 10, 10 , 0, Math.PI * 2)
      // this.ctx.fillRect(drawX + pal.w*0.5, drawY + pal.h*0.5, pal.w *0.5, pal.h*0.5)
      this.ctx.fill()
    }
    if (map.collection.indexOfGid(pal.gid) > -1) {
      this.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
      this.ctx.fillRect(
        drawX, drawY, pal.w, pal.h
      )
    }
  }
  highlightTile (e, force = false) {
    const map = this.props.info.content.map
    const ts = map.map.tilesets[map.activeTileset]
    if (!ts) {
      return
    }
    const palette = map.gidCache
    const pos = this.getTilePosInfo(e)

    if (this.prevTile) {
      // TODO: optimize later - if needed.. currently redraw all
      this.drawTiles()
    /*if(this.prevTile.x == pos.x && this.prevTile.y == pos.y && !force){
      return
    }
    if(force){
      this.drawTiles()
    }
    else {
      let pal = palette[this.prevTile.gid]
      if (pal) {
        if(ts.tiles && ts.tiles[this.prevTile.id])
        const tsi = ts.tiles
        this.drawTile(pal, this.prevTile, null, true)
      }
      else {
        this.ctx.clearRect(
          this.prevTile.x * ts.tilewidth + this.prevTile.x,
          this.prevTile.y * ts.tileheight + this.prevTile.y,
          ts.tilewidth, ts.tileheight)
      }
    }*/
    }

    this.ctx.fillStyle = 'rgba(0,0,255, 0.3)'
    this.ctx.fillRect(pos.x * ts.tilewidth + pos.x, pos.y * ts.tileheight + pos.y, ts.tilewidth, ts.tileheight)
    this.prevTile = pos
  }
  /* endof drawing on canvas */

  /* events */
  onDropOnLayer (e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset) {
      return
    }

    const infolink = '/api/asset/tileset-info/' + asset._id
    $.get(infolink, (data) => {
      this.refs.controls.updateTilesetFromData(data)
    })
  }
  onDropChangeTilesetImage (e) {
    e.preventDefault()
    e.stopPropagation()
    const dataStr = e.dataTransfer.getData('text')
    let asset, data
    if (dataStr) {
      data = JSON.parse(dataStr)
    }
    asset = data.asset
    if (asset && asset.kind != 'graphic') {
      return
    }
    const url = data.link
    this.refs.controls.updateTilesetFromUrl(url, this.data)
  }

  onMouseDown (e) {
    if (e.button == 2) {
      this.mouseRightDown = true
      e.preventDefault()
      return false
    }
    if (this.map.options.mode != EditModes.fill && this.map.options.mode != EditModes.stamp) {
      this.map.options.mode = EditModes.stamp
    }

    // update active tool
    this.map.refs.tools.forceUpdate()

    if (!e.ctrlKey) {
      this.map.clearActiveSelection()
    }
    this.mouseDown = true
    this.selectTile(e)
    this.startingtilePos = new SelectedTile(this.prevTile)
  }
  onMouseUp (e) {
    this.mouseDown = false
    this.mouseRightDown = false
  }
  onMouseMove (e) {
    if (this.mouseRightDown) {
      this.refs.layer.scrollLeft -= e.movementX
      this.refs.layer.scrollTop -= e.movementY
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (this.mouseDown) {
      this.selectRectangle(e)
    }
    this.highlightTile(e)
  }
  onMouseLeave (e) {
    // remove highlighted tile
    this.drawTiles()
    this.prevTile = null
    this.mouseDown = false
  }
  /* endof events */

  /* react dom */
  renderEmpty () {
    return (
      <div className='mgbAccordionScroller'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> {this.props.info.title}</span>
          </div>
          {this.renderContent(false)}
        </div>
      </div>
    )
  }
  renderContent (tileset) {
    return (
      <div
        className='active content tilesets accept-drop'
        data-drop-text='Drop asset here to create TileSet'
        onDrop={this.onDropOnLayer.bind(this)}
        onDragOver={DragNDropHelper.preventDefault}>
        <TilesetControls tileset={this} ref='controls' />
        {!tileset ? <span>Drop Graphic (from side panel) here to create new tileset</span> : ''}
        <div className='tileset' ref='layer' style={{ maxHeight: '250px', overflow: 'auto', clear: 'both' }}>
          <canvas
            ref='canvas'
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onMouseMove={e => {
                           this.onMouseMove(e.nativeEvent)}}
            onMouseLeave={this.onMouseLeave.bind(this)}
            onContextMenu={e => {
                             e.preventDefault(); return false;}}>
          </canvas>
        </div>
      </div>
    )
  }
  render () {
    const map = this.props.info.content.map
    const tss = map.map.tilesets
    if (!tss.length) {
      return this.renderEmpty()
    }

    let ts = tss[map.activeTileset]
    // TODO: this should not happen - debug!
    if (!ts) {
      ts = tss[0]
    }
    const tilesets = []
    for (let i = 0; i < tss.length; i++) {
      let title = `${tss[i].name} ${tss[i].imagewidth}x${tss[i].imageheight}`
      tilesets.push(
        <a
          className={tss[i] === ts ? 'item active' : 'item'}
          href='javascript:;'
          onClick={this.selectTileset.bind(this, i)}
          key={i}><span className='tileset-title'>{title}</span></a>
      )
    }
    /* TODO: save active tileset and use only that as active */
    return (
      <div className='mgbAccordionScroller tilesets'>
        <div className='ui fluid styled accordion'>
          <div
            className='active title accept-drop'
            data-drop-text='Drop asset here to update tileset image'
            onDragOver={DragNDropHelper.preventDefault}
            onDrop={this.onDropChangeTilesetImage.bind(this)}>
            <span className='explicittrigger'><i className='dropdown icon'></i> {this.props.info.title}</span>
            <div className='ui simple dropdown item' style={{ float: 'right', paddingRight: '20px', 'whiteSpace': 'nowrap', 'maxWidth': '70%' }}>
              <i className='dropdown icon'></i><span className='tileset-title' title={ts.imagewidth + 'x' + ts.imageheight} style={{ 'textOverflow': 'ellipsis', 'maxWidth': '85%', float: 'right', 'overflow': 'hidden' }}>{ts.name} {ts.imagewidth + 'x' + ts.imageheight}</span>
              <div className='floating ui tiny green label'>
                {tss.length}
              </div>
              <div className='menu'>
                {tilesets}
              </div>
            </div>
          </div>
          {this.renderContent(ts)}
        </div>
      </div>
    )
  }
}
