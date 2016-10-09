// MGBv1 to TMX like format conversion.. straight forward
/*
  layer <actors> => layer <tiles>
  actor => tileset + additional info
  tile => image
  */
import TileHelper from './TileHelper.js'
const TILES_IN_ACTIONS = 2;

export default {
  v1_to_v2: function(data, names, cb){
    debugger;
    const dd = TileHelper.genNewMap()
    dd.height = parseInt(data.metadata.height, 10)
    dd. width = parseInt(data.metadata.width, 10)

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
      tilecount: TILES_IN_ACTIONS,
      tileheight: 32,
      tilewidth: 32
    })
    dd.images['/api/asset/tileset/AymKGyM9grSAo3yjp'] = '/api/asset/tileset/AymKGyM9grSAo3yjp';
    dd.mgb_event_tiles = {}
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
        let name = i == 0 ? "Background" : i == 1 ? "Active" : i === 2 ? "Foreground" : "Event";
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
        mgb_tiledrawdirection: "rightdown",
        type: "mgb1-event-layer",
        x: 0,
        y: 0
      };
      for(let j=0; j<data.mapLayer[3].length; j++) {
        let name = data.mapLayer[3][j]
        if(name) {
          console.log("NAME:", name, j)
          /*
           jump (teleport)
           music
           */
          dd.mgb_event_tiles[j] = name;

          layer.data.push(this.eventNameToTile(name))
        }
        else{
          layer.data.push(0)
        }
      }
      dd.layers.push(layer)
      cb(dd)
    })
  },

  loadActors: function(actorMap, names, images, cb){
    const actors = Object.keys(actorMap);
    let loaded = 0
    for(let i=0; i<actors.length; i++){
      this.loadActor(actors[i], actorMap, i + 1 + TILES_IN_ACTIONS, images, names, () => {
        loaded++;
        if(loaded === actors.length){
          cb()
        }
      })
    }

  },
  loadActor: function(name, map, nr, images, names, cb){

    //http://localhost:3000/api/asset/actor/dgolds/mechanix2.wall


    $.get(`/api/asset/actor/${names.user}/${name}`).done((d) => {

      const src = `/api/asset/png/${names.user}/${d.databag.all.defaultGraphicName}`
      console.log(d);


      map[name].firstgid = nr
      map[name].actor = d;
      map[name].image = src;
      var img = new Image();
      img.onload = function(){
        map[name].imagewidth = img.width;
        map[name].imageheight = img.height;
        images[TileHelper.normalizePath(src)] = src
        cb()
      };
      img.src = src

    })
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
