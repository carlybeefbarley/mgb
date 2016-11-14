
// If you REALLY have to have some special global values/ids in this codebase, 
// at least put it here and reference it from herso we understand the extent of 
// this code smell in our codebase :)


export default SpecialGlobals = {
  // codeflower props (probably we could allow to tune up these some day
  // description about props can be found here: https://github.com/d3/d3-3.x-api-reference/blob/master/Force-Layout.md
  codeFlower: {
    "mainCharge": -500,
    "charge": -200,
    "chargePerChild": -200,
    "chargeDistance": 100,
    "link": 10,
    "linkStrength": 1,
    "linkPerChild": 5,
    "link_at_same_level": 0,
    "friction": 0.9,
    "theta": 0.8,
    "gravity": 0.1
  },

  assets: {
    "maxUploadSize": 1*1024*1024,   // 1 MB
  },

  map: {
    "maxUndoSteps": 99,
    "objectRotationStep": 15
  },
  //these are used in the ActorHelper
  actorMap: {
    actionsImage: '/api/asset/tileset/AymKGyM9grSAo3yjp',
    actionsInImage: 2, // atm - jump and music,
    eventLayerId: 3
  },

  gamePlay: {
    playCountDebounceMs: 10 * 1000
  }
}

// 

