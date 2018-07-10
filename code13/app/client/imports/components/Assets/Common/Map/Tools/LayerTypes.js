// keep as strings for easier debugging
import TileMapLayer from '../Layers/TileMapLayer'
import ActorLayer from '../Layers/ActorLayer'
import EventLayer from '../Layers/EventLayer'
import ImageLayer from '../Layers/ImageLayer'
import ObjectLayer from '../Layers/ObjectLayer'

const LayerTypes = {
  tile: 'tilelayer',
  image: 'imagelayer',
  object: 'objectgroup',
  actor: 'mgb1-actor-layer',
  event: 'mgb1-event-layer',
}
const LayerComponents = {
  tilelayer: TileMapLayer,
  imagelayer: ImageLayer,
  objectgroup: ObjectLayer,
  'mgb1-actor-layer': ActorLayer,
  'mgb1-event-layer': EventLayer,
}

LayerTypes.toComponent = function(type) {
  return LayerComponents[type]
}
LayerTypes.isTilemapLayer = function(type) {
  switch (type) {
    case LayerTypes.tile:
    case LayerTypes.actor:
    case LayerTypes.event:
      return true
  }
  return false
}
export default LayerTypes
