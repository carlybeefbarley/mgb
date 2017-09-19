import _ from 'lodash'
import MgbMap from './MageMgbMap'
import MgbActor from './MageMgbActor'
import MgbSystem from './MageMgbSystem'
import ActiveActor from './MageActiveActorClass'

// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on the Active Layers.

const MagePlayGameActiveLayers = {
  // playPrepareActiveLayer - called when a game starts on a map - create individual bitmaps for the active elements
  //
  // Effects:
  //  1. Erase and hide the current 'activeLayer' bitmap
  //  2. For each item on the active Layer in the specified map,
  //    Create a new (global to this GE1 class) activeActors[] array entry (and implicitly update array.length)
  //    Create a bitmap, associate it with the BitmapData from the applicable actorCache.tilePiece
  //    Add that bitmap to the display list
  //  3. Move layerForeground to be at the front (z-order) of the screen
  // Return value is the # of player items on the specified map
  // @@ todo - make sure the player is in a deterministic slot - either first or last - to make behavior more consistent
  playPrepareActiveLayer(map, skipCreatingPlayers = false) {
    var missingActors = 0
    var num_players = 0
    var layer = MgbMap.layerActive
    this.activeActors = []
    const mapName = map.name.indexOf(':') === -1 ? this.ownerName + ':' + map.name : map.name

    // Instantiate instances of the Actors using the map data
    for (let y = 0; y < map.metadata.height; y++) {
      for (let x = 0; x < map.metadata.width; x++) {
        var actorName = map.mapLayer[layer][this.cell(x, y)]
        if (null != actorName) {
          var ap = this.actors[actorName]
          if (ap) {
            const databag = ap.content2.databag
            var at = MgbActor.intFromActorParam(databag.all.actorType)

            if (skipCreatingPlayers == true && at == MgbActor.alActorType_Player) continue

            var respawnId = mapName + '/' + x + '/' + y // This is the only place I do this format, so no need for a function yet for it
            if (at != MgbActor.alActorType_Player && this.respawnMemory[respawnId]) {
              // Aha.. there's a respawn behavior on this, and we've got to something we've remembered about it
              continue // This is something we've decided will not respawn once killed/removed
              // what about items that can be picked up?
            }

            var aa = new ActiveActor()
            aa.creationCause = ActiveActor.CREATION_BY_MAP
            aa.respawnId = respawnId
            aa.birthTweenCount = this.G_tweenCount
            aa.meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE

            // Now create activeActors for the required actors on this map
            switch (at) {
              case MgbActor.alActorType_Shot:
                this.logGameBug(
                  'Actor ' +
                    actorName +
                    " is a shot - it shouldn't be placed directly on the map. Ignoring...",
                )
                // ignore shots
                break
              case MgbActor.alActorType_NPC:
              case MgbActor.alActorType_Player:
                aa.moveSpeed = 1
              // no 'break' here: falling through to next clause on purpose...
              case MgbActor.alActorType_Item:
              case 4:
              case 5:
              case 6:
              case 7:
                var tp = this.graphics[databag.all.defaultGraphicName]
                if (!tp) {
                  this.logGameBug(
                    "Actor '" + ap.name + "' does not have a valid tile and will not be in the game",
                    false,
                  )
                  missingActors++
                } else {
                  if (tp.loadFailed) {
                    ///The issue is we don't have a clear place to reload failed pieces systematically. How/when to do this.
                    // Design decision: Do on-demand in application? Play game? Reasonable case - focus on this.
                    // actorLoadsPending++
                    // getActorResultHandler(ap)    // this uses getPiece, so it will reload
                  }
                  aa.wasStopped = false
                  aa.startx = x
                  aa.x = x
                  aa.fromx = x
                  aa.type = at
                  aa.starty = y
                  aa.fromy = y
                  aa.y = y
                  aa.health = MgbActor.intFromActorParam(databag.all.initialHealthNum)
                  // 0 maxHealth means Unlimited maxHealth
                  aa.maxHealth = MgbActor.intFromActorParam(databag.all.initialMaxHealthNum)
                  aa.appearIf = databag.itemOrNPC.appearIf
                    ? MgbActor.intFromActorParam(databag.itemOrNPC.appearIf)
                    : MgbActor.alAppearDisappear_NoCondition
                  aa.ACidx = actorName
                  aa._image = tp._image
                  aa.renderX = x * MgbSystem.tileMinWidth
                  aa.renderY = y * MgbSystem.tileMinHeight
                  aa.cellSpanX = Math.ceil(tp.content2.width / MgbSystem.tileMinWidth) // Round up
                  aa.cellSpanY = Math.ceil(tp.content2.height / MgbSystem.tileMinHeight) // Round up
                  var spawnShot = databag.allchar.shotActor
                  aa.maxActiveShots =
                    !spawnShot || spawnShot === ''
                      ? 0
                      : MgbActor.intFromActorParam(databag.allchar.shotRateNum)
                  aa.alive = true
                  if (aa.moveSpeed == 0)
                    this.activeActors.unshift(aa) // non-movers at the front of the array
                  else this.activeActors.push(aa) // movers at the end of the array. This makes sure they are in front visually, that's all
                }
                break
              default:
                throw new Error('Unknown Actor type ' + at)
            }
          }
        }
      }
    }

    // Next, look for items that were spawned before, but had been selected to drop persistently on the map
    this.respawnRequiredActorsForMap()

    // Now find the player
    for (let AA = 0; AA < this.activeActors.length; AA++) {
      if (MgbActor.alActorType_Player == this.activeActors[AA].type) {
        // This is the player, so make a note...
        this.AA_player_idx = AA
        num_players++
      }
    }

    if (missingActors)
      this.logGameBug(
        missingActors +
          ' actors did not have valid tiles and so are not in the game. Check the Log for details',
        true,
      )

    if (num_players !== 1 && !skipCreatingPlayers)
      throw new Error(
        'A starting map must have exactly one Player Actor on it. However, this map has ' +
          num_players +
          ' Player Actors on the map',
      )
  },

  // playCleanupActiveLayer - called when a game ends on a map - undo what playPrepareActiveLayer did
  playCleanupActiveLayer() {
    if (this.activeActors) {
      for (let AA = 0; AA < this.activeActors.length; AA++) this.activeActors[AA] = null
    }
    this.activeActors = []
  },

  respawnRequiredActorsForMap() {
    // See the complementary code in playSpawnNewActor()
    if (this.respawnMemoryAutoRespawningActors[this.map.name]) {
      throw new Error('@dgolds 10/12/16 debugger: step through first time')
      // var a = this.respawnMemoryAutoRespawningActors[this.map.name]
      // for (let i in a) {
      //   var ob = a[i]
      //   if (ob.actorname) this.playSpawnNewActor(ob.actorname, ob.x, ob.y, false, true, i)
      // }
    }
  },

  // These will always be added to the active layer, at the front of the draw list (since redraw's blitter uses the "painters algorithm").
  // Callers should set G_tic = null to invalidate the collision detection cache.   TODO: Recycle the actors (shots)
  // return -1 means failure
  playSpawnNewActor(actorName, x, y, recycle = false, dropPersists = false, respawnId = null) {
    // Put within bounds
    x = _.clamp(x, 0, this.map.metadata.width - 1)
    y = _.clamp(y, 0, this.map.metadata.height - 1)

    // Spawn?
    let thisAAidx = this.activeActors.length
    if (recycle) {
      // We want to look for a dead item to reuse. NOTE - don't re-use items that have conditions - they may just be dormant
      for (let j = 0; j < this.activeActors.length; j++) {
        if (
          this.activeActors[j].alive == false &&
          this.activeActors[j].dyingAnimationFrameCount == 0 &&
          this.activeActors[j].appearIf == MgbActor.alAppearDisappear_NoCondition
        ) {
          thisAAidx = j
          break
        }
      }
    }
    const ap = this.actors[actorName]
    if (!ap || !ap.content2) {
      this.logGameBug("Can't spawn an actor that hasn't been pre-loaded: " + actorName)
      return -1
    }
    const at = MgbActor.intFromActorParam(ap.content2.databag.all.actorType)
    if (MgbActor.alActorType_Player == at) {
      this.logGameBug("Can't spawn additional players")
      return -1
    } else {
      let aa = new ActiveActor()
      aa.meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE
      aa.creationCause = ActiveActor.CREATION_BY_SPAWN
      if (at === MgbActor.alActorType_NPC)
        aa.moveSpeed = MgbActor.numberFromActorParam(ap.content2.databag.allchar.movementSpeedNum)
      aa.type = at
      aa.wasStopped = false
      aa.startx = aa.x = aa.fromx = x
      aa.starty = aa.y = aa.fromy = y
      aa.health = MgbActor.intFromActorParam(ap.content2.databag.all.initialHealthNum)
      aa.maxHealth = MgbActor.intFromActorParam(ap.content2.databag.all.initialMaxHealthNum)
      aa.ACidx = actorName
      var tp = this.graphics[ap.content2.databag.all.defaultGraphicName]
      if (!tp) {
        this.logGameBug("Can't find graphic " + ap.content2.databag.all.defaultGraphicName)
        return -1
      }
      aa._image = tp._image
      aa.appearIf = MgbActor.alAppearDisappear_NoCondition // Shots can't have conditions
      aa.renderX = x * MgbSystem.tileMinWidth
      aa.renderY = y * MgbSystem.tileMinHeight
      //    aa.cellSpanX = (tp.content2.width  + (MgbSystem.tileMinWidth  - 1))/ MgbSystem.tileMinWidth    // Round up
      //    aa.cellSpanY = (tp.content2.height + (MgbSystem.tileMinHeight - 1))/ MgbSystem.tileMinHeight    // Round up
      aa.cellSpanX = Math.ceil(tp.content2.width / MgbSystem.tileMinWidth)
      aa.cellSpanY = Math.ceil(tp.content2.height / MgbSystem.tileMinHeight) // Round up

      var spawnShot = ap.content2.databag.allchar.shotActor
      aa.maxActiveShots =
        !spawnShot || spawnShot === ''
          ? 0
          : MgbActor.intFromActorParam(ap.content2.databag.allchar.shotRateNum)

      aa.alive = true
      aa.birthTweenCount = this.G_tweenCount
      this.activeActors[thisAAidx] = aa

      if (dropPersists)
        aa.respawnId = respawnId
          ? respawnId
          : this.markSpawnedActorForAutoRespawn(this.map.name, actorName, aa.startx, aa.starty)
    }
    return thisAAidx
  },

  // returns a unique respawn id that can be later used to cancel respawning of this actor
  markSpawnedActorForAutoRespawn(mapName, actorName, startX, startY) {
    if (null == this.respawnMemoryAutoRespawningActors[mapName])
      this.respawnMemoryAutoRespawningActors[mapName] = {}
    const a = this.respawnMemoryAutoRespawningActors[mapName]
    let respawnIndex = this.respawnMemoryAutoRespawningActorsCurrentIndex
    this.respawnMemoryAutoRespawningActorsCurrentIndex++
    var s = respawnIndex.toString()
    a[respawnIndex] = { actorname: actorName, x: startX, y: startY }
    return s
  },

  cancelSpawnedActorForAutoRespawn(mapName, respawnId) {
    if (respawnId && this.respawnMemoryAutoRespawningActors[mapName]) {
      var a = this.respawnMemoryAutoRespawningActors[mapName]
      if (a[respawnId]) a[respawnId].actorname = null
    }
  },

  cancelAllSpawnedActorsForAutoRespawn() {
    this.respawnMemoryAutoRespawningActors = {}
  },

  checkForGeneratedActorsThisSecond() {
    const { activeActors, G_tweenCount } = this

    for (let AA = 0; AA < activeActors.length; AA++) {
      var actor = activeActors[AA]
      if (actor.alive && actor.birthTweenCount != G_tweenCount) {
        var ap = this.actors[actor.ACidx]
        var spawn = ap ? ap.content2.databag.itemOrNPC.dropsObjectRandomlyName : null
        if (spawn && spawn != '') {
          var dropChancePct = MgbActor.intFromActorParam(
            ap.content2.databag.itemOrNPC.dropsObjectRandomlyChance,
          )
          if (100 * Math.random() < dropChancePct) {
            var p = this.findAdjacentFreeCellForDrop(AA, activeActors[AA].stepStyle, true)
            if (p) {
              this.playSpawnNewActor(this.loadActorByName(spawn), p.x, p.y)
              this.clearTicTable() // Important, need to invalidate the collision detection cache.
            }
          }
        }
      }
    }
  },

  checkForAppearingAndDisappearingActors() {
    const { actors, activeActors } = this
    // The 'conditions' parameters of an actor say that an actor can appear/disappear if certain conditions are met
    //
    // This should only be called
    //     (a) at the initial load of a map (after the ActiveActors array has been populated
    //     (b) after an actor is destroyed or spawned

    // First, count how many of each actor are on screen ('alive')
    var ach = [] // Actor Count Hash
    var aalen = activeActors.length
    for (let AAi = 0; AAi < aalen; AAi++) {
      if (activeActors[AAi].alive) {
        var name = activeActors[AAi].ACidx.split(':').pop()
        ach[name] = ach[name] ? ach[name] + 1 : 1
      }
    }

    // Now, if any have 'conditions', apply them
    for (let AAi = 0; AAi < aalen; AAi++) {
      var aa = activeActors[AAi]
      var ap = actors[aa.ACidx]
      var conditionsActor = ap.content2.databag.itemOrNPC.conditionsActor
        ? ap.content2.databag.itemOrNPC.conditionsActor
        : null
      var appearIf = MgbActor.intFromActorParam(ap.content2.databag.itemOrNPC.appearIf)
      var appearCount = MgbActor.intFromActorParam(ap.content2.databag.itemOrNPC.appearCount)
      if (appearIf != MgbActor.alAppearDisappear_NoCondition) {
        if (ap && ap.content2.databag.itemOrNPC.conditionsActor && conditionsActor != '') {
          var count = ach[conditionsActor] == null ? 0 : ach[conditionsActor]
          if (appearCount == count)
            activeActors[AAi].alive =
              appearIf == MgbActor.alAppearDisappear_Appear && activeActors[AAi].health > 0
          else
            activeActors[AAi].alive =
              !(appearIf == MgbActor.alAppearDisappear_Appear) && activeActors[AAi].health > 0
        }
      }
    }
  },
}

export default MagePlayGameActiveLayers
