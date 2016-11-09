'use strict'
import _ from 'lodash'
import React from 'react'
import TileSelection from './../Tools/SelectedTile.js'
import EditModes from './../Tools/EditModes.js'
import LayerTypes from './../Tools/LayerTypes.js'
import TileCollection from './../Tools/TileCollection.js'
import AbstractLayer from './AbstractLayer.js'
import TileHelper from './../Helpers/TileHelper.js'

import BaseMapArea from '../BaseMapArea.js'

export default class TileMapLayer extends AbstractLayer {
  static propTypes = Object.assign({
      clearSelection: React.PropTypes.func.isRequired, // cleans map selection
      clearTmpSelection: React.PropTypes.func.isRequired, // cleans temporary selection buffer
    }, AbstractLayer.propTypes)

  static drawDirection = {
    rightup: "rightup",
    leftdown: "leftdown",
    leftup: "leftup",
    rightdown: "rightdown"
  }
  constructor (...args) {
    super(...args)
    this.ctx = null
    this.prevTile = null
    this.mouseDown = false

    this.drawInterval = 10000
    this.nextDraw = Date.now() + this.drawInterval

    this.startingTilePos = null
    this.lastTilePos = null

    this.isDirtySelection = false
    this.isMouseOver = false

    this.drawInfo = {
      v: 1,
      h: 1,
      d: 0
    }
    // this holds tile transformations
    this.ctrl = {
      v: 1,
      h: 1,
      d: 0
    }
    this.now = 0 // _draw will set this timestamp
    this._mup = this.handleMouseUp.bind(this)

    this.lastEvent = null // store here last mouse event for furtherRef
    this.lastOffset = {x: 0, y: 0} // firefox loses offsets from event - so store repeately
  }
  componentDidMount (...args) {
    super.componentDidMount(...args)
    this.drawTiles()
  }

  componentWillUnmount (...args) {
    super.componentWillUnmount(...args)
  }

  /* endof lifecycle functions */

  increaseSizeToTop(pos){
    this.props.getLayers().forEach(l => {
      l._increaseSizeToTop && l._increaseSizeToTop(pos)
    })
  }
  _increaseSizeToTop (pos) {
    this.options.y -= this.props.mapData.tileheight
    for (let i = 0; i < this.options.width; i++) {
      this.options.data.unshift(0)
    }
    this.options.height++
    // adjust map to biggest layer
    if(this.props.mapData.height < this.options.height){
      this.props.mapData.height = this.options.height
    }
  }

  increaseSizeToRight(pos){
    this.props.getLayers().forEach(l => {
      l._increaseSizeToRight && l._increaseSizeToRight(pos)
    })
  }
  _increaseSizeToRight (pos) {
    // one step at the time..
    // this method will be called more - if necessary
    // reverse as first splice will resize array
    for (let i = this.options.height; i > 0; i--) {
      this.options.data.splice(i * this.options.width, 0, 0)
    }
    this.options.width++
    // adjust map to biggest layer
    if(this.props.mapData.width < this.options.width){
      this.props.mapData.width = this.options.width
    }
  }

  increaseSizeToBottom(pos){
    this.props.getLayers().forEach(l => {
      l._increaseSizeToBottom && l._increaseSizeToBottom(pos)
    })
  }

  _increaseSizeToBottom (pos) {
    for (let i = 0; i < this.options.width; i++) {
      this.options.data.push(0)
    }
    this.options.height++
    // adjust map to biggest layer
    if(this.props.mapData.height < this.options.height){
      this.props.mapData.height = this.options.height
    }
  }

  increaseSizeToLeft(pos){
    this.props.getLayers().forEach(l => {
      l._increaseSizeToLeft && l._increaseSizeToLeft(pos)
    })
  }
  _increaseSizeToLeft (pos) {
    this.options.x -= this.props.mapData.tilewidth
    // reverse as first splice will resize array
    for (let i = this.options.height - 1; i > -1; i--) {
      this.options.data.splice(i * this.options.width, 0, 0)
    }
    this.options.width++
    // adjust map to biggest layer
    if(this.props.mapData.width < this.options.width){
      this.props.mapData.width = this.options.width
    }
  }

