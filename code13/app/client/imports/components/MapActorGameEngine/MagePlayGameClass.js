



import ActiveActor from './ActiveActorClass'

import MgbActor from './MgbActor'
//..for .alActorType_Shot etc
// alAppearDisappear_NoCondition
// alActorType_Player

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
  


const CommandEngine = {

  parse: function (str) {
    debugger// TODO
  }
}

class ActorCollision
{
  constructor(a1, a2)
  {
		this.AA1 = a1    // Index of Actor#1 involved in collision
    this.AA2 = a2    // Index of Actor#2 involved in collision
  }
}


class BlockageMap
{
	cells = []
	width = 0
	height = 0
	
  // static public consts...
	ENTITY_PLAYER = 0       
	ENTITY_NPC = 1
	
	reset(w, h)
	{
		this.cells = new Array(w * h)
		this.width = w
		this.height = h
	}
	
	blockEntity(x, y, entityIndex, w = 1, h = 1)
	{
		for (var i = 0; i < w; i++)
		{
			for (var j = 0; j < h; j++)
			{
				if (x+i < width && y+j < height)
				{
//					console.trace("block "+(x+i)+","+(y+j)+" to "+entityIndex)
					var c = this.cell(x+i, y+j)
					var v = this.cells[c]
					this.cells[c] = (v | (1 << entityIndex))
				}
			}
		}
	}
	
	isEntityBlocked(x, y, entityIndex)
	{
		var c = this.cell(x, y)
		var v = this.cells[c]
		return (v & (1 << entityIndex)) !== 0
	} 

	cell(x, y)
	{
		if (x > this.width || y > this.height)
			console.trace("Incorrect size in BlockageMap")
		return y*this.width + x		// Arranged in rows
	}
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

