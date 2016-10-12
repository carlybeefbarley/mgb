

// This code will be pulled into being part of the MagePlayGame class.

// This is the code that is primarily focussed on the BACKGROUND Layers.

import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'
import MgbMap from './MageMgbMap'

import BlockageMap from './MageBlockageMap'


export default MagePlayGameBackgroundLayers = {

  playPrepareBackgroundLayer: function()
  {
    const { backgroundBlockageMap } = this
    backgroundBlockageMap.reset(this.map.width, this.map.height)
    for (var y = 0; y< this.map.height; y++)
    {
      for (var x = 0; x < this.map.width; x++)
      {
        const cellToCheck = this.cell(x,y)
        const ACidx = this.map.mapLayerActors[MgbMap.layerBackground][cellToCheck]
        if (ACidx)
        {
debugger  // next line seems odd.. id or name?
          var ap = this.actors[ACidx]

          if (ap)
          {
            var at = ap.content2.databag.all.actorType
            if (at == MgbActor.alActorType_Item)
            {
              // Now, we need to work out how big this thing is. We learn this from the tile
              var tp = this.graphics[ap.tilename]
              if (!tp)
                this.logGameBug("playPrepareBackgroundLayer() can't measure background actor '"+ap.name+"' - unknown tile '"+ap.tilename+"'. Assuming 1x1.")

              var width = tp ? Math.floor(tp.width / MgbSystem.tileMinWidth) : 1 
              var height =  tp ? Math.floor(tp.height / MgbSystem.tileMinHeight) : 1
              var itemAct = ap.content2.databag.item.itemActivationType
              
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