  // this only tells renderer to draw in the rotated position
  rotate () {
    // this.ctrl.h = this.ctrl.h > 0 ? -1 : 1
    this.ctrl.d = !this.ctrl.d

    if (this.ctrl.h == 1 && this.ctrl.v == 1) {
      this.ctrl.h = -1
    }else {
      if (this.ctrl.v == 1) {
        this.ctrl.v = -1
      }else {
        if (this.ctrl.h == -1) {
          this.ctrl.h = 1
        }else {
          this.ctrl.v = 1
        }
      }
    }
  }
  rotateBack () {
    // this.ctrl.h = this.ctrl.h > 0 ? -1 : 1
    this.ctrl.d = !this.ctrl.d

    if (this.ctrl.h == 1 && this.ctrl.v == 1) {
      this.ctrl.v = -1
    }else {
      if (this.ctrl.h == 1) {
        this.ctrl.h = -1
      }else {
        if (this.ctrl.v == -1) {
          this.ctrl.v = 1
        }else {
          this.ctrl.h = 1
        }
      }
    }
  }
  resetRotation () {
    this.ctrl.d = false
    this.ctrl.h = 1
    this.ctrl.v = 1
  }
  flip () {
    this.ctrl.h = this.ctrl.h > 0 ? -1 : 1
  }

  fixRotation (id) {
    if (this.ctrl.h == -1) {
      this.options.data[id] |= TileHelper.FLIPPED_HORIZONTALLY_FLAG
    }
    if (this.ctrl.v == -1) {
      this.options.data[id] |= TileHelper.FLIPPED_VERTICALLY_FLAG
    }
    if (this.ctrl.d) {
      this.options.data[id] |= TileHelper.FLIPPED_DIAGONALLY_FLAG
    }
  }
  tileWithRotation (id) {
    let ret = id
    if (this.ctrl.h == -1) {
      ret |= TileHelper.FLIPPED_HORIZONTALLY_FLAG
    }
    if (this.ctrl.v == -1) {
      ret |= TileHelper.FLIPPED_VERTICALLY_FLAG
    }
    if (this.ctrl.d) {
      ret |= TileHelper.FLIPPED_DIAGONALLY_FLAG
    }
    return ret
  }

  getTilePosInfo (e) {
    const pos = new TileSelection()
    const props = this.props

    pos.updateFromPos(
      (e.offsetX / this.camera.zoom - this.camera.x) ,
      (e.offsetY / this.camera.zoom - this.camera.y) ,
      props.mapData.tilewidth, props.mapData.tileheight, 0
    )
    pos.getRawId(this.options.width)
    pos.gid = this.options.data[pos.id]
    return pos
  }
  getInfo () {
    return JSON.stringify(this.tilePosInfo)
  }

  selectRectangle (pos) {
    if (!this.startingTilePos) {
      this.props.addFirstToSelection(new TileSelection(pos))
      return
    }

    let startx, endx, starty, endy
    if (this.startingTilePos.x < pos.x) {
      startx = this.startingTilePos.x
      endx = pos.x
    }else {
      startx = pos.x
      endx = this.startingTilePos.x
    }
    if (this.startingTilePos.y < pos.y) {
      starty = this.startingTilePos.y
      endy = pos.y
    }else {
      starty = pos.y
      endy = this.startingTilePos.y
    }

    for (let y = starty; y <= endy; y++) {
      pos.y = y
      if (pos.y < 0 || pos.y > this.options.height - 1) {
        continue
      }
      for (let x = startx; x <= endx; x++) {
        pos.x = x
        if (pos.x < 0 || pos.x > this.options.width - 1) {
          continue
        }
        pos.getGidFromLayer(this.options)
        this.props.pushUniquePos(new TileSelection(pos))
      }
    }

    this.drawTiles()
  }

  // large maps are still slow on movement..
  // dirty rectalngles (in our case dirty tiles :) are great for super fast map movement
  draw () {
    this.nextDraw = Date.now()
  }
  drawTiles () {
    this.draw()
  }
  queueDrawTiles (timeout) {
    if (this.nextDraw - Date.now() > timeout) {
      this.nextDraw = Date.now() + timeout
    }
  }

