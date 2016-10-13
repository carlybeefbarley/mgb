

// This code will be pulled into being part of the MagePlayGame class.

// This is the code that is primarily focussed on the BACKGROUND Layers.

import BlockageMap from './MageBlockageMap'
import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'
import MgbMap from './MageMgbMap'

export default MagePlayGameBackgroundLayers = {

  playPrepareBackgroundLayer: function()
  {
    const { backgroundBlockageMap } = this
    backgroundBlockageMap.reset(this.map.metadata.width, this.map.metadata.height)
    for (var y = 0; y< this.map.metadata.height; y++) {
      for (var x = 0; x < this.map.metadata.width; x++) {
        const cellToCheck = this.cell(x,y)
        const ACidx = this.map.mapLayer[MgbMap.layerBackground][cellToCheck]
        if (ACidx) {
          const ap = this.actors[ACidx]
          if (ap) {
            var at = parseInt(ap.content2.databag.all.actorType)
            if (at == MgbActor.alActorType_Item) {
              // Now, we need to work out how big this thing is. We learn this from the tile
              var tp = this.graphics[ap.content2.databag.all.defaultGraphicName]
              if (!tp)
                this.logGameBug("playPrepareBackgroundLayer() can't measure background actor '"+ap.name+"' - unknown tile '"+ap.content2.databag.all.defaultGraphicName+"'. Assuming 1x1.")

              var width = tp ? Math.floor(tp.content2.width / MgbSystem.tileMinWidth) : 1 
              var height =  tp ? Math.floor(tp.content2.height / MgbSystem.tileMinHeight) : 1
              var itemAct = parseInt(ap.content2.databag.item.itemActivationType)
              
              // OK, now mark the appropriate number of spaces as blocked
              if (itemAct == MgbActor.alItemActivationType_BlocksPlayer || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
                this.backgroundBlockageMap.blockEntity(x, y, BlockageMap.ENTITY_PLAYER, width, height)
              if (itemAct == MgbActor.alItemActivationType_BlocksNPC || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
                this.backgroundBlockageMap.blockEntity(x, y, BlockageMap.ENTITY_NPC, width, height)
            }
          }
        }
      }
    }   
  },
  
  playCleanupBackgroundLayer: function()
  {
    this.backgroundBlockageMap.reset(1, 1)
  }

}