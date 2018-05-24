import _ from 'lodash'

// These imports are actually class extensions for the MagePlayGame class.
// See notes in constructor()

import MagePlayGameNpc from './MagePlayGameNpc'
import MagePlayGameTIC from './MagePlayGameTIC'
import MagePlayGameItem from './MagePlayGameItem'
import MagePlayGameShoot from './MagePlayGameShoot'
import MagePlayGameInput from './MagePlayGameInput'
import MagePlayGameDamage from './MagePlayGameDamage'
import MagePlayGameDisplay from './MagePlayGameDisplay'
import MagePlayGameSliding from './MagePlayGameSliding'
import MagePlayGameCellUtil from './MagePlayGameCellUtil'
import MagePlayGameMovement from './MagePlayGameMovement'
import MagePlayGameCollision from './MagePlayGameCollision'
import MagePlayGameTransition from './MagePlayGameTransition'
import MagePlayGameActiveLayers from './MagePlayGameActiveLayers'
import MagePlayGameBackgroundLayers from './MagePlayGameBackgroundLayers'

// These imports are stand alone classes
import ActiveActor from './MageActiveActorClass'
import BlockageMap from './MageBlockageMap'
import Inventory from './MagePlayGameInventory'
import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'
import MgbMusic from './MageMgbMusic'
import MgbMap from './MageMgbMap'

// This class will uses exceptions

export default class MagePlayGame {
  constructor(ownerName, isMgb1Game) {
    // This has been a hard class to break into clean sub-classes, so I'm just putting some of the code
    // in other files and I'm connecting them here so it isn't one huge source file.
    // This is sort of a cheap 'partial class' mechanism for javascript classes
    _.assign(this, MagePlayGameNpc)
    _.assign(this, MagePlayGameTIC)
    _.assign(this, MagePlayGameItem)
    _.assign(this, MagePlayGameShoot)
    _.assign(this, MagePlayGameInput)
    _.assign(this, MagePlayGameDamage)
    _.assign(this, MagePlayGameDisplay)
    _.assign(this, MagePlayGameSliding)
    _.assign(this, MagePlayGameCellUtil)
    _.assign(this, MagePlayGameMovement)
    _.assign(this, MagePlayGameCollision)
    _.assign(this, MagePlayGameTransition)
    _.assign(this, MagePlayGameActiveLayers)
    _.assign(this, MagePlayGameBackgroundLayers)
    this.container = document.getElementById('mgb-game-container')
    this.isMgb1Game = isMgb1Game
    this.ownerName = ownerName
  }

  resetGameState() {
    this.G_gameStartedAtMS = new Date().getTime()
    this.G_pausedTime = 0
    this.G_gamePausedAtMS = 0
    this.G_gameUnpausedAtMS = 0
    this.G_pauseTime = 0
    this.G_gameTime = 0
    this.isPaused = false
    this.G_gameOver = false

    this.respawnMemory = [] // See respawnId in the ActiveActors array
    this.activeActors = []
    this.AA_player_idx = undefined

    this.respawnMemoryAutoRespawningActors = {}
    this.respawnMemoryAutoRespawningActorsCurrentIndex = 1
    this.cancelAllSpawnedActorsForAutoRespawn()

    this.clearTicTable() // TIC == "Things In Cell". Note that we need the main move routine to reset this when x/ and fromx/y change

    // Tweening state. Decisions about moves are made once per turn. A turn consists of multple 'tweens' that animate the turn.
    this.G_xMovePerTween = 0 // Player movement (horizontal) per tween this turn.
    this.G_yMovePerTween = 0 // Player movement (vertical) per tween this turn.
    this.G_tweenCount = 0 // Current tween count in this turn
    this.G_tweensPerTurn = 4 // (const) Needs to be a divisor of MgbSystem.tileMinWidth and MgbSystem/tileMinHeight
    this.G_VSPdelta = 0 // Scroll change per tween (vertical)
    this.G_HSPdelta = 0 // Scroll change per tween (horizontal)
    this.G_tweenSinceMapStarted = 0 // Current tween count in this map - used for timing end of powers etc

    this.deferredAsk_aa = null // ActiveActor to use for the NPC dialog
    this.deferredAsk_ap = null // The actor data to use for the NPC dialog

    this.backgroundBlockageMap = new BlockageMap()
    this.inventory = new Inventory(this.handleForceInventoryUpdateFn)
  }

