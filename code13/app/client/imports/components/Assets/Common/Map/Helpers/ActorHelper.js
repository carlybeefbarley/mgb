// MGBv1 to TMX like format conversion.. straight forward
/*
  layer <actors> => layer <tiles>
  actor => tileset + additional info
  tile => image
  */
import TileHelper from './TileHelper.js'
// 0 - jump
// 1 - music
const ACTION_IMAGE = '/api/asset/tileset/AymKGyM9grSAo3yjp';
const EVENT_LAYER = 3

export default ActorHelper = {
  TILES_IN_ACTIONS: 2,
  v2_to_v1: function(data){
    console.log("data",data);

    const d = {
      mapLayer: [],
      maxLayers: 4,
      metadata: {
        width: data.width,
        height: data.height,
      }
    };

    const getActorName = (tileId, pos) => {
      if(!tileId){
        return ''
      }
      // action tiles
      if(tileId <= this.TILES_IN_ACTIONS){
        return data.layers[EVENT_LAYER].mgb_events[pos]
      }
      const ts = tileId - this.TILES_IN_ACTIONS;
      
      return data.tilesets[ts].name;

    }
    for(let i=0; i<data.layers.length; i++){
      for(let j=0; j<data.layers[i].data.length; j++){
        let ld = data.layers[i].data[j];
        if(!d.mapLayer[i]){
          d.mapLayer[i] = []
        }
        d.mapLayer[i][j] = getActorName(ld, j)
      }
    }

    console.log("RUN with this data:", d)
    return d
  },
  v1_to_v2: function(data, names, cb){
    if(!data.metadata){
      setTimeout(() => {
        cb(this.createEmptyMap())
      }, 0);
      return;
    }
    const dd = TileHelper.genNewMap()
    dd.images = {}
    dd.layers = []
    dd.tilesets.push({
      name: "Actions",
      firstgid: 1,
      image: '/api/asset/tileset/AymKGyM9grSAo3yjp',
      imageheight: 32,
      imagewidth: 64,
      margin: 0,
      spacing: 0,
      tilecount: this.TILES_IN_ACTIONS,
      tileheight: 32,
      tilewidth: 32
    })
    dd.images[ACTION_IMAGE] = ACTION_IMAGE;
    dd.mgb_event_tiles = {}



    dd.height = parseInt(data.metadata.height, 10)
    dd.width = parseInt(data.metadata.width, 10)

    const actorMap = {};
    // last is action layer
    for(let i=0; i<data.mapLayer.length - 1; i++){
      for(let j=0; j<data.mapLayer[i].length; j++) {
        let name = data.mapLayer[i][j]
        if(name){
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
      console.log(actorMap)
      const keys = Object.keys(actorMap)
      keys.forEach(function(n){
        dd.tilesets.push(actorMap[n])
      })

      for(let i=0; i<data.mapLayer.length - 1; i++){
        let name = i === 0 ? "Background" : i === 1 ? "Active" : i === 2 ? "Foreground" : "Events";
        let layer = {
          name,
          visible: true,
          data: [],
          height: parseInt(data.metadata.height, 10),
          width: parseInt(data.metadata.width, 10),
          draworder: "topdown",
          mgb_tiledrawdirection: "rightdown",
          type: "mgb1-actor-layer",
          x: 0,
          y: 0
        };
        for(let j=0; j<data.mapLayer[i].length; j++) {
          let name = data.mapLayer[i][j]
          if(name) {
            layer.data.push(actorMap[name].firstgid)
          }
          else{
            layer.data.push(0)
          }
        }
        dd.layers.push(layer)
      }

      let layer = {
        name: "Events",
        visible: true,
        data: [],
        height: parseInt(data.metadata.height, 10),
        width: parseInt(data.metadata.width, 10),
        draworder: "topdown",
        type: "mgb1-event-layer",
        x: 0,
        y: 0,
        mgb_tiledrawdirection: "rightdown",
        mgb_events: []
      };
      for(let j=0; j<data.mapLayer[EVENT_LAYER].length; j++) {
        let name = data.mapLayer[EVENT_LAYER][j]
        if(name) {
          console.log("NAME:", name, j)
          /*
           jump (teleport)
           music
           */
          layer.mgb_events.push(name)
          layer.data.push(this.eventNameToTile(name))
        }
        else{
          layer.data.push(0)
          layer.mgb_events.push('')
        }
      }
      dd.layers.push(layer)
      cb(dd)
    })
  },

  createEmptyMap(){
    const dd = TileHelper.genNewMap()
    dd.images = {
      [ACTION_IMAGE]: ACTION_IMAGE
    }

    dd.layers = [
      {
        name: "Background",
        visible: true,
        data: [0,0,0,0],
        height: 2,
        width: 2,
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
        height: 2,
        width: 2,
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
        height: 2,
        width: 2,
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
        height: 2,
        width: 2,
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
      imagewidth: 64,
      margin: 0,
      spacing: 0,
      tilecount: this.TILES_IN_ACTIONS,
      tileheight: 32,
      tilewidth: 32,
    })
    dd.mgb_event_tiles = {}
    return dd;
  },

  loadActors: function(actorMap, names, images, cb){
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
      })
    }
  },
  cache: {},
  // TODO: clean up
  loadActor: function(name, map, nr, images, names, cb){
    const parts = name.split(":")
    const user = parts.length > 1 ? parts.shift() : names.user
    const actorName = parts.length ? parts.pop() : name
    const key = `${user}/${actorName}`

    if(ActorHelper.cache[key]){
      map[name] = ActorHelper.cache[key].map
      images[TileHelper.normalizePath(ActorHelper.cache[key].image)] = ActorHelper.cache[key].image
      cb()
      return
    }

    $.get(`/api/asset/actor/${user}/${actorName}`).done((d) => {

      const iparts = d.databag.all.defaultGraphicName.split(":");
      const iuser = iparts.length > 1 ? iparts.shift() : user
      const iname = iparts.pop()

      const src = `/api/asset/png/${iuser}/${iname}`
      console.log(d);


      map[name].firstgid = nr
      map[name].actor = d
      map[name].image = src
      var img = new Image()
      img.onload = function(){
        map[name].imagewidth = img.width
        map[name].imageheight = img.height
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

  loadActorSimple: function(asset, map){

  },
  eventNameToTile: function(name){
    if(name.indexOf("jump") === 0){
      return 1;
    }
    if(name.indexOf("music") ===0 ){
      return 2;
    }
  }

}
