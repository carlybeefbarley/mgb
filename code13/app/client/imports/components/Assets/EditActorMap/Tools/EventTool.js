'use strict'
import _ from 'lodash'
import React from 'react'

import TileHelper from '../../Common/Map/Helpers/TileHelper.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'

import ActorControls from './ActorControls.js'
import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import EditModes from '../../Common/Map/Tools/EditModes.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import ActorValidator from '../../Common/ActorValidator.js'


export default class Actor extends React.Component {
  /* lifecycle functions */
  constructor (...args) {
    super(...args)
    this.prevTile = null
    this.spacing = 1
    this.mouseDown = false
    this.mouseRightDown = false
    this.startingtilePos = null

    this.globalMouseMove = (e) => {
      if (!this.mouseRightDown) 
        return
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

    // race condition!!!!
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

    window.removeEventListener('mousemove', this.globalMouseMove)
    window.removeEventListener('mouseup', this.globalMouseUp)
  }
  /* endof lifecycle functions */

  get map () {
    return this.props.info.content.map
  }

  get data () {
    const map = this.map
    const tss = map.data.tilesets
    return tss[0]
  }

  /* helpers */
  adjustCanvas () {
    const map = this.props.info.content.map
    const ts = map.data.tilesets[0]
    const canvas = this.refs.canvas

    if (ts) {
      canvas.width = TileHelper.getTilesetWidth(ts)
      canvas.height = TileHelper.getTilesetHeight(ts)
    } else {
      canvas.width = 1
      canvas.height = 1
    }
    this.ctx = canvas.getContext('2d')
  }

  getTilePosInfo (e) {
    const map = this.map
    const ts = map.data.tilesets[0]
    // image has not been loaded
    if (!ts)
      return
    const pos = new SelectedTile()
    pos.updateFromMouse(e, ts, this.spacing)
    return pos
  }
  /* endof helpers */

  /* functionality */
  selectTile (e, clear) {
    const map = this.map
    if (!this.prevTile) {
      this.prevTile = this.getTilePosInfo(e.nativeEvent)
      // failed to get prev tile.. e.g. click was out of bounds
      if (!this.prevTile)
        return
    }

    const l = map.getActiveLayer()
    l && l.resetRotation && l.resetRotation()
    map.collection.pushOrRemove(new SelectedTile(this.prevTile))
    this.highlightTile(e.nativeEvent, true)
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
    if (!map.data)
      return

    const tss = map.data.tilesets
    const ts = tss[0]
    const ctx = this.ctx
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!ts)
      return

    const palette = map.palette
    const pos = {x: 0, y: 0}
    const spacing = map.spacing

    let gid = 0
    for (let i = 0; i < ts.tilecount; i++) {
      gid = ts.firstgid + i
      TileHelper.getTilePosRel(i, Math.floor((ts.imagewidth + spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, pos)
      const pal = palette[gid]
      // missing image
      if (!pal)
        return

      let tinfo = null
      if (ts.tiles && ts.tiles[i])
        tinfo = ts.tiles[i]

      this.drawTile(pal, pos, tinfo)
    }
  }

  drawTile (pal, pos, info, clear = false) {
    if (clear)
      this.ctx.clearRect(pos.x * (pal.ts.tilewidth + this.spacing), pos.y * (pal.ts.tileheight + this.spacing), pal.w, pal.h)

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
      this.ctx.fillRect(drawX, drawY, pal.w, pal.h)
    }
  }

  highlightTile (e) {
    const map = this.props.info.content.map
    const ts = map.data.tilesets[0]
    const pos = this.getTilePosInfo(e)

    if (this.prevTile) {
      this.drawTiles()
    }

    this.ctx.fillStyle = 'rgba(0,0,255, 0.3)'
    this.ctx.fillRect(pos.x * ts.tilewidth + pos.x, pos.y * ts.tileheight + pos.y, ts.tilewidth, ts.tileheight)
    this.prevTile = pos
  }
  /* endof drawing on canvas */

  /* events */
  onMouseDown(e) {
    // right button is used for scrolling
    if (e.button == 2) {
      this.mouseRightDown = true
      e.preventDefault()
      return false
    }
    this.map.setActiveLayerByName("Events")

    this.map.options.mode = EditModes.stamp
    // update active tool
    this.map.refs.toolbar.forceUpdate()

    if (!e.ctrlKey)
      this.map.clearActiveSelection()

    this.mouseDown = true
    this.selectTile(e)
    this.startingtilePos = new SelectedTile(this.prevTile)
  }

  onMouseUp(e) {
    this.mouseDown = false
    this.mouseRightDown = false
  }

  onMouseMove(e) {
    if (this.mouseRightDown) {
      this.refs.layer.scrollLeft -= e.movementX
      this.refs.layer.scrollTop -= e.movementY
      e.preventDefault()
      e.stopPropagation()
      return
    }
    this.highlightTile(e)
  }

  onMouseLeave(e) {
    // remove highlighted tile
    this.drawTiles()
    this.prevTile = null
    this.mouseDown = false
  }

  /* endof events */

  /* react dom */
  renderContent (tileset) {
    return (
      <div className='active tilesets'>
        <div className='tileset' ref='layer' style={{ maxHeight: '250px', overflow: 'auto', clear: 'both' }}>
          <canvas
            ref='canvas'
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onMouseMove={e => { this.onMouseMove(e.nativeEvent) } }
            onMouseLeave={this.onMouseLeave.bind(this)}
            onContextMenu={e => { e.preventDefault(); return false; } } >
          </canvas>
        </div>
      </div>
    )
  }

  render () {
    const map = this.props.info.content.map
    const tss = map.data.tilesets
    return (
      <div className='mgbAccordionScroller tilesets'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> {this.props.info.title}</span>
          </div>
          <div className="content active" style={{height: "52px"}}>
            {this.renderContent(tss[0])}
          </div>
        </div>
      </div>
    )
  }
}
