



import ActiveActor from './ActiveActorClass'

import MgbActor from './MgbActor'
//..for .alActorType_Shot etc


/* Replacers


pauseGame             ->    this.isPaused
setGameStatusString   ->    this.setGameStatusFn(0,
hideNpcMessage        ->    this.showNpcMessageFn(null)
G_gameStartedAtMS     ->    this.gameStartedAtMS

*/

const MgbMap = {
  layerActive:  1
}

const MgbSystem = {
  tileMinWidth: 32,
  tileMinHeight: 32
}
  


export default class PlayGame
{
  // This will uses exceptions
  startGame(map, actors, graphics, setGameStatusFn, showNpcMessageFn) { 

    this.setGameStatusFn = setGameStatusString
    this.showNpcMessageFn = showNpcMessageFn
    this.gameStartedAtMS = (new Date()).getTime()
    this.isPaused = false
    this.gameOver = false
		this.respawnMemory = []
    this.activeActors = []
    this.inventory = new Inventory()
    this.map = map
    this.actors = actors
    this.graphics = graphics

    this.setGameStatusFn(0, 'Starting game')
    this.setGameStatusFn(1)
    this.showNpcMessageFn(null)

    this.cancelAllSpawnedActorsForAutoRespawn()
			
    this.playPrepareActiveLayer(map, tweenCount)
    this.playPrepareBackgroundLayer()

    // Set up and start Game events
    this.enablePlayerControls()
  }

  cell(x, y) {
    debugger
  }


  logGameBug(msg) { console.error(msg) }

  // playPrepareActiveLayer - called when a game starts on a map - create individual bitmaps for the active elements
  // 
  // Effects:
  //  1. Erase and hide the current 'activeLayer' bitmap
  //	2. For each item on the active Layer in the specified map, 
  //		Create a new (global to this GE1 class) activeActors[] array entry (and implicitly update array.length)
  //		Create a bitmap, associate it with the BitmapData from the applicable actorCache.tilePiece
  //  	Add that bitmap to the display list
  //  3. Move layerForeground to be at the front (z-order) of the screen
  // Return value is the # of player items on the specified map
  // @@ todo - make sure the player is in a deterministic slot - either first or last - to make behavior more consistent
  playPrepareActiveLayer(map, tweenCount, skipCreatingPlayers = false)
  {
    var missingActors = 0
    var num_players = 0
    var layer = MgbMap.layerActive
    this.activeActors = []
	    	
    // Instantiate instances of the Actors using the map data
    for (var y = 0; y < map.height; y++)
    {
      for (var x = 0; x < map.width; x++)
      {
        var actorName = map.mapLayerActors[layer][this.cell(x, y)]        ????
        if (null != actorName)
        {
          var ap = this.actors[actorName]
          if (ap)
          {
            var thisAAidx = activeActors.length
            var at = databag.all.actorType
            
            if (skipCreatingPlayers == true && at == MgbActor.alActorType_Player)
              continue

            var respawnId = map.name + "/" + x + "/" +y				// This is the only place I do this format, so no need for a function yet for it
            if (at != MgbActor.alActorType_Player && this.respawnMemory[respawnId])
            {
              // Aha.. there's a respawn behavior on this, and we've got to something we've remembered about it
              continue;		// This is something we've decided will not respawn once killed/removed
              
              // what about items that can be picked up? 
            }

            var aa = new ActiveActor()
            aa.creationCause = ActiveActor.CREATION_BY_MAP
            aa.respawnId = respawnId
            aa.birthTweenCount = tweenCount
            aa.meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE
              
            // Now create activeActors for the required actors on this map
            switch (at)
            {
              case MgbActor.alActorType_Shot:
                this.logGameBug("Actor "+actorName+" is a shot - it shouldn't be placed directly on the map. Ignoring...")
                // ignore shots
                break;
              case MgbActor.alActorType_NPC:
              case MgbActor.alActorType_Player:
                aa.moveSpeed = Number(databag.allchar.movementSpeedNum)
                // no 'break' here: falling through to next clause on purpose...
              case MgbActor.alActorType_Item:
                var tp = graphics[ap.tilename]
                if (!tp)
                {
                  this.logGameBug("Actor '"+ap.name+"' does not have a valid tile and will not be in the game", false)
                  missingActors++
                }
                else
                {
                  if (tp.loadFailed)
                  {
                    ///The issue is we don't have a clear place to reload failed pieces systematically. How/when to do this. 
                    // Design decision: Do on-demand in application? Play game? Reasonable case - focus on this. 
                    // actorLoadsPending++
                    // getActorResultHandler(ap)		// this uses getPiece, so it will reload
                  }
                  aa.wasStopped = false
                  aa.startx = x
                  aa.x = x
                  aa.fromx = x
                  aa.type = at
                  aa.starty = y
                  aa.fromy = y
                  aa.y = y
                  aa.health = databag.all.initialHealthNum
                  aa.maxHealth = databag.all.initialMaxHealthNum
                  aa.appearIf = databag.itemOrNPC.appearIf ? databag.itemOrNPC.appearIf : MgbActor.alAppearDisappear_NoCondition
                  aa.ACidx = actorName
                  aa.renderBD = tp.bitmapData
                  aa.renderX = x * MgbSystem.tileMinWidth
                  aa.renderY = y * MgbSystem.tileMinHeight
                  aa.cellSpanX = (tp.width  + (MgbSystem.tileMinWidth  - 1))/ MgbSystem.tileMinWidth		// Round up
                  aa.cellSpanY = (tp.height + (MgbSystem.tileMinHeight - 1))/ MgbSystem.tileMinHeight		// Round up
                  var spawnShot = databag.allchar.shotActor
                  aa.maxActiveShots = (spawnShot == null || spawnShot == "") ? 0 : int(databag.allchar.shotRateNum)
                  aa.alive = true
                  if (aa.moveSpeed == 0)
                    activeActors.unshift(aa)			// non-movers at the front of the array
                  else
                    activeActors.push(aa)				// movers at the end of the array. This makes sure they are in front visually, that's all
                }
                break
              default:
                throw new Error("Unknown Actor type "+at)
            }
          }
        }
      }
    }
    
    // Next, look for items that were spawned before, but had been selected to drop persistently on the map
    this.respawnRequiredActorsForMap()
        
    // Now find the player
    for (var AA:int = 0; AA < activeActors.length; AA++)
    {
      if (MgbActor.alActorType_Player == activeActors[AA].type)
      {
        // This is the player, so make a note...
        AA_player_idx = AA
        num_players++
      }
    }
    
    if (missingActors)
      this.logGameBug(missingActors+" actors did not have valid tiles and so are not in the game. Check the Log for details", true)

    if (!num_players)
      throw new Error("No player defined for this map")

    if (num_players > 2)
      throw new Error("A map can only have one player on it; this map has "+num_players+" player actors on the map")
  }