  _draw (now) {
    if (!(this.nextDraw <= now)) {
      return
    }
    this.ctx.clearRect(0, 0, this.camera.width, this.camera.height)
    if(!this.isVisible){
      return
    }
    this.now = now
    const ts = this.props.data
    const d = ts.data
    const palette = this.props.palette
    const mapData = this.props.mapData
    const ctx = this.ctx
    const camera = this.camera

    const pos = {x: 0, y: 0}
    if (!d) {
      return
    }

    this.nextDraw = now + this.drawInterval

    const widthInTiles = Math.ceil((this.ctx.canvas.width / camera.zoom) / mapData.tilewidth)
    const heightInTiles = Math.ceil((this.ctx.canvas.height / camera.zoom) / mapData.tileheight)

    let skipy = Math.floor(-camera.y / mapData.tileheight)
    // at least for now
    if (skipy < 0) {skipy = 0;}
    let endy = skipy + heightInTiles * 2
    endy = Math.min(endy, this.options.height)
    // endy += 1

    let skipx = Math.floor(-camera.x / mapData.tilewidth)
    let endx = skipx + widthInTiles * 2
    endx = Math.min(endx, this.options.width)
    // endx += 1

    // loop through large tiles
    skipx -= widthInTiles
    skipy -= heightInTiles

    if (skipx < 0) {skipx = 0;}
    if (skipy < 0) {skipy = 0;}

    let i = 0, tileId, pal
    for (let y = skipy; y < endy; y++) {
      for (let x = skipx; x < endx; x++) {
        i = x + y * this.options.width
        // skip empty tiles
        if (!d[i]) {
          continue
        }
        TileHelper.getTilePosRel(i, this.options.width, mapData.tilewidth, mapData.tileheight, pos)

        tileId = d[i] & (~(TileHelper.FLIPPED_HORIZONTALLY_FLAG |
          TileMapLayer.FLIPPED_VERTICALLY_FLAG |
          TileMapLayer.FLIPPED_DIAGONALLY_FLAG))

        this.drawInfo.h = (d[i] & TileHelper.FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1
        this.drawInfo.v = (d[i] & TileHelper.FLIPPED_VERTICALLY_FLAG) ? -1 : 1
        this.drawInfo.d = (d[i] & TileHelper.FLIPPED_DIAGONALLY_FLAG)

        pal = palette[tileId]
        if (pal) {
          this.drawTile(pal, pos)
        }
      }
    }

    this.drawInfo.d = this.ctrl.d
    this.drawInfo.v = this.ctrl.v
    this.drawInfo.h = this.ctrl.h

    if (this.isMouseOver == true) {
      this._highlightTiles()
    }
    this.drawSelection()
    this.drawSelection(true)
  }
  drawTile (pal, pos, spacing = 0 , clear = false) {
    if(!pal.image){
      return
    }
    const props = this.props

    // special tileset cases - currently only animation
    if (pal.ts.tiles) {
      let tileId = pal.gid - (pal.ts.firstgid)
      const tileInfo = pal.ts.tiles[tileId]
      if (tileInfo) {
        if (tileInfo.animation) {
          const delta = this.now - this.props.startTime
          let tot = 0
          let anim
          /* e.g.
           duration: 200
           tileid: 11
           */
          for (let i = 0; i < tileInfo.animation.length; i++) {
            tot += tileInfo.animation[i].duration
          }
          const relDelta = delta % tot
          tot = 0
          for (let i = 0; i < tileInfo.animation.length; i++) {
            anim = tileInfo.animation[i]
            tot += anim.duration
            if (tot >= relDelta) {
              if (anim.tileid != tileId) {
                let gid = anim.tileid + pal.ts.firstgid
                this.queueDrawTiles(anim.duration - (tot - relDelta))
                pal = props.palette[gid]
                break
              }
              break
            }
          }
          this.queueDrawTiles(anim.duration - (tot - relDelta))
        }
      }
    }
    const camera = this.camera

    let drawX = (pos.x * (props.mapData.tilewidth + spacing) + camera.x) * camera.zoom
    let drawY = (pos.y * (props.mapData.tileheight + spacing) + camera.y) * camera.zoom

    let drawW = pal.w * camera.zoom
    let drawH = pal.h * camera.zoom

    // TODO: remove this at some point!!!
    if (this.options.tiledrawdirection) {
      this.options.mgb_tiledrawdirection = this.options.tiledrawdirection
      delete this.options.tiledrawdirection
    }

    if (this.options.mgb_tiledrawdirection && this.options.mgb_tiledrawdirection !== TileMapLayer.drawDirection.rightup) {
      if (this.options.mgb_tiledrawdirection == TileMapLayer.drawDirection.leftdown) {
        drawX -= (drawW - props.mapData.tilewidth * camera.zoom)
      }
      else if (this.options.mgb_tiledrawdirection == TileMapLayer.drawDirection.leftup) {
        drawX -= (drawW - props.mapData.tilewidth * camera.zoom)
        drawY -= (drawH - props.mapData.tileheight * camera.zoom)
      }
      // default browser canvas - do nothing
      else if (this.options.mgb_tiledrawdirection == TileMapLayer.drawDirection.rightdown) {
      }
    }
    // default for tiled is: right up
    else {
      drawY -= (drawH - props.mapData.tileheight * camera.zoom)
    }

    if (clear) {
      this.ctx.clearRect(
        drawX, drawY,
        props.mapData.tilewidth * camera.zoom,
        props.mapData.tileheight * camera.zoom
      )
    }
    this.ctx.save()
    const tx = drawX + drawW * 0.5
    const ty = drawY + drawH * 0.5
    this.ctx.translate(tx, ty)

    if (this.drawInfo.d) {
      // there should be more elegant way to rotate / flip tile
      this.ctx.rotate(-Math.PI * 0.5 * this.drawInfo.h * this.drawInfo.v)
      this.ctx.scale(this.drawInfo.h * -1, this.drawInfo.v)
    }else {
      this.ctx.scale(this.drawInfo.h, this.drawInfo.v)
    }

    this.ctx.translate(-tx, -ty)
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w , pal.h ,
      drawX, drawY,
      drawW, drawH
    )
    this.ctx.restore()
  }

