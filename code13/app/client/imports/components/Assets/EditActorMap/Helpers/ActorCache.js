import TileCache from '../../Common/Map/Helpers/TileCache.js'

export default class ActorCache extends TileCache {
  isReady() {
    return this.loaded == this.toLoad
  }
}
