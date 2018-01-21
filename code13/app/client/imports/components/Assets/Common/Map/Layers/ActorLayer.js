import TileMapLayer from './TileMapLayer.js'

export default class ActorLayer extends TileMapLayer {
  getInfo = () => {
    return this.tilePosInfo
  }
}