  // drawTiles will call this
  _highlightTiles (off = this.lastOffset) {
    const palette = this.props.palette
    const camera = this.camera
    const layer = this.options
    const props = this.props
    const spacing = 0


    const pos = {
      x: 0,
      y: 0,
      id: 0,
      outOfBounds: false
    }

    TileHelper.getTileCoordsRel(off.x / camera.zoom - camera.x, off.y / camera.zoom - camera.y, props.mapData.tilewidth, props.mapData.tileheight, 0, pos)

    if (pos.x >= layer.width) {
      pos.outOfBounds = true
    }
    else if (pos.x < 0) {
      pos.outOfBounds = true
    }
    if (pos.y > layer.height) {
      pos.outOfBounds = true
    }
    else if (pos.y < 0) {
      pos.outOfBounds = true
    }
    pos.id = pos.x + pos.y * layer.width

    let sel, pal;
    const col = this.props.getCollection();

    if (this.props.options.randomMode) {
      sel = col.random()
      if (sel) {
        pal = palette[sel.gid]
        if (pal && pal.image) {
          this.ctx.globalAlpha = 0.6
          this.drawTile(pal, pos, 0)
          this.ctx.globalAlpha = 1
        }
      }
      this.highlightTile(pos, 'rgba(0,0,255,0.3)')
    }
    else if (col.length) {
      this.ctx.globalAlpha = 0.6
      const tpos = new TileSelection(pos)
      let ox = col[0].x
      let oy = col[0].y
      // TODO: this is messy and repeats for this layer an map in general - move to external source or smth like that
      // as highlight and map modify uses same logic only on different conditions
      for (let i = 0; i < col.length; i++) {
        sel = col[i]
        if (!sel) {
          continue
        }
        tpos.x = pos.x + sel.x - ox
        tpos.y = pos.y + sel.y - oy

        let gid = sel.gid
        // TODO: Feature: tiled rotates all selection also instead of tiles only
        /*if(map.collection.length > 1) {
          this.drawInfo.h = (gid & TileHelper.FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1
          this.drawInfo.v = (gid & TileHelper.FLIPPED_VERTICALLY_FLAG  ) ? -1 : 1
          this.drawInfo.d = (gid & TileHelper.FLIPPED_DIAGONALLY_FLAG  )
        }*/
        gid &= (~(TileHelper.FLIPPED_HORIZONTALLY_FLAG |
          TileMapLayer.FLIPPED_VERTICALLY_FLAG |
          TileMapLayer.FLIPPED_DIAGONALLY_FLAG)
        )

        pal = palette[gid]
        // draw tile image only when stamp mode is active
        if (pal && pal.image && this.props.getEditMode() == EditModes.stamp) {
          this.drawTile(pal, tpos, spacing)
        }
        this.highlightTile(tpos, 'rgba(0,0,255,0.3)')
      }
      this.ctx.globalAlpha = 1
    }
    this.prevTile = pos
  }
  highlightTile (pos, fillStyle) {
    const props = this.props
    const camera = this.camera
    const spacing = 0
    // make little bit smaller highlight - while zooming - alpha bleeds out a little bit
    let drawX = (pos.x * (props.mapData.tilewidth + spacing) + camera.x) * camera.zoom
    let drawY = (pos.y * (props.mapData.tileheight +spacing) + camera.y) * camera.zoom + 0.5

    let drawW = props.mapData.tilewidth * camera.zoom
    let drawH = props.mapData.tileheight * camera.zoom

    if (this.options.mgb_tiledrawdirection && this.options.mgb_tiledrawdirection !== 'rightup') {
      if (this.options.mgb_tiledrawdirection == 'leftdown') {
        drawX -= (drawW - props.mapData.tilewidth * camera.zoom)
      }
      else if (this.options.mgb_tiledrawdirection == 'leftup') {
        drawX -= (drawW - props.mapData.tilewidth * camera.zoom)
        drawY -= (drawH - props.mapData.tileheight * camera.zoom)
      }
      // default browser canvas - do nothing
      else if (this.options.mgb_tiledrawdirection == 'rightdown') {
      }
    }
    // default for tiled is: right up
    else {
      drawY -= (drawH - props.mapData.tileheight * camera.zoom)
    }

    if (!fillStyle) {
      this.ctx.clearRect(drawX, drawY, drawW, drawH)
    }else {
      this.ctx.fillStyle = fillStyle
      this.ctx.fillRect(drawX + 0.5, drawY + 0.5, drawW - 1, drawH - 1)
    }
  }

