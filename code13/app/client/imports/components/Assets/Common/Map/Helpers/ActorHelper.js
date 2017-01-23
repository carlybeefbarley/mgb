// MGBv1 to TMX like format conversion.. straight forward
/*
  layer <actors> => layer <tiles>
  actor => tileset + additional info
  tile => image
  */
import TileHelper from './TileHelper'
import ActorValidator from '../../ActorValidator'
import SpecialGlobals from '/imports/SpecialGlobals'
import {AssetKindEnum as AssetKind} from '/imports/schemas/assets'

import {fetchAndObserve, observe} from "/client/imports/helpers/assetFetchers"

// 0 - jump
// 1 - music
const ACTION_IMAGE = SpecialGlobals.actorMap.actionsImage
const EVENT_LAYER = SpecialGlobals.actorMap.eventLayerId

// in this context:
// v1 - map format used by MGB_v1 (modified to fit MGB_v2 needs) - layers contains names
// v2 - TMX format - layers contains tile global ids

export default ActorHelper = {
  TILES_IN_ACTIONS: SpecialGlobals.actorMap.actionsInImage,
  v2_to_v1: function(data){
    const d = {
      mapLayer: [],
      maxLayers: 4,
      metadata: {
        width: data.width,
        height: data.height,
      },
      meta: {
        tilesets: data.tilesets,
        options: data.meta.options
      }
    };

    const getActorName = (tileId, pos) => {
      if (!tileId)
        return ''
      
      // action tiles
      if (tileId <= this.TILES_IN_ACTIONS)
        return data.layers[EVENT_LAYER].mgb_events[pos]

      // data tilesets is not orderer.. after user add / removed tiles ini the middle order gets screwed
      const ts = ActorHelper.getTilesetFromGid(tileId, data.tilesets)
      if (!ts) {
        console.error("Critical: Failed to locate tileset for gid:", tileId)
        return ''
      }
      return ts.name
    }
    for (let i=0; i<data.layers.length; i++) {
      for (let j=0; j<data.layers[i].data.length; j++) {
        let ld = data.layers[i].data[j]
        if (!d.mapLayer[i])
          d.mapLayer[i] = []
        d.mapLayer[i][j] = getActorName(ld, j)
      }
    }

    return d
  },

  v1_to_v2: function(data, names, cb, onChange) {
    if (!data.metadata) {
      cb(this.createEmptyMap())
      return
    }
    let makeInitialTilesets = false
    const dd = TileHelper.genNewMap()
    dd.images = {}
    dd.layers = []


    // delete data.meta - for testing purposes only
    if (data.meta && data.meta.tilesets)
      dd.tilesets = data.meta.tilesets
    else {
      // brand new map
      makeInitialTilesets = true
      dd.tilesets.push({
        name: "Actions",
        firstgid: 1,
        image: ACTION_IMAGE,
        imageheight: 32,
        imagewidth: 64,
        margin: 0,
        spacing: 0,
        tilecount: this.TILES_IN_ACTIONS,
        tileheight: 32,
        tilewidth: 32
      })
    }
    dd.images[ACTION_IMAGE] = ACTION_IMAGE
    dd.mgb_event_tiles = {}

    dd.height = parseInt(data.metadata.height, 10)
    dd.width = parseInt(data.metadata.width, 10)

    const actorMap = {}
    // last is action layer ( or not anymore??? )
    for (let i=0; i<data.mapLayer.length - 1; i++) {
      for (let j=0; j<data.mapLayer[i].length; j++) {
        let name = data.mapLayer[i][j]
        // make sure these is not conflicting with real actors - try to load anyway?
        if(name.indexOf("jump:") > -1 || name.indexOf("music:") > -1){
          console.error(`Action ${name} in the NON action layer`)
          continue
        }
        if (name && actorMap[name] === undefined) {

          if (makeInitialTilesets) {
            // actions tileset should be already pushed
            // assume that we have only 1 image per tileset
            dd.tilesets.push({name, firstgid: dd.tilesets.length + this.TILES_IN_ACTIONS }) //TileHelper.getNextGid(dd.tilesets[dd.tilesets.length - 1])})
          }
          // will be filled later
          actorMap[name] = {
            columns: 1,
            firstgid: 0,
            image: '',
            imageheight: 0,
            imagewidth: 0,
            margin: 0,
            name: name,
            spacing: 0,
            tilecount: 1,
            tileheight: 0,
            tilewidth: 0
          }
        }
      }
    }

    this.loadActors(actorMap, names, dd.images, () => {
      const keys = Object.keys(actorMap)

      // we already have actor in the tilesets.. map it and update actor
      keys.forEach((n) => {
        dd.tilesets.forEach( (ts, index) => {
          const actor = actorMap[n]
          if (ts.name === n) {
            // set correct firstgid
            actor.firstgid = ts.firstgid
            // make sure actor is updated
            dd.tilesets[index] = actor
          }
        })
      })

      for (let i=0; i<data.mapLayer.length - 1; i++) {
        let layer = {
          name:       'Background,Active,Foreground,Events'.split(',')[i],
          visible:    true,
          data:       [],
          height:     parseInt(data.metadata.height, 10),
          width:      parseInt(data.metadata.width, 10),
          draworder:  "topdown",
          mgb_tiledrawdirection: "rightdown",
          type:       "mgb1-actor-layer",
          x:          0,
          y:          0
        }
        for (let j=0; j<data.mapLayer[i].length; j++) {
          const name = data.mapLayer[i][j]
          layer.data.push( ( name && actorMap[name] ) ? actorMap[name].firstgid : 0)
        }
        dd.layers.push(layer)
      }

      // Event layer
      let layer = {
        name:     "Events",
        visible:  true,
        data:     [],
        height:   parseInt(data.metadata.height, 10),
        width:    parseInt(data.metadata.width, 10),
        draworder: "topdown",
        type:     "mgb1-event-layer",
        x:        0,
        y:        0,
        mgb_tiledrawdirection: "rightdown",
        mgb_events: []
      }

      for (let j=0; j<data.mapLayer[EVENT_LAYER].length; j++) {
        let name = data.mapLayer[EVENT_LAYER][j]
        if (name) {
          /*
           jump (teleport)
           music
           */
          layer.mgb_events.push(name)
          layer.data.push(this.eventNameToTile(name))
        }
        else {
          layer.data.push(0)
          layer.mgb_events.push('')
        }
      }
      dd.layers.push(layer)
      if (data.meta) {
        dd.tilesets = data.meta.tilesets
        dd.meta.options = data.meta.options
      }
      cb(dd)
    }, onChange)
  },

  createEmptyMap() {
    const dd = TileHelper.genNewMap()
    dd.images = {
      [ACTION_IMAGE]: ACTION_IMAGE
    }

    dd.layers = [
      {
        name: "Background",
        visible: true,
        data: [0,0,0,0],
        height: 20,
        width: 20,
        draworder: "topdown",
        mgb_tiledrawdirection: "rightdown",
        type: "mgb1-actor-layer",
        x: 0,
        y: 0
      },
      {
        name: "Active",
        visible: true,
        data: [0,0,0,0],
        height: 20,
        width: 20,
        draworder: "topdown",
        mgb_tiledrawdirection: "rightdown",
        type: "mgb1-actor-layer",
        x: 0,
        y: 0
      },
      {
        name: "Foreground",
        visible: true,
        data: [0,0,0,0],
        height: 20,
        width: 20,
        draworder: "topdown",
        mgb_tiledrawdirection: "rightdown",
        type: "mgb1-actor-layer",
        x: 0,
        y: 0
      },
      {
        name: "Events",
        visible: true,
        data: [0,0,0,0],
        mgb_events: ['','','',''],
        height: 20,
        width: 20,
        draworder: "topdown",
        mgb_tiledrawdirection: "rightdown",
        type: "mgb1-event-layer",
        x: 0,
        y: 0
      }
    ]
    dd.tilesets.push({
      name: "Actions",
      firstgid: 1,
      image: '/api/asset/tileset/AymKGyM9grSAo3yjp',
      imageheight: 32,
      imagewidth: 32,
      margin: 0,
      spacing: 0,
      tilecount: this.TILES_IN_ACTIONS,
      tileheight: 32,
      tilewidth: 32,
    })
    dd.mgb_event_tiles = {}
    return dd;
  },

  loadActors: function(actorMap, names, images, cb, onChange){
    const actors = Object.keys(actorMap);
    if(actors.length === 0){
      cb()
      return;
    }
    let loaded = 0
    for(let i=0; i<actors.length; i++){
      this.loadActor(actors[i], actorMap, i + 1 + this.TILES_IN_ACTIONS, images, names, () => {
        loaded++;
        if(loaded === actors.length){
          cb()
        }
      }, onChange)
    }
  },
  isLoading: {},
  cache: {},
  clearCache: (key) => {
    if(key == void(0))
      ActorHelper.cache = {}
    else
      delete ActorHelper.cache[key]
  },
  subscriptions: {},
  cleanUp: () => {
    for (let i in ActorHelper.subscriptions) {
      ActorHelper.subscriptions[i].subscription.stop()
    }
    ActorHelper.subscriptions = {}
    ActorHelper.clearCache()
  },
  loadActor: function(name, map, nr, images, names, cb, onChange) {
    const parts = name.split(":")
    const user = parts.length > 1 ? parts.shift() : names.user
    const actorName = parts.length ? parts.pop() : name
    const key = `${user}/${actorName}`

    // actor is loading - be patient..
    if(ActorHelper.isLoading[key]){
      window.setTimeout(() => {
        ActorHelper.loadActor.apply(ActorHelper, arguments)
      }, 100)
      return
    }

    if (ActorHelper.cache[key]) {
      map[name] = ActorHelper.cache[key].map
      images[TileHelper.normalizePath(ActorHelper.cache[key].image)] = ActorHelper.cache[key].image
      cb()
      return
    }
    ActorHelper.isLoading[key] = 1

    /*ActorHelper.subscriptions[key] = fetchAndObserve(user, actorName, AssetKind.actor, (error, actors) => {
      if(!actors.length){
        throw new Error(`Failed to locate an actor ${user}:${actorName}`)
      }
      if(actors.length > 1){
        console.error(`Multiple actor has been located for: ${user}:${actorName}`)
      }
      const actorC2 = actors[0].content2
      if(!actorC2){
        throw new Error("Unable to locate actor data")
      }

      const iparts = actorC2.databag.all.defaultGraphicName.split(":");
      const iuser = iparts.length > 1 ? iparts.shift() : user
      const iname = iparts.pop()

      const src = `/api/asset/png/${iuser}/${iname}`

      map[name].firstgid = nr
      map[name].actor = actorC2
      map[name].image = src
      var img = new Image()
      img.onload = function(){
        map[name].imagewidth = img.width
        map[name].imageheight = img.height
        // TODO: adjust these when MAGE will support multiple frames per actor
        map[name].tilewidth = img.width
        map[name].tileheight = img.height

        images[TileHelper.normalizePath(src)] = src

        ActorHelper.cache[key] = {
          map: map[name],
          image: src
        }
        delete ActorHelper.isLoading[key]
        cb()
      }
      img.src = src


    }, (...a) => {
      ActorHelper.clearCache(key)
      onChange(...a)
    })*/


    $.get(`/api/asset/actor/${user}/${actorName}`).done((d) => {
      ActorHelper.subscriptions[key] = observe({
        dn_ownerName: user,
        name: actorName,
        isDeleted: false,
        kind: AssetKind.actor
      }, (...a) => {
        ActorHelper.clearCache(key)
        onChange(...a)
      })


      const iparts = d.databag.all.defaultGraphicName.split(":");
      const iuser = iparts.length > 1 ? iparts.shift() : user
      const iname = iparts.pop()

      const src = `/api/asset/png/${iuser}/${iname}`

      map[name].firstgid = nr
      map[name].actor = d
      map[name].image = src
      var img = new Image()
      img.onload = function(){

        delete ActorHelper.isLoading[key]
        map[name].imagewidth = img.width
        map[name].imageheight = img.height
        // TODO: adjust these when MAGE will support multiple frames per actor
        map[name].tilewidth = img.width
        map[name].tileheight = img.height

        images[TileHelper.normalizePath(src)] = src

        ActorHelper.cache[key] ={
          map: map[name],
          image: src
        }
        cb()
      }
      img.src = src
    })
  },

  checks: {
    Background: tileset => ActorValidator.isValidForBG(tileset.actor.databag),
    Active:     tileset => ActorValidator.isValidForActive(tileset.actor.databag),
    Foreground: tileset => ActorValidator.isValidForFG(tileset.actor.databag),
    Events:     tileset => tileset.firstgid <= ActorHelper.TILES_IN_ACTIONS
  },

  getTilesetFromGid: (gid, tilesets) => {
    // after adding and removing tilesets  - tileset ordering is messed up - don't rely that firstgid will be ordered in tilesets array
    for (let i=0; i<tilesets.length; i++) {
      const ts = tilesets[i]
      if (gid >= ts.firstgid && gid < ts.firstgid + ts.tilecount )
        return tilesets[i]
    }
    return null
  },

  loadActorSimple: function(asset, map) {
    debugger   // Appears to be dead code?
  },

  eventNameToTile: function(name) {
    if (name.indexOf("jump") === 0)
      return 1
    
    if (name.indexOf("music") ===0 )
      return 2

    console.error(`Unknown eventName '${name}' in actorMap`)
  }

}