    this.respawnMemoryAutoRespawningActors = {}
		this.respawnMemoryAutoRespawningActorsCurrentIndex = 1

debugger
		this.backgroundBlockageMap = new BlockageMap()


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
		if (x > this.map.width || y > this.map.height)
			throw new Error("Invalid coordinates for map")
		return y*this.map.width + x		// Arranged in rows
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
        var actorName = map.mapLayerActors[layer][this.cell(x, y)]
        if (null != actorName)
        {
          var ap = this.actors[actorName]
          if (ap)
          {
            var thisAAidx = this.activeActors.length
            var at = databag.all.actorType
            
            if (skipCreatingPlayers == true && at == MgbActor.alActorType_Player)
              continue

            var respawnId = map.name + "/" + x + "/" +y				// This is the only place I do this format, so no need for a function yet for it
            if (at != MgbActor.alActorType_Player && this.respawnMemory[respawnId])
            {
              // Aha.. there's a respawn behavior on this, and we've got to something we've remembered about it
              continue		// This is something we've decided will not respawn once killed/removed
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
                    this.activeActors.unshift(aa)			// non-movers at the front of the array
                  else
                    this.activeActors.push(aa)				// movers at the end of the array. This makes sure they are in front visually, that's all
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
    for (var AA = 0; AA < this.activeActors.length; AA++)
    {
      if (MgbActor.alActorType_Player == this.activeActors[AA].type)
      {
        // This is the player, so make a note...
        this.AA_player_idx = AA
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
    debugger  // step through first time
    if (null != this.respawnMemoryAutoRespawningActors[this.map.name])
    {
      var a = this.respawnMemoryAutoRespawningActors[this.map.name]		
      for (var i in a)
      {
        var ob = a[i]
        if (ob.actorname)
          this.playSpawnNewActor(ob.actorname, ob.x, ob.y, false, true, i)
      }
    }
  }

  // These will always be added to the active layer, at the front of the draw list (since redraw's blitter uses the "painters algorithm"). 
  // Callers should set G_tic = null to invalidate the collision detection cache.   TODO: Recycle the actors (shots)
  // return -1 means failure
  playSpawnNewActor(actorName, x, y, recycle = false, dropPersists = false, respawnId=null)
  {
    // Put within bounds
    x = _.clamp(0, this.map.width-1)
    y = _.clamp(0, this.map.height-1)
    
    // Spawn?
    var thisAAidx = this.activeActors.length
    if (recycle)
    {
      // We want to look for a dead item to reuse. NOTE - don't re-use items that have conditions - they may just be dormant
      for (var j = 0; j < this.activeActors.length; j++)
      {
        if (this.activeActors[j].alive == false && 
          this.activeActors[j].dyingAnimationFrameCount == 0 && 
          this.activeActors[j].appearIf == MgbActor.alAppearDisappear_NoCondition)
        {
          thisAAidx = j
          break
        }
      }
    }
    var ap = this.actors[actorName]
    if (!ap || !ap.content2)
    {
      this.logGameBug("Can't spawn an actor that hasn't been pre-loaded: " + actorName)
      return -1
    }
    var at = ap.content2.databag.all.actorType
    if (MgbActor.alActorType_Player == at)
    {
      this.logGameBug("Can't spawn additional players")
      return -1
    }
    else
    {
      var aa = new ActiveActor
      aa.meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE
      aa.creationCause = ActiveActor.CREATION_BY_SPAWN
      if (at === MgbActor.alActorType_NPC)
        aa.moveSpeed = parseFloat(ap.content2.databag.allchar.movementSpeedNum)
      aa.type = at
      aa.wasStopped = false
      aa.startx = aa.x = aa.fromx = x
      aa.starty = aa.y = aa.fromy = y
      aa.health = ap.content2.databag.all.initialHealthNum
      aa.maxHealth = ap.content2.databag.all.initialMaxHealthNum
      aa.ACidx = actorName
      var tp = this.graphics[ap.tilename]
      if (!tp)
      {
        this.logGameBug("Can't find graphic " + tilename)
        return -1
      }
      aa.renderBD = tp._image
      aa.appearIf = MgbActor.alAppearDisappear_NoCondition			// Shots can't have conditions
      aa.renderX = x * MgbSystem.tileMinWidth
      aa.renderY = y * MgbSystem.tileMinHeight
      aa.cellSpanX = (tp.width  + (MgbSystem.tileMinWidth  - 1))/ MgbSystem.tileMinWidth		// Round up
      aa.cellSpanY = (tp.height + (MgbSystem.tileMinHeight - 1))/ MgbSystem.tileMinHeight		// Round up
      
      var spawnShot = ap.content2.databag.allchar.shotActor
      aa.maxActiveShots = (!spawnShot || spawnShot === '') ? 0 : parseInt(ap.content2.databag.allchar.shotRateNum)
      
      aa.alive = true
      aa.birthTweenCount = this.G_tweenCount       // TODO - Fix tweencount issue
      this.activeActors[thisAAidx] = aa
              
      if (dropPersists)
        aa.respawnId = respawnId ? respawnId : this.markSpawnedActorForAutoRespawn(this.map.name, actorName, aa.startx, aa.starty)
    }
    return thisAAidx
  }
  


  // returns a unique respawn id that can be later used to cancel respawning of this actor 
  markSpawnedActorForAutoRespawn(mapName, actorName, startX, startY)
  {
    if (null == this.respawnMemoryAutoRespawningActors[mapName])
      this.respawnMemoryAutoRespawningActors[mapName] = {}
    const a = this.respawnMemoryAutoRespawningActors[mapName]
    let respawnIndex = this.respawnMemoryAutoRespawningActorsCurrentIndex
    this.respawnMemoryAutoRespawningActorsCurrentIndex++
    var s = respawnIndex.toString()
    a[respawnIndex] = { actorname: actorName, x: startX, y: startY }
    return s
  }


  cancelSpawnedActorForAutoRespawn(mapName, respawnId)
  {
    if (respawnId && this.respawnMemoryAutoRespawningActors[mapName])
    {
      var a = this.respawnMemoryAutoRespawningActors[mapName]
      if (a[respawnId])
        a[respawnId].actorname = null
    }
  }
  
  cancelAllSpawnedActorsForAutoRespawn()
  {
    respawnMemoryAutoRespawningActors = {}
  }
		
  playPrepareBackgroundLayer()
  {
  	this.backgroundBlockageMap.reset(this.map.width, this.map.height)
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
                console.error("playPrepareBackgroundLayer() can't measure background actor '"+ap.name+"' - unknown tile '"+ap.tilename+"'. Assuming 1x1.")

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
  }
  
  playCleanupBackgroundLayer()
  {
  	this.backgroundBlockageMap.reset(1, 1)
  }
		

///////// MONSTER GAME LOOP OMG REFACTOR THIS!!!!

  onTickGameDo(evt, tweenCount) {
  // Start with some basic housekeeping for transitions, game pause & per-second actions 
  if (this.isTransitionInProgress) {
    debugger  // transition to new map
    this.transitionTick()
    return
  }
  if (this.isPaused)
    return

  if (true) // TODO - make this once per second
  {
    debugger
    this.checkForGeneratedActorsThisSecond()
  }

  // Now for the real actions	
  if (0 == G_tweenCount) {
    // Tweencount of zero means start of turn

    this.askDeferredNpcQuestion()

    // This is the first tween this turn - decide what to do this turn. 
    // The remaining tweens for this turn will just animate what we decide now

    // Check for player collision with an event square. These only check against the player's top-left 32x32 pixel 'head'
    const plyr = this.activeActors[AA_player_idx]
    const plyrCell = this.cell(plyr.x, plyr.y)
    var eventString = this.map.mapLayerActors[MgbMap.layerEvents][plyrCell]
    if (eventString && eventString != '') {
      var o = CommandEngine.parse(eventString)
      if (o.command === "jump") {
        console.trace("event: " + eventString)
        this.transitionToNewMap(this.map.userName, this.map.projectName, o.mapname, o.x, o.y)
        return
      }
      else if (o.command == "music") {
        if (MgbActor.isSoundNonNull(o.source))
          this.playMusic(o.source)
        else
          this.stopMusic()
      }
    }

    this.G_tic = null		// Important, need to invalidate the collision detection cache. In theory we could only do this if at least one thing moved, but that's unlikely so not worth the grief...

    this.checkForTouchDamageAtStartOfTween()

    // Calculate moves (watch out for obstructions)
    for (var AA = 0; AA < this.activeActors.length; AA++) {
      var actor = this.activeActors[AA]
      var aa_p = this.actors[actor.ACidx]

      if (actor.alive && actor.moveSpeed > 0) {
        // Determine move intent
        const oldStepStyle = actor.stepStyle			// If it's ice, we need to remember
        let stepStyleOverride = -1					// -1 means no override
        actor.fromx = actor.x
        actor.fromy = actor.y

        // Some blocks on the BACKGROUND layer can affect direction - ice, conveyer belts, pushers... Let's look for these
        let floorActor = null	// this will be the actor that is on the background layer
        // We need an x/y loop so we check each cell that the current actor is on
        for (var pushX = 0; pushX < actor.cellSpanX; pushX++) {
          for (var pushY = 0; pushY < actor.cellSpanY; pushY++) {
            var cellIndex = cell(actor.x + pushX, actor.y + pushY, true)
            if (cellIndex >= 0) {
              var floorActorName = this.map.mapLayerActors[MgbMap.layerBackground][cellIndex]
              floorActor = (floorActorName && floorActorName != '') ? this.actors[floorActorName]: null
              if (floorActor && floorActor.content2 &&
                floorActor.content2.databag.all.actorType == MgbActor.alActorType_Item &&
                (parseInt(floorActor.content2.databag.item.itemActivationType) == MgbActor.alItemActivationType_CausesDamage ||
                  parseInt(floorActor.content2.databag.item.itemActivationType) == MgbActor.alItemActivationType_PushesActors))
                break
              floorActor = null
            }
          }
        }
        if (floorActor && parseInt(floorActor.content2.databag.item.itemActivationType === MgbActor.alItemActivationType_PushesActors)) {
          switch (parseInt(floorActor.content2.databag.item.itemPushesActorType)) {
            case MgbActor.alItemPushesActorType_up:
            case MgbActor.alItemPushesActorType_right:
            case MgbActor.alItemPushesActorType_down:
            case MgbActor.alItemPushesActorType_left:
              stepStyleOverride = parseInt(floorActor.content2.databag.item.itemPushesActorType)
              break

            case MgbActor.alItemPushesActorType_onwards:
              if (!actor.wasStopped)
                stepStyleOverride = oldStepStyle
              break

            case MgbActor.alItemPushesActorType_backwards:
              // 0 <->2 , 1 <->3.. so basically
              if (oldStepStyle >= 0)
                stepStyleOverride = oldStepStyle ^ 2
              break

            case MgbActor.alItemPushesActorType_random:
              stepStyleOverride = Math.floor(Math.random() * 4)
              break
          }
        }
        if (floorActor && parseInt(floorActor.content2.databag.item.itemActivationType) == MgbActor.alItemActivationType_CausesDamage)
          this.applyDamageToActor(AA, aa_p, parseInt(floorActor.content2.databag.item.healOrHarmWhenUsedNum))

        if (AA === this.AA_player_idx)
          this.calculateNewPlayerPosition(stepStyleOverride)
        else
          this.calculateNewEnemyPosition(AA, stepStyleOverride)			// Note this can cause actor.alive -> 0
        // Calculate pre-collisions (obstructions)
        if (actor.alive == true &&
          (checkIfActorObstructed(AA, true) || actor.y < 0 || actor.x < 0 || (actor.x + actor.cellSpanX) > this.map.width || (actor.y + actor.cellSpanY) > this.map.height)) {
          // Not a valid new space; revert to staying in place
          var cellToCheck = cell(actor.x, actor.y)		// put this in a var to eliminate multiple lookups.
          actor.x = actor.fromx
          actor.y = actor.fromy
          actor.wasStopped = true
          //					        	actor.stepStyle = -1		// These need to be free to move again. -1 means if they are on ice, they have stopped sliding and are free to choose their movement direction again
          actor.stepCount = 0				// Reset the step count; used to trigger a new movement choice.

          if (AA == this.AA_player_idx) {
            // Who did we just bump into? Did they want to say or do something?
            if (this.G_tic === null)
              this.generateTicTable()
            if (this.G_tic[cellToCheck] && this.G_tic[cellToCheck].length > 0) {
              for (var i = 0; i < this.G_tic[cellToCheck].length; i++) {
                var AAInCell = this.G_tic[cellToCheck][i]
                var ACidx = this.activeActors[AAInCell].ACidx
                var hitThing_ap = this.actors[ACidx]
                var activation = parseInt(hitThing_ap.content2.databag.item.itemActivationType)

                if (this.activeActors[AAInCell].alive && AAInCell != AA) {
                  // It's alive & not 'me'... 	
                  if (this.activeActors[AAInCell].type == MgbActor.alActorType_NPC) {
                    // Case 1: Player just collided with an NPC. This can spark a dialog
                    this.askNpcQuestion(this.activeActors[AAInCell], hitThing_ap)
                  }
                  else if (this.activeActors[AAInCell].type == MgbActor.alActorType_Item
                    && (activation == MgbActor.alItemActivationType_BlocksPlayer || activation == MgbActor.alItemActivationType_BlocksPlayerAndNPC)) {
                    // Case 2: It's a wall, I'm a player so see if there's a key available...
                    var key = hitThing_ap.content2.databag.item.keyForThisDoor
                    if (key && key !== '') {
                      // yup, there's a key. Next question - does the player have it?
                      var keyItem = this.inventory.get(key)
                      if (keyItem) {
                        var keyDestroyed = (1 == parseInt(hitThing_ap.content2.databag.item.keyForThisDoorConsumedYN))
                        // Yup.. so let's do it!
                        this.setGameStatusString(1, keyDestroyed ?
                          ("You use your " + key + " to pass") :
                          ("Since you are carrying the " + key + " you are able to pass through"))
                        if (keyDestroyed)
                          this.inventory.remove(keyItem)
                        this.activeActors[AAInCell].health = 0	/// This triggers all the usual spawn stuff
                      }
                    }
                  }
                }
              }
            }
          }

          if (actor.isSliding)				// Sliding block or shot
          {
            if (1 == parseInt(aa_p.content2.databag.item.squishNPCYN) || (actor.isAShot && (actor.shotDamageToNPC != 0 || actor.shotDamageToPlayer != 0))) {
              // Check Squish effect
              if (this.G_tic == null)
                this.generateTicTable()
              if (this.G_tic[cellToCheck] && this.G_tic[cellToCheck].length > 0) {
                for (i = 0; i < this.G_tic[cellToCheck].length; i++) {
                  AAInCell = G_tic[cellToCheck][i]
                  ACidx = this.activeActors[AAInCell].ACidx
                  hitThing_ap = this.actors[ACidx]
                  var damage = 0
                  if (this.activeActors[AAInCell].alive && AAInCell != AA && (this.activeActors[AAInCell].type == MgbActor.alActorType_NPC || this.activeActors[AAInCell].type == MgbActor.alActorType_Player)) {
                    if (actor.isAShot) {
                      if (AAInCell == this.AA_player_idx) {
                        if (!(this.activeActors[AAInCell].activePowerUntilTweenCount >= G_tweenSinceMapStarted &&
                          MgbActor.alGainPowerType_Invulnerable == this.activeActors[AAInCell].activePower))
                          damage = actor.shotDamageToPlayer
                      }
                      else
                        damage = actor.shotDamageToNPC
                    }
                    else
                      damage = this.activeActors[AAInCell].health
                  }
                  if (damage)
                    this.applyDamageToActor(AAInCell, hitThing_ap, damage)
                }
              }
            }
            if (actor.alive)
              this.playStopItemSliding(actor)
          }
        }
        else
          actor.wasStopped = false	// moved OK
        // Convert intended move into per-tween amounts
        actor.xMovePerTween = (actor.x - actor.fromx) * (MgbSystem.tileMinWidth / G_tweensPerTurn)
        actor.yMovePerTween = (actor.y - actor.fromy) * (MgbSystem.tileMinHeight / G_tweensPerTurn)

        if (actor.turnsBeforeMeleeReady > 0)
          actor.turnsBeforeMeleeReady--	//
      }
    }
    this.G_tic = null		// Important, need to invalidate the collision detection cache. In theory we could only do this if at least one thing moved, but that's unlikely so not worth the grief...
    this.scrollMapToSeePlayer()
    this.G_tweenCount++
    this.G_tweenSinceMapStarted++
  }

  // Now, for this tween, move each Actor a little bit
  for (AA = 0; AA < this.activeActors.length; AA++) {
    if (this.activeActors[AA].alive) {
      this.chooseActiveActorDisplayTile(AA)	// Switch bitmap if necessary
      // Move by tweened amount
      if (this.activeActors[AA].xMovePerTween || this.activeActors[AA].yMovePerTween) {
        var xo = this.activeActors[AA].xMovePerTween * this.G_tweenCount
        var yo = this.activeActors[AA].yMovePerTween * this.G_tweenCount
        this.activeActors[AA].renderX = this.activeActors[AA].fromx * MgbSystem.tileMinWidth + xo
        this.activeActors[AA].renderY = this.activeActors[AA].fromy * MgbSystem.tileMinHeight + yo
      }
    }
  }

  // Now, for this tween, check for post-move collisions between *alive* actors- item/enemy/player touch events
  this.playProcessAACollisions()


// TODO - something like this
  // // Update scroll position (by tweened amount) if this is the player
  // if (G_VSPdelta)
  //   Container(parent).verticalScrollPosition += G_VSPdelta;
  // if (G_HSPdelta)
  //   Container(parent).horizontalScrollPosition += G_HSPdelta;

  // Housekeeping for end-of-turn
  // TODO: Kill & recycle dead enemies
  for (AA = 0; AA < this.activeActors.length; AA++) {
    if (this.activeActors[AA].alive) {
      var ap = this.actors[this.activeActors[AA].ACidx]

      // limit any heals to not exceed Max health
      if (this.activeActors[AA].maxHealth != 0 && this.activeActors[AA].health > this.activeActors[AA].maxHealth)
        this.activeActors[AA].health = this.activeActors[AA].maxHealth

      // Next actions on Melee
      switch (this.activeActors[AA].meleeStep) {
        case ActiveActor.MELEESTEP_NOT_IN_MELEE:	// Not in Melee
          break		// do nothing
        case 7:		// Final Melee step
          this.activeActors[AA].meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE		// End of Melee
          this.activeActors[AA].turnsBeforeMeleeReady = ap.content2.databag.allchar.meleeRepeatDelay
          if (AA == this.AA_player_idx && this.inventory.equipmentMeleeRepeatDelayModifier)
            this.activeActors[AA].turnsBeforeMeleeReady += parseInt(inventory.equipmentMeleeRepeatDelayModifier)
          if (this.activeActors[AA].turnsBeforeMeleeReady < 0)
            this.activeActors[AA].turnsBeforeMeleeReady = 0
          break
        default:
          this.activeActors[AA].meleeStep++
          break
      }

      switch (this.activeActors[AA].type) {
        case MgbActor.alActorType_Player:
          if (this.activeActors[AA].health <= 0) {
            // TODO: player's ...content2.databag.all.visualEffectWhenKilledType
            this.G_gameOver = true
          }
          else if (this.activeActors[AA].winLevel)
            this.G_gameOver = true;

          break
        case MgbActor.alActorType_NPC:
        case MgbActor.alActorType_Item:
          if (this.activeActors[AA].health <= 0)		// We don't check ap.content2.databag.itemOrNPC.destroyableYN here; that should be done in the damage routine. This way we can handle death/usage the same way
          {
            // It dies... 
            this.activeActors[AA].health = 0;
            this.activeActors[AA].alive = false;
            this.activeActors[AA].dyingAnimationFrameCount = 1;			// TODO - need to distinguish usage from destruction
            // Player gets bounty
            this.activeActors[this.AA_player_idx].score += parseInt(ap.content2.databag.itemOrNPC.scoreOrLosePointsWhenKilledByPlayerNum)
            // Get rid of the bitmap
            this.activeActors[AA].renderBD = null					// TODO, nice explosion/fade/usage animations

            switch (this.activeActors[AA].creationCause) {
              case ActiveActor.CREATION_BY_MAP:
                if (parseInt(ap.content2.databag.itemOrNPC.respawnOption) == MgbActor.alRespawnOption_Never && this.activeActors[AA].respawnId) {
                  // we need to know to persistently kill this piece based on it's original layer etc. 
                  // We remember it's final coordinates since some respawn options need to know this
                  this.respawnMemory[this.activeActors[AA].respawnId] = { x: this.activeActors[AA].x, y: this.activeActors[AA].y }
                }
                break
              case ActiveActor.CREATION_BY_SPAWN:
                this.cancelSpawnedActorForAutoRespawn(this.map.name, this.activeActors[AA].respawnId)
                break
            }

            // There's a drop...
            let drop1Happened = false
            let spawn = ap.content2.databag.itemOrNPC.dropsObjectWhenKilledName
            if (spawn && spawn !== '') {
              let dropChancePct = ap.content2.databag.itemOrNPC.dropsObjectWhenKilledChance
              if (dropChancePct === 0 || ((100 * Math.random()) < dropChancePct)) {
                this.playSpawnNewActor(this.loadActorByName(spawn), this.activeActors[AA].x, this.activeActors[AA].y)
                this.G_tic = null			// Important, need to invalidate the collision detection cache.
                drop1Happened = true
              }
            }

            // There's a 2nd drop.. These may go in a direction away from the actor
            spawn = ap.content2.databag.itemOrNPC.dropsObjectWhenKilledName2
            if (spawn && spawn !== '') {
              dropChancePct = ap.content2.databag.itemOrNPC.dropsObjectWhenKilledChance2
              if (dropChancePct === 0 || ((100 * Math.random()) < dropChancePct)) {
                // p is of type Point so has {x:, y:}
                var p = drop1Happened ? this.findAdjacentFreeCellForDrop(AA, ActiveActor(this.activeActors[AA]).stepStyle) : new Point(this.activeActors[AA].x, this.activeActors[AA].y)
                this.playSpawnNewActor(this.loadActorByName(spawn), p.x, p.y)
                this.G_tic = null			// Important, need to invalidate the collision detection cache.
              }
            }
          }
          break
      }
    }
  }

  this.checkForAppearingAndDisappearingActors()			// Actually could just do this if we life/death cases

  this.G_tweenCount = (G_tweenCount + 1) % (G_tweensPerTurn + 1)
  this.G_tweenSinceMapStarted++
  let ps = ''
  if (this.activeActors[this.AA_player_idx].activePower && this.activeActors[this.AA_player_idx].activePowerUntilTweenCount >= this.G_tweenSinceMapStarted)
    ps = "  Active Power = " + MgbActor.alGainPower[this.activeActors[this.AA_player_idx].activePower]

  // TODO - just use moment.js ? 
  let now = new Date()
  let secondsPlayed = Math.floor(now.getTime() - this.G_gameStartedAtMS) / 1000
  let minutesPlayed = Math.floor(secondsPlayed / 60)
  let hoursPlayed = Math.floor(minutesPlayed / 60)
  let timeStr = ''
  if (hoursPlayed)
    timeStr += hoursPlayed + ":"
  timeStr += (minutesPlayed % 60 < 10 ? "0" : "") + (minutesPlayed % 60) + "."
  timeStr += (secondsPlayed % 60 < 10 ? "0" : "") + (secondsPlayed % 60)

  let mhs = this.activeActors[this.AA_player_idx].maxHealth == 0 ? "" : ("/" + this.activeActors[this.AA_player_idx].maxHealth)
  this.setGameStatusString(0, //"Lives: "+activeActors[this.AA_player_idx].extraLives   +
    "Health " + this.activeActors[this.AA_player_idx].health + mhs +
    "     Score " + this.activeActors[this.AA_player_idx].score + ps +
    "     Time " + timeStr)

  this.pleaseRedrawMapSoon()			// In theory we could save CPU by not calling this always, as soon as any actor is animated, there's no perf benefit - so not worth the added complexity
  if (this.G_gameOver) {
    debugger//  this needs work
    var gee = new GameEngineEvent(GameEngineEvent.COMPLETED,
      this.initialMap.userName, this.initialMap.projectName, this.initialMap.name,
      true, secondsPlayed, this.activeActors[this.AA_player_idx].score)

    if (this.activeActors[this.AA_player_idx].winLevel) {
      debugger// alert sucks
      alert("Final Score: " + this.activeActors[this.AA_player_idx].score +
        ", Time: " + timeStr, "You Win!")
    }
    else {
      debugger // alert sucks 
      alert("G A M E   O V E R\n", "They got you...")
      gee.completedVictory = false		// Change just one parameter...
    }
    debugger // needs thinking about state management with parent obects
//    dispatchEvent(gee)
    this.endGame()
  }
}

//--------HERE-WHEN-STOPPPED-------


// Need to get list of submethods from above code



}