  drawSelection (tmp) {
    if (!this.props.isActive) {
      return
    }
    const palette = this.props.palette
    const toDraw = tmp ? this.props.getTmpSelection() : this.props.getSelection()

    for (let i = 0; i < toDraw.length; i++) {
      const sel = toDraw[i]
      if (!sel)
        continue

      let gid = sel.gid & (~(TileHelper.FLIPPED_HORIZONTALLY_FLAG |
        TileHelper.FLIPPED_VERTICALLY_FLAG |
        TileHelper.FLIPPED_DIAGONALLY_FLAG))

      const pal = palette[gid]
      if (pal) {
        this.drawInfo.h = (sel.gid & TileHelper.FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1
        this.drawInfo.v = (sel.gid & TileHelper.FLIPPED_VERTICALLY_FLAG) ? -1 : 1
        this.drawInfo.d = (sel.gid & TileHelper.FLIPPED_DIAGONALLY_FLAG)

        this.ctx.globalAlpha = 0.5
        this.drawTile(pal, sel)
        this.ctx.globalAlpha = 1
      }
      const color = tmp ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 127, 255, 0.1)'
      this.highlightTile(sel, color)
    }
  }
  /* events */
  handleMouseDown (e) {
    if (e.button == 0) {
      this.mouseDown = true
      // simulate 0 px movement
      this.handleMouseMove(e)
    }
  }
  // this should be triggered on window instead of main element
  handleMouseUp (e) {
    if (e.button !== 0) {
      return
    }
    const nat = e.nativeEvent ? e.nativeEvent : e

    this.mouseDown = false
    if (e.target == this.refs.canvas) {
      this.lastEvent = nat
      this.lastOffset.x = nat.offsetX;
      this.lastOffset.y = nat.offsetY;
      if (edit[this.props.getEditMode()]) {
        if (!this.options.visible) {
          return
        }
        edit[this.props.getEditMode()].call(this, nat, true)
      }else {
        edit.debug.call(this, nat, true)
      }
    }
  }
  handleMouseMove (e) {
    const nat = e.nativeEvent ? e.nativeEvent : e
    if (nat.target !== this.refs.canvas) {
      return
    }
    this.lastEvent = nat
    this.lastOffset.x = nat.offsetX;
    this.lastOffset.y = nat.offsetY;
    this.tilePosInfo = this.getTilePosInfo(e)

    this.isMouseOver = true
    if (edit[this.props.getEditMode()]) {
      // not visible
      if (!this.options.visible) {
        return
      }
      edit[this.props.getEditMode()].call(this, nat)
    }else {
      edit.debug.call(this, nat)
    }
  }
  onMouseLeave (e) {
    const nat = e.nativeEvent ? e.nativeEvent : e
    this.lastEvent = null;
    this.isMouseOver = false
    this.props.clearTmpSelection()
    //this.lastEvent = nat
    if (this.isDirtySelection) {
      this.props.clearSelection()
    }

    this.drawTiles()
  }

