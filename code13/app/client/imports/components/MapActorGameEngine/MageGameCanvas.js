import PropTypes from 'prop-types'
import React from 'react'
import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'

// MapActorGameEngine GameCanvas
// This handles just rendering the current game frame based on data available to it...

export default class MageGameCanvas extends React.Component {
  constructor(props) {
    super(props)
  }

  cell = (x, y, fReturnMinusOneIfOutOfBounds = false) => {
    if (
      (fReturnMinusOneIfOutOfBounds && y > this.props.cellsHigh) ||
      x > this.props.cellsWide ||
      y < 0 ||
      x < 0
    )
      return -1
    return y * this.props.cellsWide + x // Arranged in rows
  }

  loadActorByName = actorName => {
    console.log(`actor not preloaded: ${actorName}`)
  }

  _drawActor = (ctx, image, effect, x, y) => {
    ctx.save()
    switch (effect) {
      case 'rotate90':
        ctx.translate(x + image.width / 2, y + image.height / 2)
        ctx.rotate(Math.PI / 2)
        ctx.drawImage(image, -image.width / 2, -image.height / 2)
        break
      case 'rotate180':
        ctx.translate(x + image.width / 2, y + image.height / 2)
        ctx.rotate(Math.PI)
        ctx.drawImage(image, -image.width / 2, -image.height / 2)
        break
      case 'rotate270':
        ctx.translate(x + image.width / 2, y + image.height / 2)
        ctx.rotate(Math.PI * 1.5)
        ctx.drawImage(image, -image.width / 2, -image.height / 2)
        break
      case undefined:
      // Actually there is a valid case for this - page animation before activeLayer is set up
      // console.log(`Unexpected draw-effect '${effect}' in _drawActor()`)
      // break... so fallthru
      case 'no effect':
        ctx.drawImage(image, x, y)
        break
      case 'flipX':
        ctx.scale(-1, 1)
        ctx.drawImage(image, -(x + image.width), y)
        break
      case 'flipY':
        ctx.scale(1, -1)
        ctx.drawImage(image, x, -(y + image.height))
        break
      default:
        console.error(`Unexpected draw-effect '${effect}' in _drawActor()`)
    }
    ctx.restore()
  }

  _drawPassiveLayer = (map, actors, tileData, layerIdx, tweenCount) => {
    const { _ctx } = this
    const startY = 0
    const endY = map.metadata.height
    const startX = 0
    const endX = map.metadata.width
    const ml = map.mapLayer[layerIdx]

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const actorName = ml[this.cell(x, y)]
        if (actorName && actorName != '') {
          const px = (x - startX) * 32 //- pixelShiftLeftX
          const py = (y - startY) * 32 //- pixelShiftUpY
          var actorAsset = actors[actorName]
          if (actorAsset) {
            var actor = actorAsset.content2
            const animationTableIndex = MgbActor.getAnimationIndex(actor, -1, -1, tweenCount)
            const newTileName = MgbActor.getAnimationTileFromIndex(actor, animationTableIndex)
            const effect = MgbActor.getAnimationEffectFromIndex(actor, animationTableIndex)
            const t = newTileName ? tileData[newTileName] : null
            if (t) this._drawActor(_ctx, t._image, effect, px, py)
          } else this.loadActorByName(actorName) // for next time around...
        }
      }
    }
  }

  // Render from ActiveActors[] array
  _drawActiveLayer = (map, actorData, tileData, activeActors, tweenCount) => {
    const { _ctx } = this

    // TODO - implement built-in scroll+crop system
    const hScroll = 0
    const vScroll = 0
    const renderWidth = map.metadata.width * MgbSystem.tileMinWidth
    const renderHeight = map.metadata.height * MgbSystem.tileMinHeight

    var aalen = activeActors.length
    for (let AAi = 0; AAi < aalen; AAi++) {
      const aa = activeActors[AAi]
      if (aa && aa.alive && aa._image) {
        // Potentially needs to be rendered.. if on-screen
        let x = aa.renderX - hScroll
        let y = aa.renderY - vScroll
        // Apply any position adjustments (Melee for example uses this)
        x += aa.renderOffsetCellsX * MgbSystem.tileMinWidth
        y += aa.renderOffsetCellsY * MgbSystem.tileMinHeight
        if (
          x + MgbSystem.tileMaxWidth >= 0 &&
          x <= renderWidth &&
          y + MgbSystem.tileMaxHeight >= 0 &&
          y <= renderHeight
        )
          this._drawActor(_ctx, aa._image, aa._effect, x, y)
      }
    }
  }

  doBlit = (mapData, actorData, tileData, activeActors, tweenCount) => {
    const ctx = this._ctx
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    this._drawPassiveLayer(mapData, actorData, tileData, 0, tweenCount)
    if (activeActors && activeActors.length > 0)
      this._drawActiveLayer(mapData, actorData, tileData, activeActors, tweenCount)
    else this._drawPassiveLayer(mapData, actorData, tileData, 1, tweenCount)
    this._drawPassiveLayer(mapData, actorData, tileData, 2, tweenCount)
  }

  prepCanvas = c => {
    this._canvas = c
    this._ctx = c ? c.getContext('2d') : null // Try alpha = false?
  }

  render() {
    const { cellsWide, cellsHigh } = this.props
    // Canvas strangely clips 2 pixels from height/width
    let height = Math.min(cellsHigh * 32, 680) + 2
    let width = Math.min(cellsWide * 32, window.innerWidth) + 2

    // maxHeight and maxWidth for #mgb-game-container determine the size of the game canvas - 680px to match map editor size
    return (
      <div
        id="mgb-game-container"
        style={{
          maxHeight: height + 'px',
          maxWidth: width + 'px',
          overflow: 'hidden',
          border: 'grey 1px solid',
        }}
      >
        <canvas
          id="mgb-game-canvas"
          ref={c => {
            this.prepCanvas(c)
          }}
          width={cellsWide * 32}
          height={cellsHigh * 32}
          style={{ display: 'block' }}
        />
      </div>
    )
  }
}
