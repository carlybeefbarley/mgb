// MGBv1 to TMX like format conversion.. straight forward
/*
 layer <actors> => layer <tiles>
 actor => tileset + additional info
 tile => image
 */
// images are cached and observed in the TileCache
// here are cached and observed only Actors

import TileHelper from './TileHelper'
import ActorValidator from '../../ActorValidator'
import SpecialGlobals from '/imports/SpecialGlobals'
import { AssetKindEnum } from '/imports/schemas/assets'

import { observeAsset, mgbAjax, makeCDNLink } from '/client/imports/helpers/assetFetchers'

// 0 - jump
// 1 - music
const ACTION_IMAGE = SpecialGlobals.actorMap.actionsImage
const EVENT_LAYER = SpecialGlobals.actorMap.eventLayerId

// in this context:
// v1 - map format used by MGB_v1 (modified to fit MGB_v2 needs) - layers contain names
// v2 - TMX format - layers contain tile global ids

const ActorHelper = {
  TILES_IN_ACTIONS: SpecialGlobals.actorMap.actionsInImage,
  errorTypes: {
    MISSING_IMAGE: 'missing image',
    MISSING_ACTOR: 'missing actor',
    UNKNOWN_ACTOR: 'unknown actor',
    UNKNOWN_ACTION: 'unknown action tile',
  },
  layerNames: ['Background', 'Active', 'Foreground', 'Events'],
  errors: [],
  getErrors() {
    return ActorHelper.errors
  },
  v2_to_v1(data) {
    const d = {
      mapLayer: [],
      maxLayers: 4,
      metadata: {
        width: data.width,
        height: data.height,
      },
      meta: {
        tilesets: data.tilesets,
      },
    }

    const getActorName = (tileId, pos) => {
      if (!tileId) return ''

      // action tiles
      if (tileId <= this.TILES_IN_ACTIONS) return data.layers[EVENT_LAYER].mgb_events[pos]

      // data tilesets is not orderer.. after user add / removed tiles in the middle order gets screwed
      const ts = ActorHelper.getTilesetFromGid(tileId, data.tilesets)
      if (!ts) {
        console.error('Critical: Failed to locate tileset for gid:', tileId)
        ActorHelper.errors.push({ actor: tileId, error: ActorHelper.errorTypes.UNKNOWN_ACTOR })
        return ''
      }
      return ts.name
    }

    for (let i = 0; i < data.layers.length; i++) {
      for (let j = 0; j < data.layers[i].data.length; j++) {
        let ld = data.layers[i].data[j]
        if (!d.mapLayer[i]) d.mapLayer[i] = []
        d.mapLayer[i][j] = getActorName(ld, j)
      }
    }

    return d
  },

  v1_to_v2(data, names, cb, onChange, onRemovedActor) {
    ActorHelper.errors.length = 0
    if (!data.metadata) {
      cb(this.createEmptyMap())
      return
    }
    let makeInitialTilesets = false
    const dd = TileHelper.genNewMap()
    dd.images = {}
    dd.layers = []

    // delete data.meta - for testing purposes only
    if (data.meta && data.meta.tilesets) dd.tilesets = data.meta.tilesets
    else {
      // brand new map
      makeInitialTilesets = true
      dd.tilesets.push({
        name: 'Actions',
        firstgid: 1,
        image: ACTION_IMAGE,
        imageheight: 32,
        imagewidth: 64,
        margin: 0,
        spacing: 0,
        tilecount: this.TILES_IN_ACTIONS,
        tileheight: 32,
        tilewidth: 32,
      })
    }
    dd.images[ACTION_IMAGE] = ACTION_IMAGE
    dd.mgb_event_tiles = {}

    dd.height = parseInt(data.metadata.height, 10)
    dd.width = parseInt(data.metadata.width, 10)

    const actorMap = {}
    // last is action layer
    for (let i = 0; i < data.mapLayer.length - 1; i++) {
      for (let j = 0; j < data.mapLayer[i].length; j++) {
        let name = data.mapLayer[i][j]
        name = name || ''
        // make sure these is not conflicting with real actors - try to load anyway?
        if (name.indexOf('jump:') > -1 || name.indexOf('music:') > -1) {
          console.error(`Action ${name} in the NON action layer`)
          continue
        }
        if (name && actorMap[name] === void 0) {
          if (makeInitialTilesets) {
            // actions tileset should be already pushed
            // assume that we have only 1 image per tileset
            dd.tilesets.push({ name, firstgid: dd.tilesets.length + this.TILES_IN_ACTIONS }) //TileHelper.getNextGid(dd.tilesets[dd.tilesets.length - 1])})
          }
          // will be filled later
          actorMap[name] = {
            columns: 1,
            firstgid: 0,
            image: '',
            imageheight: 0,
            imagewidth: 0,
            margin: 0,
            name,
            spacing: 0,
            tilecount: 1,
            tileheight: 0,
            tilewidth: 0,
          }
        }
      }
    }

    this.loadActors(
      actorMap,
      names,
      dd.images,
      () => {
        const keys = Object.keys(actorMap)

        // we already have actor in the tilesets.. map it and update actor
        keys.forEach(n => {
          dd.tilesets.forEach((ts, index) => {
            const actor = actorMap[n]
            if (ts.name === n) {
              // set correct firstgid
              actor.firstgid = ts.firstgid
              // make sure actor is updated
              dd.tilesets[index] = actor
            }
          })
        })

        for (let i = 0; i < data.mapLayer.length - 1; i++) {
          let layer = {
            name: ActorHelper.layerNames[i],
            visible: true,
            data: [],
            height: parseInt(data.metadata.height, 10),
            width: parseInt(data.metadata.width, 10),
            draworder: 'topdown',
            mgb_tiledrawdirection: 'rightdown',
            type: 'mgb1-actor-layer',
            x: 0,
            y: 0,
          }
          for (let j = 0; j < data.mapLayer[i].length; j++) {
            const name = data.mapLayer[i][j]
            layer.data.push(name && actorMap[name] ? actorMap[name].firstgid : 0)
          }
          dd.layers.push(layer)
        }

        // Event layer
        let layer = {
          name: 'Events',
          visible: true,
          data: [],
          height: parseInt(data.metadata.height, 10),
          width: parseInt(data.metadata.width, 10),
          draworder: 'topdown',
          type: 'mgb1-event-layer',
          x: 0,
          y: 0,
          mgb_tiledrawdirection: 'rightdown',
          mgb_events: [],
        }

        for (let j = 0; j < data.mapLayer[EVENT_LAYER].length; j++) {
          let name = data.mapLayer[EVENT_LAYER][j]
          if (name) {
            /*
           jump (teleport)
           music
           */
            layer.mgb_events.push(name)
            layer.data.push(this.eventNameToTile(name))
          } else {
            layer.data.push(0)
            layer.mgb_events.push('')
          }
        }
        dd.layers.push(layer)
        if (data.meta) {
          dd.tilesets = data.meta.tilesets
          // dd.meta.options = data.meta.options
        }
        cb(dd)
      },
      onChange,
      onRemovedActor,
    )
  },

  createEmptyMap() {
    const dd = TileHelper.genNewMap()
    dd.images = {
      [ACTION_IMAGE]: ACTION_IMAGE,
    }

    dd.layers = [
      {
        name: 'Background',
        visible: true,
        data: [0, 0, 0, 0],
        height: 20,
        width: 20,
        draworder: 'topdown',
        mgb_tiledrawdirection: 'rightdown',
        type: 'mgb1-actor-layer',
        x: 0,
        y: 0,
      },
      {
        name: 'Active',
        visible: true,
        data: [0, 0, 0, 0],
        height: 20,
        width: 20,
        draworder: 'topdown',
        mgb_tiledrawdirection: 'rightdown',
        type: 'mgb1-actor-layer',
        x: 0,
        y: 0,
      },
      {
        name: 'Foreground',
        visible: true,
        data: [0, 0, 0, 0],
        height: 20,
        width: 20,
        draworder: 'topdown',
        mgb_tiledrawdirection: 'rightdown',
        type: 'mgb1-actor-layer',
        x: 0,
        y: 0,
      },
      {
        name: 'Events',
        visible: true,
        data: [0, 0, 0, 0],
        mgb_events: ['', '', '', ''],
        height: 20,
        width: 20,
        draworder: 'topdown',
        mgb_tiledrawdirection: 'rightdown',
        type: 'mgb1-event-layer',
        x: 0,
        y: 0,
      },
    ]
    dd.tilesets.push({
      name: 'Actions',
      firstgid: 1,
      image: ACTION_IMAGE,
      imageheight: 32,
      imagewidth: 64,
      margin: 0,
      spacing: 0,
      tilecount: ActorHelper.TILES_IN_ACTIONS,
      tileheight: 32,
      tilewidth: 32,
    })
    dd.mgb_event_tiles = {}
    return dd
  },

  loadActors(actorMap, names, images, cb, onChange, onRemovedActor) {
    const actors = Object.keys(actorMap)
    // nothing to do
    if (actors.length === 0) {
      cb()
      return
    }
    let loaded = 0
    const onload = () => {
      loaded++
      if (loaded === actors.length) {
        cb()
      }
    }

    for (let i = 0; i < actors.length; i++) {
      this.loadActor(
        actors[i],
        actorMap,
        i + 1 + ActorHelper.TILES_IN_ACTIONS,
        images,
        names,
        onload,
        onChange,
        // remove deleted or broken actor SILENTLY
        () => {
          console.error('removing deleted actor from map', actors[i])
          // delete actorMap[actors[i]]
          // onload()
        },
      )
    }
  },
  isLoading: {},
  cache: {},
  clearCache(key) {
    if (key == void 0) ActorHelper.cache = {}
    else delete ActorHelper.cache[key]
  },
  subscriptions: {},
  cleanUp() {
    for (let i in ActorHelper.subscriptions) {
      ActorHelper.subscriptions[i].subscription.stop()
    }
    ActorHelper.subscriptions = {}
    ActorHelper.clearCache()
  },
  loadActor(name, map, nr, images, names, cb, onChange, onRemovedActor) {
    const parts = name.split(':')
    const user = parts.length > 1 ? parts.shift() : names.user
    const actorName = parts.length ? parts.pop() : name
    const key = `${user}/${actorName}`

    // actor is loading - be patient..
    if (ActorHelper.isLoading[key]) {
      window.setTimeout(() => {
        ActorHelper.loadActor.apply(ActorHelper, arguments)
      }, 100)
      return
    }

    if (ActorHelper.cache[key]) {
      const cached = ActorHelper.cache[key]
      map[name] = cached.map
      images[TileHelper.normalizePath(cached.image)] = cached.image
      cb()
      return
    }
    ActorHelper.isLoading[key] = 1

    let asset = ActorHelper.subscriptions[key] ? ActorHelper.subscriptions[key].getAssets()[0] : null

    const onLoadFailed = () => {
      delete ActorHelper.isLoading[key]
      onRemovedActor(nr)
      cb()
    }
    mgbAjax(
      `/api/asset/actor/${user}/${actorName}`,
      (err, dataStr) => {
        if (err) {
          ActorHelper.errors.push({ actor: name, error: ActorHelper.errorTypes.MISSING_ACTOR })
          onLoadFailed()
          return
        }
        let d
        try {
          d = JSON.parse(dataStr)
        } catch (e) {
          onLoadFailed()
          return
        }
        const iparts = d.databag.all.defaultGraphicName.split(':')
        const iuser = iparts.length > 1 ? iparts.shift() : user
        const iname = iparts.pop()

        // don't use here CDN link - as we will save this path as image path
        const src = `/api/asset/png/${iuser}/${iname}`

        map[name].firstgid = nr
        map[name].actor = d
        map[name].image = src
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = function() {
          delete ActorHelper.isLoading[key]
          map[name].imagewidth = img.width
          map[name].imageheight = img.height
          // TODO: adjust these when MAGE will support multiple frames per actor
          map[name].tilewidth = img.width
          map[name].tileheight = img.height

          images[TileHelper.normalizePath(src)] = src

          ActorHelper.cache[key] = {
            map: map[name],
            image: src,
          }
          ActorHelper.subscriptions[key] = observeAsset(
            {
              dn_ownerName: user,
              name: actorName,
              isDeleted: false,
              kind: AssetKindEnum.actor,
            },
            () => {
              // clean up has been called before subscription become ready
              if (!ActorHelper.subscriptions[key]) {
                return
              }
              const assets = ActorHelper.subscriptions[key].getAssets()
              if (!assets.length) {
                console.error('Cannot find asset: ', key)
                return
              }
              if (assets.length > 1) {
                console.error('Multiple assets found: ', key)
              }
            },
            (...a) => {
              ActorHelper.clearCache(key)
              onChange && onChange(...a)
            },
          )
          cb()
        }
        // load empty image on error
        img.onerror = () => {
          ActorHelper.errors.push({ actor: name, error: ActorHelper.errorTypes.MISSING_IMAGE })
          img.src = '/images/error.png'
        }
        img.src = makeCDNLink(src)
      },
      asset,
    )
  },

  checks: {
    Background: tileset => ActorValidator.isValidForBG(tileset.actor.databag),
    Active: tileset => ActorValidator.isValidForActive(tileset.actor.databag),
    Foreground: tileset => ActorValidator.isValidForFG(tileset.actor.databag),
    Events: tileset => tileset.firstgid <= ActorHelper.TILES_IN_ACTIONS,
  },

  getTilesetFromGid(gid, tilesets) {
    // is this still true???
    // after adding and removing tilesets  - tileset ordering is messed up - don't rely that firstgid will be ordered in tilesets array
    for (let i = 0; i < tilesets.length; i++) {
      const ts = tilesets[i]
      if (gid >= ts.firstgid && gid < ts.firstgid + ts.tilecount) return tilesets[i]
    }
    return null
  },

  eventNameToTile(name) {
    if (name.indexOf('jump') === 0) return 1

    if (name.indexOf('music') === 0) return 2

    ActorHelper.errors.push({ actor: name, error: ActorHelper.errorTypes.UNKNOWN_ACTION })
    console.error(`Unknown eventName '${name}' in actorMap`)
  },
}

export default ActorHelper