  onKeyUp (e) {
    const w = e.which

    if (w == 46) {
      const sel = this.props.getSelection()
      if (!sel.length)
        return
      for (let i = 0; i < sel.length; i++) {
        this.data.data[sel[i].id] = 0
      }
      sel.clear()
    }
    this.draw()
  }
  /* end of events */

  insertTile(id, gid){
    this.options.data[id] = gid
    // this makes filling tiles slow - as full update will start on changes
    // this.props.handleSave('Inserting Tiles')
  }
}

/* !!! this - in this scope is instance of tilemap layer (above) */
const edit = {
  debug: function (e, mouseUp) {
    const pos = this.getTilePosInfo(e)
    pos.gid = this.options.data[pos.id]
  }
}
// ???
edit[EditModes.fill] = function (e, up) {
  const pos = this.getTilePosInfo(e)
  const temp = this.props.getTmpSelection()
  const sel = this.props.getSelection()
  const col = this.props.getCollection()

  if (e.type == 'mouseup') {
    this.props.handleSave('Filling up')
  }

  if (up) {
    this.props.saveForUndo('Fill tilemap')
    for (let i = 0; i < temp.length; i++) {
      this.insertTile(temp[i].id, temp[i].gid)
      //this.options.data[temp[i].id] = temp[i].gid
    }
    for (let i = 0; i < sel.length; i++) {
      sel[i].gid = this.options.data[sel[i].id]
    }
    temp.clear()
    this.drawTiles()
    return
  }

  if (this.lastTilePos && this.lastTilePos.isEqual(pos)) {
    return
  }

  if (!col.length) {
    return
  }

  if (!sel.length || this.isDirtySelection) {
    sel.clear()
    // fill with magic wand
    // 1st time fill up tmp selection
    edit[EditModes.wand].call(this, e)
    // 2nd time draws filled selection
    edit[EditModes.wand].call(this, e, this.props.getTmpSelection())
    this.isDirtySelection = true
  }

  temp.clear()


  this.lastTilePos = pos

  const arr = this.props.getCollection().to2DimArray()

  let minx = this.options.width
  let miny = this.options.height
  for (let i = 0; i < sel.length; i++) {
    if (sel[i].x < minx) {
      minx = sel[i].x
    }
    if (sel[i].y < miny) {
      miny = sel[i].y
    }
  }

  let datay
  for (let i = 0; i < sel.length; i++) {
    let ins = new TileSelection(sel[i])

    datay = arr[(temp[i].y + miny) % arr.length]
    if (this.props.options.randomMode) {
      ins.gid = col.random().gid
    }else {
      // non rect selection
      const tmpTile = datay[(temp[i].x + minx) % datay.length]
      if(tmpTile){
        ins.gid = tmpTile.gid
      }
    }
    if (ins.gid) {
      ins.getRawId(this.options.width)
      if (sel.indexOfId(ins.id) > -1) {
        temp.push(ins)
      }
    }
  }
  this.drawTiles()
}
edit[EditModes.stamp] = function (e, up, saveUndo = true) {
  if (e.type != 'mousedown') {
    saveUndo = false
  }

  if (e.type == 'mouseup') {
    this.props.handleSave('Inserting Tiles')
  }

  if (e.shiftKey) {
    if (up) {
      this.props.swapOutSelection()
      this.props.selectionToCollection()
      this.props.clearSelection()
    }else {
      edit[EditModes.rectangle].call(this, e, up)
    }
    this.drawTiles()
    return
  }
  if (e.ctrlKey) {
    edit[EditModes.eraser].call(this, e, up)
    this.drawTiles()
    return
  }
  // nothing from tileset is selected
  const pos = this.getTilePosInfo(e)
  if (this.lastTilePos && this.lastTilePos.isEqual(pos) && !up && e.type != 'mousedown') {
    return
  }
  this.lastTilePos = pos

  const col = this.props.getCollection()
  const sel = this.props.getSelection()

  if (!col.length) {
    return
  }

  if (!this.mouseDown && !up) {
    this.drawTiles(e)
    return
  }

  if (this.props.options.randomMode) {
    let ts = new TileSelection(col.random())
    ts.gid = this.tileWithRotation(ts.gid)
    if (sel.length > 0) {
      if (sel.indexOfId(pos.id) > -1) {
        saveUndo && this.props.saveForUndo('Add Random Tile')
        this.insertTile(pos.id, ts.gid);
      }
    }
    else {
      // updating same tile - safe to skip
      if (this.props.data.data[pos.id] == ts.gid) {
        return
      }
      saveUndo && this.props.saveForUndo('Update Tile')
      if (pos.x < 0) {
        this.increaseSizeToLeft(pos)
        edit[EditModes.stamp].call(this, e, up, false)
        return
      }
      if (pos.y < 0) {
        this.increaseSizeToTop(pos)
        edit[EditModes.stamp].call(this, e, up, false)
        return
      }
      if (pos.x > this.options.width - 1) {
        this.increaseSizeToRight(pos)
        edit[EditModes.stamp].call(this, e, up, false)
        return
      }
      if (pos.y > this.options.height - 1) {
        this.increaseSizeToBottom(pos)
        // force "up" - increasing to bottom doesn't change position
        edit[EditModes.stamp].call(this, e, true, false)
        return
      }
      saveUndo && this.props.saveForUndo('Update Tile No: ' + pos.id)

      this.insertTile(pos.id, ts.gid);
      //this.options.data[pos.id] = ts.gid
    }
    this.drawTiles()
    return
  }

  const ox = col[0].x
  const oy = col[0].y

  let tpos = new TileSelection(pos)
  for (let i = 0; i < col.length; i++) {
    let ts = new TileSelection(col[i])
    ts.gid = this.tileWithRotation(ts.gid)

    tpos.x = ts.x + pos.x - ox
    tpos.y = ts.y + pos.y - oy
    tpos.id = tpos.x + tpos.y * this.options.width
    if (sel.length > 0 && sel.indexOfId(tpos.id) == -1) {
      continue
    }

    if (saveUndo) {
      this.props.saveForUndo('Update Tile')
      // save only once
      saveUndo = false
    }
    if (tpos.x < 0) {
      this.increaseSizeToLeft(tpos)
      edit[EditModes.stamp].call(this, e, up, false)
      return
    }
    if (tpos.y < 0) {
      this.increaseSizeToTop(tpos)
      edit[EditModes.stamp].call(this, e, up, false)
      return
    }
    if (tpos.x > this.options.width - 1) {
      this.increaseSizeToRight(tpos)
      edit[EditModes.stamp].call(this, e, up, false)
      return
    }
    if (tpos.y > this.options.height - 1) {
      this.increaseSizeToBottom(tpos)
      edit[EditModes.stamp].call(this, e, true, false)
      return
    }

    // updating same tile - safe to skip
    if (this.props.data.data[tpos.id] == ts.gid) {
      continue
    }
    this.insertTile(tpos.id, ts.gid)
    //this.options.data[tpos.id] = ts.gid
  }
  this.drawTiles()
}