  endGame() {
    this.hideNpcMessage()
    this.hideInventory()
    this.resetGameState()
    this.disablePlayerControls()
    this.G_gameOver = true // Actually one of the conditions that causes the game loop to call endGame, but let's be sure :)
    this.playCleanupActiveLayer()
    this.playCleanupBackgroundLayer()

    this.setGameStatusFn(0, 'Game Over')
    this.setGameStatusFn(1)
    MgbMusic.stopMusic()
  }

  startGame(
    map,
    mapName,
    actors,
    graphics,
    transitionToNextMapFn,
    setGameStatusFn,
    showNpcMessageFn,
    toggleNpcDialogFn,
    handleForceInventoryUpdateFn,
    keyCaptureElement,
  ) {
    this.map = map
    this.map.name = mapName.indexOf(':') === -1 ? this.ownerName + ':' + mapName : mapName
    this.actors = actors
    this.graphics = graphics
    this.setGameStatusFn = setGameStatusFn
    this.showNpcMessageFn = showNpcMessageFn
    this.transitionToNextMapFn = transitionToNextMapFn
    this.toggleNpcDialogFn = toggleNpcDialogFn
    this.handleForceInventoryUpdateFn = handleForceInventoryUpdateFn

    this.resetGameState()

    this.setGameStatusFn(0, 'Starting game')
    this.setGameStatusFn(1)
    this.hideNpcMessage()

    this.playPrepareActiveLayer(map)
    this.playPrepareBackgroundLayer()

    // Set up and start Game events
    this.enablePlayerControls(keyCaptureElement)
  }

  logGameBug(msg) {
    console.error(msg)
  }

  scrollMapToSeePlayer(overrideX = -1, overrideY = -1) {
    const marginX = Math.floor(this.container.clientWidth / 32 / 4)
    const marginY = Math.floor(this.container.clientHeight / 32 / 4)

    var sx = overrideX == -1 ? this.activeActors[this.AA_player_idx].x : overrideX
    var sy = overrideY == -1 ? this.activeActors[this.AA_player_idx].y : overrideY

    this.G_HSPdelta = 0
    this.G_VSPdelta = 0

    var horizontalScrollPosition = this.container.scrollLeft
    var verticalScrollPosition = this.container.scrollTop
    var maxHorizontalScrollPosition = this.container.scrollWidth - this.container.clientWidth
    var maxVerticalScrollPosition = this.container.scrollHeight - this.container.clientHeight
    var w = this.map.metadata.width * MgbSystem.tileMinWidth - maxHorizontalScrollPosition
    var h = this.map.metadata.height * MgbSystem.tileMinHeight - maxVerticalScrollPosition
    var maxHSP_toSeePlayer = (sx - marginX) * MgbSystem.tileMinWidth // Maximum Horizontal Scroll Position to see player
    var maxVSP_toSeePlayer = (sy - marginY) * MgbSystem.tileMinHeight // Maximum Vertical Scroll Position to see player

    if (horizontalScrollPosition > maxHSP_toSeePlayer)
      this.G_HSPdelta = (maxHSP_toSeePlayer - horizontalScrollPosition) / this.G_tweensPerTurn // Scroll left if needed
    if (verticalScrollPosition > maxVSP_toSeePlayer)
      this.G_VSPdelta = (maxVSP_toSeePlayer - verticalScrollPosition) / this.G_tweensPerTurn // Scroll up if needed

    var minHSP_toSeePlayer = (sx + 1 + marginX) * MgbSystem.tileMinWidth - w // Minimum Horizontal Scroll Position to see player
    var minVSP_toSeePlayer = (sy + 1 + marginY) * MgbSystem.tileMinHeight - h // Minimum Vertical Scroll Position to see player

    if (minHSP_toSeePlayer > 0 && horizontalScrollPosition < minHSP_toSeePlayer)
      this.G_HSPdelta = (minHSP_toSeePlayer - horizontalScrollPosition) / this.G_tweensPerTurn // Scroll right if needed
    if (minVSP_toSeePlayer > 0 && verticalScrollPosition < minVSP_toSeePlayer)
      this.G_VSPdelta = (minVSP_toSeePlayer - verticalScrollPosition) / this.G_tweensPerTurn // Scroll down if needed
  }

