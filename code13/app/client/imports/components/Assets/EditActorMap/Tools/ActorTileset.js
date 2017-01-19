'use strict'
import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import { Label, Segment, Grid, Button, Icon } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'

import TileHelper from '../../Common/Map/Helpers/TileHelper.js'
import TilesetControls from '../../Common/Map/Tools/TilesetControls.js'
import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import TileCollection from '../../Common/Map/Tools/TileCollection.js'
import EditModes from '../../Common/Map/Tools/EditModes.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import ActorValidator from '../../Common/ActorValidator.js'

import ActorControls from './ActorControls.js'
import Tileset from '../../Common/Map/Tools/TileSet.js'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

const _dragHelpMsg = 'Drop Actor Assets here to use them in this ActorMap'

export default class ActorTileset extends React.Component  {
  constructor(...args){
    super(...args)
    this.prevTile = null
    this.spacing = 1
    this.mouseDown = false
    this.mouseRightDown = false
    this.startingtilePos = null

    this.onMouseDown = this.onMouseDown.bind(this)
    this.renderTileset = this.renderTileset.bind(this)
    this.showTileListPopup = this.showTileListPopup.bind(this)
    this.tilesetIndex = 1
  }
  
  componentDidMount () {
    this.adjustCanvas()
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('touchmove', this.onMouseMove)

    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('touchend', this.onMouseUp)

    if(this.refs.canvas){
      this.refs.canvas.addEventListener("touchstart", this.onMouseDown)
    }
  }

  componentWillUnmount () {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('touchmove', this.onMouseMove)

    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('touchend', this.onMouseUp)

    if(this.refs.canvas){
      this.refs.canvas.removeEventListener("touchstart", this.onMouseDown)
    }

    if(this.refs.modal){
      $(this.refs.modal).remove()
    }
  }

  componentDidUpdate(){
    // re-render after update
    this.adjustCanvas()
    this.drawTiles()
  }

  componentWillReceiveProps(p){
    if(p.activeTileset > 0){
      this.tilesetIndex = p.activeTileset
    }
  }

  /* endof lifecycle functions */

  get tileset(){
    return this.props.tilesets[this.tilesetIndex]
  }

  get activeTileset(){
    return this.props.activeTileset == 0 ? 1 : this.props.activeTileset
  }

  /* helpers */
  adjustCanvas () {

    const tilesets = this.props.tilesets
    const canvas = ReactDOM.findDOMNode(this.refs.canvas)

    tilesets.map( ts => {
      if (ts && canvas) {
        const w = TileHelper.getTilesetWidth(ts)
        const h = TileHelper.getTilesetHeight(ts)
        if(canvas.width != w){
          canvas.width = w
        }
        if(canvas.height != h){
          canvas.height = h
        }
              this.ctx = canvas.getContext('2d')
      }
    })
  }
  
  getTilePosInfo (e) {
    const ts = this.tileset
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
  selectTile (e) {
    if (!this.prevTile) {
      this.prevTile = this.getTilePosInfo(e)
      // failed to get prev tile.. e.g. click was out of bounds
      if (!this.prevTile) {
        return
      }
    }
    this.props.selectTile(new SelectedTile(this.prevTile))
    this.highlightTile(e, true)
  }

  selectRectangle (e) {
    const ts = this.tileset
    // new map!
    if (!ts) {
      return
    }

    const pos = this.getTilePosInfo(e)

    if (!e.ctrlKey) {
      this.props.clearActiveSelection()
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
        this.props.pushUnique(new SelectedTile(pos))
      }
    }

    this.props.resetActiveLayer()
    this.drawTiles()
  }

  selectTileset (tilesetNum) {
    this.props.selectTileset(tilesetNum)
  }
  /* endof functionlity */

  /* drawing on Canvas*/
  drawTiles () {
    this.prevTile = null
    const tss = this.props.tilesets
    const ts = this.tileset
    const ctx = this.ctx
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!ts) {
      return
    }
    const palette = this.props.palette
    const pos = {x: 0, y: 0}

    const spacing = 1