// Eraser is actually stamp with gid = 0 - could be reused
// only stamp can resize map.. eraser shouldn't
edit[EditModes.eraser] = function (e, up) {
  if (!this.mouseDown && !up) {
    this.drawTiles()
    return
  }

  if (e.type == 'mouseup') {
    this.props.handleSave('Deleting Tile')
  }

  const pos = this.getTilePosInfo(e)
  const sel = this.props.getSelection()

  if (sel.length > 0) {
    if (sel.indexOfId(pos.id) > -1) {
      //this.props.saveForUndo('Delete tile')
      this.insertTile(pos.id, 0)
    }
  }
  else {
    //this.props.saveForUndo('Delete tile')
    this.insertTile(pos.id, 0)
  }
  this.drawTiles()
}
/* selections */
edit[EditModes.rectangle] = function (e, mouseUp) {
  this.drawTiles()
  const pos = this.getTilePosInfo(e)
  pos.gid = this.options.data[pos.id]
  if (mouseUp) {
    if (!e.shiftKey && !e.ctrlKey) {
      this.props.clearSelection()
    }
    if (e.shiftKey && e.ctrlKey) {
      this.props.keepDiffInSelection()
    }
    else if (e.ctrlKey) {
      this.props.removeFromSelection()
    }else {
      this.props.swapOutSelection()
    }
    this.drawTiles()
    return
  }

  const tmp = this.props.getTmpSelection()
  if (e.type == 'mousedown') {
    this.startingTilePos = new TileSelection(pos)
    if (tmp.length) {
      this.selectRectangle(pos)
    }else {
      tmp.clear()
    }
    this.drawTiles()
  }
  else if (this.mouseDown) {
    tmp.clear()
    this.selectRectangle(pos)
  }
  this.lastTilePos = pos
  this.isDirtySelection = false
}
edit[EditModes.wand] = function (e, up, collection = this.props.getTmpSelection()) {
  this.drawTiles()
  if (up) {
    if (!e.shiftKey) {
      this.props.clearSelection()
    }
    this.props.swapOutSelection()
    this.drawTiles()
    return
  }

  const pos = this.getTilePosInfo(e)
  if (this.lastTilePos && this.lastTilePos.isEqual(pos)) {
    return
  }
  collection.clear()
  this.lastTilePos = pos

  pos.gid = this.options.data[pos.id]

  // this is basically same as pathfinding
  const frontier = []
  const buff = []
  const np = new TileSelection()
  let check = 0

  const done = () => {
    while(buff.length){
      collection.pushUniquePos(buff.pop())
    }
    this.drawTiles()
  }
  const isUnique = (p) => {
    for (let i = 0; i < buff.length; i++) {
      if (buff[i].id == p.id) {
        return false
      }
    }
    for (let i = 0; i < frontier.length; i++) {
      if (frontier[i].id == p.id) {
        return false
      }
    }
    return true
  }
  const addToFrontier = (p) => {
    if (p.x >= 0 && p.x < this.options.width && p.y >= 0 && p.y < this.options.height) {
      if (pos.gid == p.gid && isUnique(p)) {
        frontier.push(p)
        return true
      }
    }
    return false
  }

  const fillSelection = () => {
    check++
    if (this.options.width * this.options.height < check) {
      done()
      return
    }
    if (!frontier.length) {
      done()
      return
    }
    const p = frontier.shift()

    if (p.gid == pos.gid) {
      buff.push(p)
      np.update(p)

      if (p.x < this.options.width - 1) {
        np.x = p.x + 1
        np.getGidFromLayer(this.options)
        addToFrontier(new TileSelection(np))
      }
      if (p.x > 0) {
        np.x = p.x - 1
        np.getGidFromLayer(this.options)
        addToFrontier(new TileSelection(np))
      }

      np.x = p.x
      if (p.y < this.options.height - 1) {
        np.y = p.y + 1
        np.getGidFromLayer(this.options)
        addToFrontier(new TileSelection(np))
      }
      if (p.y > 0) {
        np.y = p.y - 1
        np.getGidFromLayer(this.options)
        addToFrontier(new TileSelection(np))
      }
    }
    fillSelection()
  }
  if (addToFrontier(pos)) {
    fillSelection()
  }
  this.isDirtySelection = false
}
edit[EditModes.picker] = function (e, up) {
  this.drawTiles()
  const sel = this.props.getSelection()
  if (up) {
    if (!e.shiftKey && !e.ctrlKey) {
      sel.clear()
    }
    if (e.shiftKey && e.ctrlKey) {
      this.props.keepDiffInSelection()
    }
    else if (e.ctrlKey) {
      this.props.removeFromSelection()
    }else {
      this.props.swapOutSelection()
    }
    this.drawTiles()
    return
  }
  const pos = this.getTilePosInfo(e)
  if (this.lastTilePos && this.lastTilePos.isEqual(pos)) {
    return
  }
  const temp = this.props.getTmpSelection()
  temp.clear()
  this.lastTilePos = pos
  const tmp = new TileSelection()
  const d = this.options.data
  for (let i = 0; i < this.options.width * this.options.height; i++) {
    if (pos.gid == d[i]) {
      tmp.updateFromId(i, this.options.width)
      tmp.getGidFromLayer(this.options)
      temp.push(new TileSelection(tmp))
    }
  }
  this.drawTiles()
  this.isDirtySelection = false
}
