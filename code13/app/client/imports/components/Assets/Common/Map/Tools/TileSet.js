import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import TilesetControls from './TilesetControls.js'
import SelectedTile from './SelectedTile.js'

import EditModes from './EditModes.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import { AssetKindEnum } from '/imports/schemas/assets'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers.js'

export default class TileSet extends React.Component {
  /* lifecycle functions */
  constructor(...args) {
    super(...args)
    this.prevTile = null
    this.spacing = 1
    this.mouseDown = false
    this.mouseRightDown = false
    this.startingtilePos = null

    this.onMouseDown = this.onMouseDown.bind(this)
    this.renderTileset = this.renderTileset.bind(this)
    this.showTileListPopup = this.showTileListPopup.bind(this)
  }

  componentDidMount() {
    $('.ui.accordion').accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger' } })

    this.adjustCanvas()
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('touchmove', this.onMouseMove)

    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('touchend', this.onMouseUp)

    if (this.refs.canvas) this.refs.canvas.addEventListener('touchstart', this.onMouseDown)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('touchmove', this.onMouseMove)

    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('touchend', this.onMouseUp)

    if (this.refs.canvas) this.refs.canvas.removeEventListener('touchstart', this.onMouseDown)

    if (this.refs.modal) $(this.refs.modal).remove()
  }

  componentDidUpdate() {
    // re-render after update
    this.adjustCanvas()
    this.drawTiles()
  }

  /* endof lifecycle functions */

  get tileset() {
    // fallback to first tileset
    return this.props.tilesets[this.props.activeTileset] || this.props.tilesets[0]
  }

  get activeTileset() {
    return this.props.activeTileset == 0 ? 1 : this.props.activeTileset
  }

  /* helpers */
  adjustCanvas() {
    const ts = this.tileset
    const canvas = this.refs.canvas

    if (ts) {
      const w = TileHelper.getTilesetWidth(ts)
      const h = TileHelper.getTilesetHeight(ts)
      if (canvas.width != w) {
        canvas.width = w
      }
      if (canvas.height != h) {
        canvas.height = h
      }
    } else {
      canvas.width = 1
      canvas.height = 1
    }
    this.ctx = canvas.getContext('2d')
  }