    let gid = 0
    for (let i = 0; i < ts.tilecount; i++) {
      gid = ts.firstgid + i
      TileHelper.getTilePosRel(i, Math.floor((ts.imagewidth + spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, pos)
      const pal = palette[gid]
      // missing image
      if (!pal || !pal.image) {
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

    if (this.props.isTileSelected(pal.gid) > -1) {
      this.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
      this.ctx.fillRect(
        drawX, drawY, pal.w, pal.h
      )
    }
  }

  highlightTile (e) {
    const ts = this.tileset
    if (!ts) {
      return
    }
    const pos = this.getTilePosInfo(e)

    if (this.prevTile) {
      this.drawTiles()
    }

    this.ctx.fillStyle = 'rgba(0,0,255, 0.3)'
    this.ctx.fillRect(pos.x * ts.tilewidth + pos.x, pos.y * ts.tileheight + pos.y, ts.tilewidth, ts.tileheight)
    this.prevTile = pos
  }
  /* endof drawing on Canvas */


  /* events */
 onDropOnLayer (e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    joyrideCompleteTag(`mgbjr-CT-MapTools-actors-drop`)
    if (!asset)
      return

    // TODO: create nice popup
    if (asset.kind !== "actor") {
      showToast("TD: Only Actors are supported in ActorMap ", 'warning')
      return
    }

    const name = asset.dn_ownerName +":"+ asset.name
    if (_.some(this.props.tilesets, { name: name } ) )
    {
      showToast(`TD: This Map already contains Asset '${name}'`, 'warning')
      return
    }

    this.props.startLoading()
    const tileset = {
      columns:      1,
      firstgid:     0,
      image:        '',
      imageheight:  0,
      imagewidth:   0,
      margin:       0,
      name:         name,
      spacing:      0,
      tilecount:    1,
      tileheight:   32,
      tilewidth:    32
    }
    const nextId = Infinity
    const map = { [name] : tileset }
    ActorHelper.loadActor(name, map, nextId, {}, null, () => {
      this.props.addActor(map[name])
    })
  }

  onDropChangeTilesetImage (e) {
    e.preventDefault()
    e.stopPropagation()

    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset || asset.kind != 'graphic') {
      return
    }
    const infolink = '/api/asset/tileset-info/' + asset._id
    $.get(infolink, (data) => {
      this.props.updateTilesetFromData(data, this.tileset, true)
    })
  }

  onMouseDown(e){
    e.preventDefault()

    if (e.button == 2) {
      this.mouseRightDown = true
      return false
    }

    if (this.props.options.mode != EditModes.fill
            && this.props.options.mode != EditModes.stamp) {
      this.props.setMode(EditModes.stamp)
    }

    if (!e.ctrlKey) {
      this.props.clearActiveSelection()
      this.props.resetActiveLayer()
    }
    this.mouseDown = true
    this.selectTile(e)
    this.startingtilePos = new SelectedTile(this.prevTile)
  }

  onMouseUp = (e) => {
    this.mouseDown = false
    this.mouseRightDown = false
    this.drawTiles()
  }

  onMouseMove = (e) => {
    if(e.target != this.refs.canvas){
      return
    }
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

  onMouseLeave = (e) => {
    // remove highlighted tile
    this.drawTiles()
    this.prevTile = null
    this.mouseDown = false
  }
  /* endof events */

   renderTileset(from = 0, to = this.props.tilesets.length, genTemplate = this.genTilesetList){
    const tss = this.props.tilesets
    let ts = this.tileset
    const tilesets = []
    for (let i = from; i < to; i++) {
      tilesets.push( genTemplate.call(this, i, tss[i] === ts, tss[i]) )
    }
    return tilesets
  }

  showTileListPopup(){
    $(this.refs.modal)
      .modal("show")
      .modal('setting', 'transition', 'vertical flip') // first time there is default animation
  }

  renderForModal(from = 0, to = this.props.tilesets.length){
    return (
      <div ref="modal" style={{display: "none"}} className="ui modal">
        <div className="content tilesetPreviewModal">
          {this.renderTileset(from, to, this.genTilesetImage)}
        </div>
      </div>
    )
  }

  renderOpenListButton(offset = 0){
    if(this.props.tilesets.length < offset){
      return null
    }
    return <div className="showList" onClick={this.showTileListPopup}><i className='ui external icon'></i> </div>
  }
  
  renderEmpty () {
    return (
       <Segment id="mgbjr-MapTools-actors" className='tilesets' style={{'height': '100%', 'margin':0 }}>
        <Label attached='top'>Actors </Label>
        <div className="content active actor-tileset-content">
          { this.renderContent(false) }
        </div>
      </Segment>
    )
  }
  
  renderContent (tilesets) {
    return (
      <div
        className='active tilesets accept-drop'
        onDrop={this.onDropOnLayer.bind(this)}
        onDragOver={DragNDropHelper.preventDefault}>
        {
          !tilesets 
          ? 
          <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>{_dragHelpMsg}</p>
          : 
          <div>
            <Button icon 
              onClick={this.props.removeTileset(this.props.activeTileset)}
              style={{float:'right'}}>
              <Icon name='trash' />
            </Button>
  
            {
              this.renderActors(1, tilesets.length, this.genActorImage).length > 0 
              ? 
              this.renderActors(1, tilesets.length, this.genActorImage)
              :
              <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>{_dragHelpMsg}</p>
            }
          </div>
        }
      </div>
    )
  }

  renderValidLayerInfo(checks, ts, active) {
    // how this differs from native [].reverse?
    return _.reverse(
      _.map(checks, (c, i) => {
          const isValid = c(ts);
          return(
            <div style={{ fontFamily: 'monospace', marginLeft: '2em', cursor: (isValid ? "pointer" : "auto") }}
                 key={i}
                 onClick={isValid ? () => {this.props.setActiveLayerByName(i)} : null}>
              {active == i ?
                <strong><i className='ui caret right icon' />{i}</strong> : <span><i className='ui icon' />{i}</span>}
                : &emsp;{isValid ?
                  <strong>Valid</strong>
                  : <small>Not valid</small>}
            </div>
          )
        }
      ))
  }

  render () {
    if (!this.props.tilesets.length) {
      return this.renderEmpty()
    }
    const tilesets = this.renderTileset(1)
    const ts = this.tileset
    if(!ts){
      return this.renderEmpty()
    }

    return (
      <Segment id="mgbjr-MapTools-actors" className='tilesets' style={{boxSizing: 'inherit', display: 'block', height: '100%', margin: 0}}>
        <Label attached='top'>Actors {this.renderOpenListButton(1)} {this.renderForModal(1)}</Label>
          <div className="content active actor-tileset-content">
            { this.renderContent(tilesets) }
          </div>
      </Segment>
    )
  }
<<<<<<< HEAD
}
      if (isValidForLayer)
=======
}
>>>>>>> c694ddfd04dcd83d3d279c8cc776e87cc42bd3f4
