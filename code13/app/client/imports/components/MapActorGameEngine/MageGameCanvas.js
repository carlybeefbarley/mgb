import React, { PropTypes } from 'react'
import { MgbActor } from './MageActorConstants'

// MapActorGameEngine GameCanvas
// This handles just rendering the current game frame based on data available to it...

export default class MageGameCanvas extends React.Component {
  constructor(props) {
    super(props)
  }

  cell(x, y, fReturnMinusOneIfOutOfBounds = false) {
    if (fReturnMinusOneIfOutOfBounds && y > this.props.cellsHigh || x > this.props.cellsWide || y < 0 || x < 0)
      return -1
    return y*this.props.cellsWide + x  // Arranged in rows
  }

  loadActorByName(actorName) 
  {
    console.log(`actor not preloaded: ${actorName}`)
    debugger
    // TODO - ask for this to be loaded? or say it isn't there.
  }

  _drawLayer(mapData, actorData, tileData, layerIdx, tweenCount) {
    const _ctx = this._ctx
    const startY = 0
    const endY = 111                          // FIXME
    const startX = 0
    const endX = 111                          // FIXME
    
    const ml = mapData.mapLayer[layerIdx]
    // const getAnimationTileFromIndex = (,) =>  FIXME
    // const getAnimationEffectFromIndex = (,) = FIXME

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const actorName = ml[this.cell(x, y)]
        if (actorName && actorName != '') {
          const px = ((x - startX) * 32) //- pixelShiftLeftX
          const py = ((y - startY) * 32) //- pixelShiftUpY
          var actor = actorData[actorName].content2
          if (actor) {
            const animationTableIndex = MgbActor.getAnimationIndex(actor, -1, -1, tweenCount)
            const newTileName = MgbActor.getAnimationTileFromIndex(actor, animationTableIndex)
            const effect = MgbActor.getAnimationEffectFromIndex(actor, animationTableIndex)
            const t = newTileName ? tileData[newTileName] : null
            if (t) {
              // const b = GetbitmapDataVariant(t, effect)     // NEED TO MAKE THIS
              // if (b)
                _ctx.drawImage(t._image, px, py)
            }
          } else
            this.loadActorByName(actorName) // for next time around...
        }
      }
    }
  }

  doBlit(mapData, actorData, tileData, tweenCount) {
    const ctx = this._ctx
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    for (let layerIdx = 0; layerIdx < 3; layerIdx++) {
      this._drawLayer(mapData, actorData, tileData, layerIdx, tweenCount)
    }
  }

  prepCanvas(c) {
    this._canvas = c
    this._ctx = c ? c.getContext('2d') : null // Try alpha = false? 
  }


  render() {
    const { cellsWide, cellsHigh } = this.props
    return ( 
      <canvas 
          ref = { c => { this.prepCanvas(c) } }
          width = { cellsWide * 32 }
          height = { cellsHigh * 32 }
          style = {{ border: 'grey 1px solid'}}
        />
    )
  }
}