  getTilePosInfo(e) {
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
  selectTile(e) {
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

  selectRectangle(e) {
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
    } else {
      startx = pos.x
      endx = this.startingtilePos.x
    }
    if (this.startingtilePos.y < pos.y) {
      starty = this.startingtilePos.y
      endy = pos.y
    } else {
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

  selectTileset(tilesetNum) {
    this.props.selectTileset(tilesetNum)
  }
  /* endof functionlity */

  /* drawing on canvas*/
  drawTiles() {
    this.prevTile = null
    const tss = this.props.tilesets
    const ts = this.tileset
    const ctx = this.ctx
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!ts) {
      return
    }
    const palette = this.props.palette
    const pos = { x: 0, y: 0 }

    const spacing = 1

    let gid = 0
    for (let i = 0; i < ts.tilecount; i++) {
      gid = ts.firstgid + i
      TileHelper.getTilePosRel(
        i,
        Math.floor((ts.imagewidth + spacing) / ts.tilewidth),
        ts.tilewidth,
        ts.tileheight,
        pos,
      )
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

  drawTile(pal, pos, info, clear = false) {
    if (clear) {
      this.ctx.clearRect(
        pos.x * (pal.ts.tilewidth + this.spacing),
        pos.y * (pal.ts.tileheight + this.spacing),
        pal.w,
        pal.h,
      )
    }
    const drawX = pos.x * (pal.ts.tilewidth + this.spacing)
    const drawY = pos.y * (pal.ts.tileheight + this.spacing)
    this.ctx.drawImage(pal.image, pal.x, pal.y, pal.w, pal.h, drawX, drawY, pal.w, pal.h)

    if (info && info.animation) {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 1)'
      // TODO: add nice animation icon
      this.ctx.beginPath()
      this.ctx.arc(drawX + pal.w - 10, drawY + pal.h - 10, 10, 0, Math.PI * 2)
      // this.ctx.fillRect(drawX + pal.w*0.5, drawY + pal.h*0.5, pal.w *0.5, pal.h*0.5)
      this.ctx.fill()
    }

    if (this.props.isTileSelected(pal.gid) > -1) {
      this.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
      this.ctx.fillRect(drawX, drawY, pal.w, pal.h)
    }
  }

  highlightTile(e) {
    const ts = this.tileset
    if (!ts) {
      return
    }
    const pos = this.getTilePosInfo(e)

    if (this.prevTile) {
      this.drawTiles()
    }

    this.ctx.fillStyle = 'rgba(0,0,255, 0.3)'
    this.ctx.fillRect(
      pos.x * ts.tilewidth + pos.x,
      pos.y * ts.tileheight + pos.y,
      ts.tilewidth,
      ts.tileheight,
    )
    this.prevTile = pos
  }
  /* endof drawing on canvas */

  /* events */
  onDropOnLayer(e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset || asset.kind != AssetKindEnum.graphic) {
      return
    }

    const infolink = '/api/asset/tileset-info/' + asset._id
    $.get(infolink, data => {
      this.props.updateTilesetFromData(data)
    })
  }

  onDropChangeTilesetImage(e) {
    e.preventDefault()
    e.stopPropagation()

    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset || asset.kind != 'graphic') {
      return
    }
    const infolink = '/api/asset/tileset-info/' + asset._id
    $.get(infolink, data => {
      this.props.updateTilesetFromData(data, this.tileset, true)
    })
  }

  onMouseDown(e) {
    e.preventDefault()

    if (e.button == 2) {
      this.mouseRightDown = true
      return false
    }

    if (this.props.options.mode != EditModes.fill && this.props.options.mode != EditModes.stamp) {
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

  onMouseUp = e => {
    this.mouseDown = false
    this.mouseRightDown = false
    this.drawTiles()
  }

  onMouseMove = e => {
    if (e.target !== this.refs.canvas) {
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

  onMouseLeave = e => {
    // remove highlighted tile
    this.drawTiles()
    this.prevTile = null
    this.mouseDown = false
  }
  /* endof events */

  /* react dom */

  renderContent(tileset) {
    return (
      <div
        className="active content tilesets accept-drop"
        data-drop-text="Drop asset here to create TileSet"
        onDragOver={DragNDropHelper.preventDefault}
        onDragEnter={DragNDropHelper.preventDefault}
        onDrop={this.onDropOnLayer.bind(this)}
        id="mgb_map_tileset_drop_area"
      >
        <TilesetControls removeTileset={this.props.removeTileset} tileset={tileset} ref="controls" />
        {!tileset ? <span>Drop Graphic (from side panel) here to create new tileset</span> : ''}
        <div
          className="tileset"
          ref="layer"
          style={{ maxHeight: '250px', overflow: 'auto', clear: 'both', cursor: 'default' }}
        >
          <canvas
            ref="canvas"
            onMouseDown={this.onMouseDown}
            onMouseLeave={this.onMouseLeave}
            onContextMenu={e => {
              e.preventDefault()
              return false
            }}
            id="mgb_map_tileset_canvas"
            className={!tileset ? 'empty' : ''}
          />
        </div>
        {this.props.children}
      </div>
    )
  }

  genTilesetList(index, isActive, tileset) {
    const title = `${tileset.name} ${tileset.imagewidth}x${tileset.imageheight}`
    return (
      <a
        className={isActive ? 'item active' : 'item'}
        href="javascript:;"
        onClick={this.selectTileset.bind(this, index, tileset)}
        key={index}
      >
        <span className="tileset-title-list-item">{title}</span>
      </a>
    )
  }

  genTilesetImage(index, isActive, tileset) {
    const title = `${tileset.name} ${tileset.imagewidth}x${tileset.imageheight}`
    return (
      <div
        title={title}
        className={'tilesetPreview' + (isActive ? ' active' : '')}
        key={index}
        onClick={() => {
          $(this.refs.modal).modal('hide')
          this.selectTileset(index)
        }}
      >
        <img src={makeCDNLink(tileset.image, makeExpireTimestamp(30))} />
        <span className="tilesetPreviewTitle">{tileset.name}</span>
      </div>
    )
  }

  renderTileset(from = 0, to = this.props.tilesets.length, genTemplate = this.genTilesetList) {
    const tss = this.props.tilesets
    let ts = this.tileset
    const tilesets = []
    for (let i = from; i < to; i++) {
      tilesets.push(genTemplate.call(this, i, tss[i] === ts, tss[i]))
    }
    return tilesets
  }

  showTileListPopup() {
    $(this.refs.modal)
      .modal('show')
      .modal('setting', 'transition', 'vertical flip') // first time there is default animation
  }

  renderForModal(from = 0, to = this.props.tilesets.length) {
    return (
      <div ref="modal" style={{ display: 'none' }} className="ui modal">
        <div className="content tilesetPreviewModal">
          {this.renderTileset(from, to, this.genTilesetImage)}
        </div>
      </div>
    )
  }

  renderOpenListButton(offset = 0) {
    if (this.props.tilesets.length < offset) {
      return null
    }
    return (
      <div className="showList" onClick={this.showTileListPopup}>
        <i className="ui external icon" />{' '}
      </div>
    )
  }

  renderEmpty() {
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon" /> Tilesets
            </span>
          </div>
          {this.renderContent(false)}
        </div>
      </div>
    )
  }

  render() {
    const ts = this.tileset
    if (!this.props.tilesets.length || !ts) {
      return this.renderEmpty()
    }
    const tilesets = this.renderTileset()

    return (
      <div className="mgbAccordionScroller tilesets">
        {this.renderForModal()}
        <div className="ui fluid styled accordion">
          <div
            className="active title accept-drop"
            data-drop-text="Drop asset here to update tileset image"
            onDragOver={DragNDropHelper.preventDefault}
            onDrop={this.onDropChangeTilesetImage.bind(this)}
          >
            <span className="explicittrigger">
              <i className="dropdown icon" /> Tilesets
            </span>
            <div
              className="ui simple dropdown top right basic grey below label item"
              style={{
                float: 'right',
                paddingRight: '20px',
                whiteSpace: 'nowrap',
                maxWidth: '70%',
                minWidth: '50%',
                top: '-5px',
              }}
            >
              <i className="dropdown icon" />
              <span
                className="tileset-title"
                title={ts.imagewidth + 'x' + ts.imageheight}
                style={{ textOverflow: 'ellipsis', maxWidth: '85%', float: 'right', overflow: 'hidden' }}
              >
                {ts.name} {ts.imagewidth + 'x' + ts.imageheight}
              </span>
              <div className="floating ui tiny green label">{this.props.tilesets.length}</div>
              <div className="menu" style={{ maxHeight: '295px', overflow: 'auto', maxWidth: '50px' }}>
                {tilesets}
              </div>
            </div>
            {this.renderOpenListButton()}
          </div>
          {this.renderContent(ts)}
        </div>
      </div>
    )
  }
}