  doPauseGame() {
    if (!this.isPaused) this.G_gamePausedAtMS = new Date().getTime()
    this.isPaused = true
  }

  toggleInventory() {
    const newViz = !this.showingInventoryDialog
    this.showingInventoryDialog = newViz
    const npcDialogIsActive = this.toggleNpcDialogFn(newViz)
    // prevent unpause when toggling inventory during an active npc dialog
    if (npcDialogIsActive) this.isPaused
    else this.isPaused = newViz
  }

  hideInventory() {
    const newViz = false
    this.showingInventoryDialog = newViz
    this.toggleNpcDialogFn(newViz)
    this.isPaused = newViz
  }

  // This is a bit weird. It returns the NAME not the actor. TODO - rename for clarity
  loadActorByName(actorName) {
    const result = this.actors[actorName]
    if (!result) {
      throw new Error(`Actor was not preloaded: ${actorName}`)
    }
    return actorName
  }

  onTickGameDo() {
    if (this.G_gameOver) return

    if (this.isTransitionInProgress) {
      // transition to new map
      // Transition tick function would not run unless specified here
      if (this.transitionStateWaitingForActorLoadRequests) {
        //trace("transitionTick: "+actorLoadsPending+" actor loads still Pending")
        // TODO: Fadeout... if (view.alpha > 0.1)     view.alpha -= 0.1
      } else {
        // TODO: Fadein
        // if (view.alpha < 1.0)
        // {
        //   // Fade it in - looks nice
        //   view.alpha += 0.1
        //   if (view.alpha > 1.0)
        //     view.alpha = 1.0
        //   return
        // }
        // Fade-in done.. We're ready to play!
        this.playPrepareActiveLayer(this.map, true) // Was set by transitionResourcesHaveLoaded()
        this.playPrepareBackgroundLayer()

        this.transitionPlayerAA.x = this.transitionNewX
        this.transitionPlayerAA.fromx = this.transitionNewX
        this.transitionPlayerAA.y = this.transitionNewY
        this.transitionPlayerAA.fromy = this.transitionNewY
        this.transitionPlayerAA.renderX = this.transitionPlayerAA.fromx * MgbSystem.tileMinWidth
        this.transitionPlayerAA.renderY = this.transitionPlayerAA.fromy * MgbSystem.tileMinHeight

        this.transitionPlayerAA.currentActiveShots = 0

        this.AA_player_idx = this.activeActors.length
        this.activeActors[this.AA_player_idx] = this.transitionPlayerAA

        this.container = document.getElementById('mgb-game-container')
        this.scrollMapToSeePlayer()

        this.clearTicTable()
        // this.G_tweenCount = 0
        this.isTransitionInProgress = false
        this.clearPlayerKeys()
      }
      return
    }

    if (this.isPaused) {
      this.setGameStatusFn(0, 'Game PAUSED. Press CTRL to resume')
      return
    }

    const nowMS = new Date().getTime()
    if (!this._timeInASecond || nowMS >= this._timeInASecond) {
      this._timeInASecond = nowMS + 1000
      this.checkForGeneratedActorsThisSecond()
    }

    // Now for the real actions
    if (0 == this.G_tweenCount) {
      // Tweencount of zero means start of turn

      this.askDeferredNpcQuestion()

      // This is the first tween this turn - decide what to do this turn.
      // The remaining tweens for this turn will just animate what we decide now

      // Check for player collision with an event square.
      // These only check against the player's top-left 32x32 pixel 'head'
      const plyr = this.activeActors[this.AA_player_idx]
      const plyrCell = this.cell(plyr.x, plyr.y)
      var eventString = this.map.mapLayer[MgbMap.layerEvents][plyrCell]
      if (eventString && eventString != '') {
        var o = MgbSystem.parseEventCommand(eventString)
        if (o.command === 'jump') {
          this.transitionToNewMap(
            this.map.userName,
            this.map.projectName,
            o.mapname,
            MgbActor.intFromActorParam(o.x),
            MgbActor.intFromActorParam(o.y),
          )
          return
        } else if (o.command == 'music') {
          MgbMusic.playMusic(o.source)
        }
      }

      // Important, need to invalidate the collision detection cache.
      // In theory we could only do this if at least one thing moved, but that's unlikely so not worth the effort
      this.clearTicTable()

      this.checkForTouchDamageAtStartOfTween()

      // Calculate moves (watch out for obstructions)
      for (let AA = 0; AA < this.activeActors.length; AA++) {
        var actor = this.activeActors[AA]
        var aa_p = this.actors[actor.ACidx]

        if (actor.alive && actor.moveSpeed > 0) {
          // Determine move intent
          const oldStepStyle = actor.stepStyle // If it's ice, we need to remember
          let stepStyleOverride = -1 // -1 means no override
          actor.fromx = actor.x
          actor.fromy = actor.y

          // Some blocks on the BACKGROUND layer can affect direction - ice, conveyer belts, pushers... Let's look for these
          let floorActor = null // this will be the actor that is on the background layer
          // We need an x/y loop so we check each cell that the current actor is on
          for (let pushX = 0; pushX < actor.cellSpanX; pushX++) {
            for (let pushY = 0; pushY < actor.cellSpanY; pushY++) {
              var cellIndex = this.cell(actor.x + pushX, actor.y + pushY, true)
              if (cellIndex >= 0) {
                var floorActorName = this.map.mapLayer[MgbMap.layerBackground][cellIndex]
                floorActor = floorActorName && floorActorName != '' ? this.actors[floorActorName] : null
                if (
                  floorActor &&
                  floorActor.content2 &&
                  (MgbActor.intFromActorParam(floorActor.content2.databag.all.actorType) ==
                    MgbActor.alActorType_Item ||
                    [4, 5, 6, 7].indexOf(
                      MgbActor.intFromActorParam(floorActor.content2.databag.all.actorType),
                    ) > -1) &&
                  (MgbActor.intFromActorParam(floorActor.content2.databag.item.itemActivationType) ==
                    MgbActor.alItemActivationType_CausesDamage ||
                    MgbActor.intFromActorParam(floorActor.content2.databag.item.itemActivationType) ==
                      MgbActor.alItemActivationType_PushesActors)
                )
                  break
                floorActor = null
              }
            }
          }
          if (
            floorActor &&
            MgbActor.intFromActorParam(floorActor.content2.databag.item.itemActivationType) ===
              MgbActor.alItemActivationType_PushesActors
          ) {
            switch (MgbActor.intFromActorParam(floorActor.content2.databag.item.itemPushesActorType)) {
              case MgbActor.alItemPushesActorType_up:
              case MgbActor.alItemPushesActorType_right:
              case MgbActor.alItemPushesActorType_down:
              case MgbActor.alItemPushesActorType_left:
                stepStyleOverride = MgbActor.intFromActorParam(
                  floorActor.content2.databag.item.itemPushesActorType,
                )
                break

              case MgbActor.alItemPushesActorType_onwards:
                if (!actor.wasStopped) stepStyleOverride = oldStepStyle
                break

              case MgbActor.alItemPushesActorType_backwards:
                // 0 <->2 , 1 <->3.. so basically
                if (oldStepStyle >= 0) stepStyleOverride = oldStepStyle ^ 2
                break

              case MgbActor.alItemPushesActorType_random:
                stepStyleOverride = Math.floor(Math.random() * 4)
                break
            }
          }
          if (
            floorActor &&
            MgbActor.intFromActorParam(floorActor.content2.databag.item.itemActivationType) ==
              MgbActor.alItemActivationType_CausesDamage
          )
            this.applyDamageToActor(
              AA,
              aa_p,
              MgbActor.intFromActorParam(floorActor.content2.databag.item.healOrHarmWhenUsedNum),
            )

          if (AA === this.AA_player_idx) this.calculateNewPlayerPosition(stepStyleOverride)
          else this.calculateNewEnemyPosition(AA, stepStyleOverride) // Note this can cause actor.alive -> 0
          // Calculate pre-collisions (obstructions)
          if (
            actor.alive == true &&
            (this.checkIfActorObstructed(AA, true) ||
              actor.y < 0 ||
              actor.x < 0 ||
              actor.x + actor.cellSpanX > this.map.metadata.width ||
              actor.y + actor.cellSpanY > this.map.metadata.height)
          ) {
            // Not a valid new space; revert to staying in place
            var cellToCheck = this.cell(actor.x, actor.y) // put this in a var to eliminate multiple lookups.
            actor.x = actor.fromx
            actor.y = actor.fromy
            actor.wasStopped = true
            //actor.stepStyle = -1    // These need to be free to move again. -1 means if they are on ice, they have stopped sliding and are free to choose their movement direction again
            actor.stepCount = 0 // Reset the step count; used to trigger a new movement choice.

            if (AA == this.AA_player_idx) {
              // Who did we just bump into? Did they want to say or do something?
              if (this.G_tic === null) this.generateTicTable()
              if (this.G_tic[cellToCheck] && this.G_tic[cellToCheck].length > 0) {
                for (let i = 0; i < this.G_tic[cellToCheck].length; i++) {
                  var AAInCell = this.G_tic[cellToCheck][i]
                  var ACidx = this.activeActors[AAInCell].ACidx
                  var hitThing_ap = this.actors[ACidx]
                  var activation = MgbActor.intFromActorParam(
                    hitThing_ap.content2.databag.item.itemActivationType,
                  )

                  if (this.activeActors[AAInCell].alive && AAInCell != AA) {
                    // It's alive & not 'me'...
                    if (this.activeActors[AAInCell].type == MgbActor.alActorType_NPC) {
                      // Case 1: Player just collided with an NPC. This can spark a dialog
                      this.askNpcQuestion(this.activeActors[AAInCell], hitThing_ap)
                    } else if (
                      (this.activeActors[AAInCell].type == MgbActor.alActorType_Item ||
                        [4, 5, 6, 7].indexOf(this.activeActors[AAInCell].type) > -1) &&
                      (activation == MgbActor.alItemActivationType_BlocksPlayer ||
                        activation == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
                    ) {
                      // Case 2: It's a wall, I'm a player so see if there's a key available...
                      var key = hitThing_ap.content2.databag.item.keyForThisDoor
                      if (key && key !== '') {
                        // yup, there's a key. Next question - does the player have it?
                        var keyName = key.split(':').pop()
                        var keyItem = this.inventory.get(keyName)
                        if (keyItem) {
                          var keyDestroyed =
                            1 ==
                            MgbActor.intFromActorParam(
                              hitThing_ap.content2.databag.item.keyForThisDoorConsumedYN,
                            )
                          // Yup.. so let's do it!
                          this.setGameStatusFn(
                            1,
                            keyDestroyed
                              ? 'You use your ' + keyName + ' to pass'
                              : 'Since you are carrying the ' + keyName + ' you are able to pass through',
                          )
                          if (keyDestroyed) this.inventory.remove(keyItem)
                          this.activeActors[AAInCell].health = 0 /// This triggers all the usual spawn stuff
                        }
                      }
                    }
                  }
                }
              }
            }

            if (actor.isSliding) {
              // Sliding block or shot
              if (
                1 == MgbActor.intFromActorParam(aa_p.content2.databag.item.squishNPCYN) ||
                (actor.isAShot && (actor.shotDamageToNPC != 0 || actor.shotDamageToPlayer != 0))
              ) {
                // Check Squish effect
                if (this.G_tic == null) this.generateTicTable()
                if (this.G_tic[cellToCheck] && this.G_tic[cellToCheck].length > 0) {
                  for (let i = 0; i < this.G_tic[cellToCheck].length; i++) {
                    AAInCell = this.G_tic[cellToCheck][i]
                    ACidx = this.activeActors[AAInCell].ACidx
                    hitThing_ap = this.actors[ACidx]
                    var damage = 0
                    if (
                      this.activeActors[AAInCell].alive &&
                      AAInCell != AA &&
                      (this.activeActors[AAInCell].type == MgbActor.alActorType_NPC ||
                        this.activeActors[AAInCell].type == MgbActor.alActorType_Player)
                    ) {
                      if (actor.isAShot) {
                        if (AAInCell == this.AA_player_idx) {
                          if (
                            !(
                              this.activeActors[AAInCell].activePowerUntilGetTime >= nowMS &&
                              MgbActor.alGainPowerType_Invulnerable == this.activeActors[AAInCell].activePower
                            )
                          )
                            damage = actor.shotDamageToPlayer
                        } else damage = actor.shotDamageToNPC
                      } else damage = this.activeActors[AAInCell].health
                    }
                    if (damage) this.applyDamageToActor(AAInCell, hitThing_ap, damage)
                  }
                }
              }
              if (actor.alive) this.playStopItemSliding(actor)
            }
          } else actor.wasStopped = false // moved OK
          // Convert intended move into per-tween amounts
          actor.xMovePerTween = (actor.x - actor.fromx) * (MgbSystem.tileMinWidth / this.G_tweensPerTurn)
          actor.yMovePerTween = (actor.y - actor.fromy) * (MgbSystem.tileMinHeight / this.G_tweensPerTurn)

          if (actor.turnsBeforeMeleeReady > 0) actor.turnsBeforeMeleeReady-- //
        }
      }
      this.G_tic = null // Important, need to invalidate the collision detection cache. In theory we could only do this if at least one thing moved, but that's unlikely so not worth the grief...
      this.scrollMapToSeePlayer()
      this.G_tweenCount++
      this.G_tweenSinceMapStarted++
    }

    // Now, for this tween, move each Actor a little bit
    for (let AA = 0; AA < this.activeActors.length; AA++) {
      if (this.activeActors[AA].alive) {
        this.chooseActiveActorDisplayTile(AA) // Switch bitmap if necessary
        // Move by tweened amount
        if (this.activeActors[AA].xMovePerTween || this.activeActors[AA].yMovePerTween) {
          var xo = this.activeActors[AA].xMovePerTween * this.G_tweenCount
          var yo = this.activeActors[AA].yMovePerTween * this.G_tweenCount
          this.activeActors[AA].renderX = this.activeActors[AA].fromx * MgbSystem.tileMinWidth + xo
          this.activeActors[AA].renderY = this.activeActors[AA].fromy * MgbSystem.tileMinHeight + yo
        }
      }
    }

    // Update player power
    if (
      this.activeActors[this.AA_player_idx].activePower != MgbActor.alGainPowerType_None &&
      this.activeActors[this.AA_player_idx].activePowerUntilGetTime < new Date().getTime()
    ) {
      this.activeActors[this.AA_player_idx].activePower = MgbActor.alGainPowerType_None
      this.activeActors[this.AA_player_idx].activePowerUntilGetTime = 0
    }

    // Now, for this tween, check for post-move collisions between *alive* actors- item/enemy/player touch events
    this.playProcessAACollisions()

    // Update scroll position (by tweened amount) if this is the player
    if (this.G_VSPdelta) this.container.scrollTop += this.G_VSPdelta
    if (this.G_HSPdelta) this.container.scrollLeft += this.G_HSPdelta

    // Housekeeping for end-of-turn
    // TODO: Kill & recycle dead enemies
    for (let AA = 0; AA < this.activeActors.length; AA++) {
      if (this.activeActors[AA].alive) {
        var ap = this.actors[this.activeActors[AA].ACidx]

        // limit any heals to not exceed Max health
        if (
          this.activeActors[AA].maxHealth != 0 &&
          this.activeActors[AA].health > this.activeActors[AA].maxHealth
        )
          this.activeActors[AA].health = this.activeActors[AA].maxHealth

        // Next actions on Melee
        switch (this.activeActors[AA].meleeStep) {
          case ActiveActor.MELEESTEP_NOT_IN_MELEE: // Not in Melee
            break // do nothing
          case 7: // Final Melee step
            this.activeActors[AA].meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE // End of Melee
            this.activeActors[AA].turnsBeforeMeleeReady = MgbActor.intFromActorParam(
              ap.content2.databag.allchar.meleeRepeatDelay,
            )
            if (AA == this.AA_player_idx && this.inventory.equipmentMeleeRepeatDelayModifier)
              this.activeActors[AA].turnsBeforeMeleeReady += MgbActor.intFromActorParam(
                this.inventory.equipmentMeleeRepeatDelayModifier,
              )
            if (this.activeActors[AA].turnsBeforeMeleeReady < 0)
              this.activeActors[AA].turnsBeforeMeleeReady = 0
            break
          default:
            this.activeActors[AA].meleeStep++
            break
        }

        switch (this.activeActors[AA].type) {
          case MgbActor.alActorType_Player:
            if (this.activeActors[AA].health <= 0) this.G_gameOver = true
            else if (this.activeActors[AA].winLevel)
              // TODO: player's ...content2.databag.all.visualEffectWhenKilledType
              this.G_gameOver = true
            break
          case MgbActor.alActorType_NPC:
          case MgbActor.alActorType_Item:
          case 4:
          case 5:
          case 6:
          case 7:
            if (this.activeActors[AA].health <= 0) {
              // We don't check ap.content2.databag.itemOrNPC.destroyableYN here; that should be done in the damage routine. This way we can handle death/usage the same way
              // It dies...
              this.activeActors[AA].health = 0
              this.activeActors[AA].alive = false
              this.activeActors[AA].dyingAnimationFrameCount = 1 // TODO - need to distinguish usage from destruction
              // Player gets bounty
              this.activeActors[this.AA_player_idx].score += MgbActor.intFromActorParam(
                ap.content2.databag.itemOrNPC.scoreOrLosePointsWhenKilledByPlayerNum,
              )
              // Get rid of the bitmap
              this.activeActors[AA]._image = null // TODO, nice explosion/fade/usage animations

              switch (this.activeActors[AA].creationCause) {
                case ActiveActor.CREATION_BY_MAP:
                  if (
                    MgbActor.intFromActorParam(ap.content2.databag.itemOrNPC.respawnOption) ==
                      MgbActor.alRespawnOption_Never &&
                    this.activeActors[AA].respawnId
                  ) {
                    // we need to know to persistently kill this piece based on it's original layer etc.
                    // We remember it's final coordinates since some respawn options need to know this
                    this.respawnMemory[this.activeActors[AA].respawnId] = {
                      x: this.activeActors[AA].x,
                      y: this.activeActors[AA].y,
                    }
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
                let dropChancePct = MgbActor.intFromActorParam(
                  ap.content2.databag.itemOrNPC.dropsObjectWhenKilledChance,
                )
                if (dropChancePct === 0 || 100 * Math.random() < dropChancePct) {
                  this.playSpawnNewActor(
                    this.loadActorByName(spawn),
                    this.activeActors[AA].x,
                    this.activeActors[AA].y,
                  )
                  this.G_tic = null // Important, need to invalidate the collision detection cache.
                  drop1Happened = true
                }
              }

              // There's a 2nd drop.. These may go in a direction away from the actor
              spawn = ap.content2.databag.itemOrNPC.dropsObjectWhenKilledName2
              if (spawn && spawn !== '') {
                const dropChancePct = MgbActor.intFromActorParam(
                  ap.content2.databag.itemOrNPC.dropsObjectWhenKilledChance2,
                )
                if (dropChancePct === 0 || 100 * Math.random() < dropChancePct) {
                  // p is of type Point so has {x:, y:}
                  var p = drop1Happened
                    ? this.findAdjacentFreeCellForDrop(AA, this.activeActors[AA].stepStyle)
                    : { x: this.activeActors[AA].x, y: this.activeActors[AA].y }
                  this.playSpawnNewActor(this.loadActorByName(spawn), p.x, p.y)
                  this.clearTicTable() // Important, need to invalidate the collision detection cache.
                }
              }
            }
            break
        }
      }
    }

    this.checkForAppearingAndDisappearingActors() // Actually could just do this if we life/death cases

    this.G_tweenCount = (this.G_tweenCount + 1) % (this.G_tweensPerTurn + 1)
    this.G_tweenSinceMapStarted++
    let ps = ''
    if (
      this.activeActors[this.AA_player_idx].activePower &&
      this.activeActors[this.AA_player_idx].activePowerUntilGetTime >= nowMS
    )
      ps = ' | Active Power = ' + MgbActor.alGainPower[this.activeActors[this.AA_player_idx].activePower]

    const timeStr = this.timeStrSinceGameStarted()

    let mhs =
      this.activeActors[this.AA_player_idx].maxHealth == 0
        ? ''
        : '/' + this.activeActors[this.AA_player_idx].maxHealth
    this.setGameStatusFn(
      0, //"Lives: "+activeActors[this.AA_player_idx].extraLives   +
      'Health ' +
        this.activeActors[this.AA_player_idx].health +
        mhs +
        '  |  Score ' +
        this.activeActors[this.AA_player_idx].score +
        '  |  Time ' +
        timeStr +
        ps,
    )

    if (this.G_gameOver) {
      //debugger//  this needs work
      // var gee = new GameEngineEvent(GameEngineEvent.COMPLETED,
      //   this.initialMap.userName, this.initialMap.projectName, this.initialMap.name,
      //   true, secondsPlayed, this.activeActors[this.AA_player_idx].score)

      if (this.activeActors[this.AA_player_idx].winLevel) {
        //debugger// alert sucks
        alert(
          'Final Score: ' + this.activeActors[this.AA_player_idx].score + ', Time: ' + timeStr,
          'You Win!',
        )
      } else {
        //debugger // alert sucks
        alert('G A M E   O V E R')
        // gee.completedVictory = false    // Change just one parameter...
      }
      //debugger // needs thinking about state management with parent obects
      //    dispatchEvent(gee)
      this.endGame()
    }
  }

  timeStrSinceGameStarted() {
    const nowMS = new Date().getTime()
    const secondsPaused = this.G_pausedTime % 60
    const minutesPaused = Math.floor(this.G_pausedTime / 60)
    const secondsPlayed = Math.floor(nowMS - this.G_gameStartedAtMS) / 1000 - secondsPaused
    const minutesPlayed = Math.floor(secondsPlayed / 60) - minutesPaused
    const hoursPlayed = Math.floor(minutesPlayed / 60)
    let timeStr = ''
    if (hoursPlayed) timeStr += hoursPlayed + ':'
    timeStr += (minutesPlayed % 60 < 10 ? '0' : '') + Math.floor(minutesPlayed % 60) + ':'
    timeStr += (secondsPlayed % 60 < 10 ? '0' : '') + Math.floor(secondsPlayed % 60)
    return timeStr
  }
}