  respawnRequiredActorsForMap() {
    // See the complementary code in playSpawnNewActor()
    debugger
    if (null != this.respawnMemoryAutoRespawningActors[this.map.name])
    {
      var a = respawnMemoryAutoRespawningActors[this.map.name]		
      for (var i in a)
      {
        var ob = a[i]
        if (ob.actorname)
          playSpawnNewActor(ob.actorname, ob.x, ob.y, false, true, i)
      }
    }
  }



		// private function playPrepareBackgroundLayer():void
		// {
		// 	backgroundBlockageMap.reset(mapPiece.width, mapPiece.height)
   	// 		for (var y:int = 0; y<mapPiece.height; y++)
   	// 		{
		// 		for (var x:int = 0; x < mapPiece.width; x++)
		// 		{
		// 			var cellToCheck:int = cell(x,y)		// put this in a var to eliminate multiple lookups.
		// 			var ACidx:String = mapPiece.mapLayerActors[MgbMap.layerBackground][cellToCheck]
		// 			if (null != ACidx)
		//  			{
		// 				var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
		// 				if (null != ap)
		// 				{
		// 					var at:int = ap.actorXML.databag.all.actorType
		// 					if (at == MgbActor.alActorType_Item)
		// 					{
		// 						// Now, we need to work out how big this thing is. We learn this from the tile
		// 						var tp:MgbTile = MgbTile(tileCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ap.tilename))
		// 						if (!tp)
		// 							trace("playPrepareBackgroundLayer() can't measure background actor '"+ap.name+"' - unknown tile '"+ap.tilename+"'. Assuming 1x1.")

		// 						var width:int = tp ? (tp.width / MgbSystem.tileMinWidth) : 1 
		// 						var height:int =  tp ? (tp.height / MgbSystem.tileMinHeight) : 1
		// 						var itemAct:int = ap.actorXML.databag.item.itemActivationType
								
		// 						// OK, now mark the appropriate number of spaces as blocked
		// 						if (itemAct == MgbActor.alItemActivationType_BlocksPlayer || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
		// 							backgroundBlockageMap.blockEntity(x, y, BlockageMap.ENTITY_PLAYER, width, height)
		// 						if (itemAct == MgbActor.alItemActivationType_BlocksNPC || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
		// 							backgroundBlockageMap.blockEntity(x, y, BlockageMap.ENTITY_NPC, width, height)
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		
		// private function playCleanupBackgroundLayer():void
		// {
		// 	this.backgroundBlockageMap.reset(1, 1)
		// }
		
}