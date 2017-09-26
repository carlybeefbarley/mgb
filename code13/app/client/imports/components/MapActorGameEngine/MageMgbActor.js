import _ from 'lodash'
import ActiveActor from './MageActiveActorClass'

const MgbActor = {
  alNpcDialogFinalAction: ['Disappears', 'Stays', 'Repeat Question'],
  alNpcDialogFinalAction_disappear: 0,
  alNpcDialogFinalAction_stay: 1,
  alNpcDialogFinalAction_repeat: 2,

  alActorType: ['Player', 'Non-Player Character (NPC)', 'Item, Wall, or Scenery', 'Shot', 'Item'],
  alActorTypeShort: ['Player', 'NPC', 'Item', 'Shot'],
  alActorType_Player: 0,
  alActorType_NPC: 1,
  alActorType_Item: 2,
  alActorType_Shot: 3,
  /*
  alActorType_Scenery:      4,
  alActorType_Items:        5,
  alActorType_SolidObject:  6,
  alActorType_Floor:        7,
  */

  alNpcTakeTypes: ['Take', 'Require'],
  alNpcTakeType_Take: 0,
  alNpcTakeType_Require: 1,

  alAppearDisappear: ['No condition', 'Disappear', 'Appear'],
  alAppearDisappear_NoCondition: 0,
  alAppearDisappear_Disappear: 1,
  alAppearDisappear_Appear: 2,

  alShotRate: ['Cannot Shoot', 'Shoot rarely', 'One shot at at time', 'Many shots at a time'],

  alRespawnOptions: ['Respawn on map reload', 'Never respawn'],
  alRespawnOption_MapReload: 0,
  alRespawnOption_Never: 1,

  isSoundNonNull(s) {
    return s && s != '' && s != 'none'
  }, // these are all types of 'nul' sound

  // these sounds should be stored in the sound fields of actor.content2.databag.** as `[builtin]:${soundName}`
  alCannedSoundsList: [
    'none',
    'Arrow1',
    'Arrow2',
    'Beep1',
    'Beep2',
    'Beep3',
    'Beep4',
    'Bounce1',
    'Bounce2',
    'Bounce3',
    'Burp1',
    'Burp2',
    'Chime1',
    'Chomp1',
    'Chomp2',
    'Gasp1',
    'Gasp2',
    'Laser1',
    'Laser2',
    'Laser3',
    'Money1',
    'Money2',
    'Money3',
    'Money4',
    'Scream1',
    'Scream2',
    'Scream3',
    'Scream4',
    'Shot1',
    'Shot2',
    'Shot3',
    'Shot4',
    'Shot5',
    'Shot6',
    'Shot7',
    'Shot8',
    'Siren1',
    'Siren2',
    'Slurp1',
    'Slurp2',
    'Slurp3',
    'Melee1',
    'Melee2',
    'Melee3',
    'Melee4',
    'Melee5',
    'Melee6',
  ],

  alMovementType: [
    'No automatic movement',
    'Moves randomly',
    'Moves towards player',
    'Moves away from player',
  ],
  alMovementType_None: 0,
  alMovementType_Random: 1,
  alMovementType_ToPlayer: 2,
  alMovementType_FromPlayer: 3,

  alTouchDamageCases: ['When overlapping target', 'When facing target', 'When adjacent to target'],

  alTouchDamageCases_WhenOverlapped: 0,
  alTouchDamageCases_WhenFacingAndAdjacent: 1,
  alTouchDamageCases_WhenAdjacent: 2,

  alItemActivation: [
    'inactive',
    'Blocks Player',
    'Blocks NPC',
    'Blocks Player+NPC',
    'Player picks up, uses later',
    'Player picks up, uses immediately',
    'Player uses, but leaves item',
    'Player shoots item to use it',
    'Pushes actors in a direction',
    'Floor that causes damage',
  ],
  alItemActivationType_Inactive: 0,
  alItemActivationType_BlocksPlayer: 1,
  alItemActivationType_BlocksNPC: 2,
  alItemActivationType_BlocksPlayerAndNPC: 3,
  alItemActivationType_PlayerPicksUpUsesLater: 4,
  alItemActivationType_PlayerPicksUpUsesNow: 5,
  alItemActivationType_PlayerUsesAndLeavesItem: 6,
  alItemActivationType_PlayerShootsItemToUse: 7,
  alItemActivationType_PushesActors: 8,
  alItemActivationType_CausesDamage: 9,

  alVisualEffect: ['none', 'glow', 'fade-out', 'explode'],

  alItemPushesActorType: ['Up', 'Right', 'Down', 'Left', 'Onwards', 'Backwards', 'Random'],
  alItemPushesActorType_up: 0,
  alItemPushesActorType_right: 1,
  alItemPushesActorType_down: 2,
  alItemPushesActorType_left: 3,
  alItemPushesActorType_onwards: 4,
  alItemPushesActorType_backwards: 5,
  alItemPushesActorType_random: 6,

  alShotAccuracy: ['Random shot', 'Poor shot', 'Good shot', 'Great Shot'],
  alShotAccuracy_random: 0,
  alShotAccuracy_poor: 1,
  alShotAccuracy_good: 2,
  alShotAccuracy_great: 3,

  alGainPower: ['No power', 'Cannot be harmed'],
  alGainPowerType_None: 0,
  alGainPowerType_Invulnerable: 1,

  ANIMATION_INDEX_BASE_FACE_NORTH: 0,
  ANIMATION_INDEX_BASE_FACE_EAST: 5,
  ANIMATION_INDEX_BASE_FACE_SOUTH: 10,
  ANIMATION_INDEX_BASE_FACE_WEST: 15,
  ANIMATION_INDEX_BASE_STATIONARY_ANYDIRECTION: 20, // Deprecated; only exists for backward-compat with old MGB1 games. Hidden for new Actors
  ANIMATION_INDEX_BASE_MELEE_NORTH: 36,
  ANIMATION_INDEX_BASE_MELEE_EAST: 44,
  ANIMATION_INDEX_BASE_MELEE_SOUTH: 52,
  ANIMATION_INDEX_BASE_MELEE_WEST: 60, // 8 of these
  ANIMATION_INDEX_BASE_STATIONARY_NORTH: 68, // 16 of these
  ANIMATION_INDEX_BASE_STATIONARY_EAST: 84, // 16 of these
  ANIMATION_INDEX_BASE_STATIONARY_SOUTH: 100, // 16 of these
  ANIMATION_INDEX_BASE_STATIONARY_WEST: 116, // 16 of these

  animationEffectNames: [
    { text: 'no effect', value: 'no effect' },
    { text: 'rotate90', value: 'rotate90' },
    { text: 'rotate180', value: 'rotate180' },
    { text: 'rotate270', value: 'rotate270' },
    { text: 'flipX', value: 'flipX' },
    { text: 'flipY', value: 'flipY' },
  ],

  animationNames: [
    // 0 - 4
    'face north',
    'step north 1',
    'step north 2',
    'step north 3',
    'step north 4',

    // 5 - 9
    'face east',
    'step east 1',
    'step east 2',
    'step east 3',
    'step east 4',

    // 10 - 14
    'face south',
    'step south 1',
    'step south 2',
    'step south 3',
    'step south 4',

    // 15 - 19
    'face west',
    'step west 1',
    'step west 2',
    'step west 3',
    'step west 4',

    // 20 - 35
    'stationary 1',
    'stationary 2',
    'stationary 3',
    'stationary 4',
    'stationary 5',
    'stationary 6',
    'stationary 7',
    'stationary 8',
    'stationary 9',
    'stationary 10',
    'stationary 11',
    'stationary 12',
    'stationary 13',
    'stationary 14',
    'stationary 15',
    'stationary 16',

    // 36 - 43
    'melee north 1',
    'melee north 2',
    'melee north 3',
    'melee north 4',
    'melee north 5',
    'melee north 6',
    'melee north 7',
    'melee north 8',

    // 44 - 51
    'melee east 1',
    'melee east 2',
    'melee east 3',
    'melee east 4',
    'melee east 5',
    'melee east 6',
    'melee east 7',
    'melee east 8',

    // 52 - 59
    'melee south 1',
    'melee south 2',
    'melee south 3',
    'melee south 4',
    'melee south 5',
    'melee south 6',
    'melee south 7',
    'melee south 8',

    // 60 - 67
    'melee west 1',
    'melee west 2',
    'melee west 3',
    'melee west 4',
    'melee west 5',
    'melee west 6',
    'melee west 7',
    'melee west 8',

    // 68 - 83
    'stationary north 1',
    'stationary north 2',
    'stationary north 3',
    'stationary north 4',
    'stationary north 5',
    'stationary north 6',
    'stationary north 7',
    'stationary north 8',
    'stationary north 9',
    'stationary north 10',
    'stationary north 11',
    'stationary north 12',
    'stationary north 13',
    'stationary north 14',
    'stationary north 15',
    'stationary north 16',

    // 84 - 99
    'stationary east 1',
    'stationary east 2',
    'stationary east 3',
    'stationary east 4',
    'stationary east 5',
    'stationary east 6',
    'stationary east 7',
    'stationary east 8',
    'stationary east 9',
    'stationary east 10',
    'stationary east 11',
    'stationary east 12',
    'stationary east 13',
    'stationary east 14',
    'stationary east 15',
    'stationary east 16',

    // 100 - 115
    'stationary south 1',
    'stationary south 2',
    'stationary south 3',
    'stationary south 4',
    'stationary south 5',
    'stationary south 6',
    'stationary south 7',
    'stationary south 8',
    'stationary south 9',
    'stationary south 10',
    'stationary south 11',
    'stationary south 12',
    'stationary south 13',
    'stationary south 14',
    'stationary south 15',
    'stationary south 16',

    // 116 - 131
    'stationary west 1',
    'stationary west 2',
    'stationary west 3',
    'stationary west 4',
    'stationary west 5',
    'stationary west 6',
    'stationary west 7',
    'stationary west 8',
    'stationary west 9',
    'stationary west 10',
    'stationary west 11',
    'stationary west 12',
    'stationary west 13',
    'stationary west 14',
    'stationary west 15',
    'stationary west 16',
  ],
  loadSounds(actor, oName, callback) {
    if (!MgbActor._loadedSounds) {
      MgbActor._loadedSounds = {}
      // Builtin sounds
      var names = this.alCannedSoundsList.slice(1) // ignore first item

      // Relevant sound assets
      if (actor) {
        // Do user:asset to differentiate from builtin
        let actorSounds = [
          _.includes(actor.databag.all.soundWhenHarmed, ':')
            ? actor.databag.all.soundWhenHarmed
            : oName + ':' + actor.databag.all.soundWhenHarmed,
          _.includes(actor.databag.all.soundWhenHealed, ':')
            ? actor.databag.all.soundWhenHealed
            : oName + ':' + actor.databag.all.soundWhenHealed,
          _.includes(actor.databag.all.soundWhenKilled, ':')
            ? actor.databag.all.soundWhenKilled
            : oName + ':' + actor.databag.all.soundWhenKilled,
          _.includes(actor.databag.allchar.soundWhenMelee, ':')
            ? actor.databag.allchar.soundWhenMelee
            : oName + ':' + actor.databag.allchar.soundWhenMelee,
          _.includes(actor.databag.allchar.soundWhenShooting, ':')
            ? actor.databag.allchar.soundWhenShooting
            : oName + ':' + actor.databag.allchar.soundWhenShooting,
          _.includes(actor.databag.item.equippedNewMeleeSound, ':')
            ? actor.databag.item.equippedNewMeleeSound
            : oName + ':' + actor.databag.item.equippedNewMeleeSound,
          _.includes(actor.databag.item.equippedNewShotSound, ':')
            ? actor.databag.item.equippedNewShotSound
            : oName + ':' + actor.databag.item.equippedNewShotSound,
        ]
        const desiredSoundNames = _.filter(_.uniqWith(actorSounds, _.isEqual), n => n)
        names = names.concat(desiredSoundNames)
      }

      var name
      var countClosure = names.length
      var canplay = function(result) {
        if (--countClosure === 0) {
          callback && callback(result)
        }
      }
      for (let n = 0; n < names.length; n++) {
        name = names[n]
        MgbActor._loadedSounds[name] = document.createElement('audio')
        MgbActor._loadedSounds[name].addEventListener('canplay', canplay, false)
        if (_.includes(name, ':')) {
          // sound asset
          MgbActor._loadedSounds[name].src =
            '/api/asset/sound/' + name.split(':')[0] + '/' + name.split(':')[1] + '/sound.mp3'
        } else {
          // builtin sound
          MgbActor._loadedSounds[name].src = '/audio/builtinForActors/' + name + '.wav'
          MgbActor._loadedSounds[name].volume = 0.4
        }
      }
    }
  },

  // TODO: Implement a preloadSoundsForActor() method
  playCannedSound(_soundName, actor, oName) {
    if (!_soundName) return

    const soundName = _soundName.replace(/^\[builtin]:/, '') // We will handle missing [builtin]: for now

    if (!MgbActor._loadedSounds || !_.includes(MgbActor._loadedSounds, _soundName))
      MgbActor.loadSounds(actor, oName)
    else if (soundName !== 'none') {
      const sound = MgbActor._loadedSounds[soundName]
      sound && sound.play()
    }
  },

  // Preview sound when selecting in editor, only builtin sounds
  previewCannedSound(_soundName) {
    if (!_soundName) return

    const soundName = _soundName.split(':').pop()

    if (soundName !== 'none') {
      const sound = document.createElement('audio')
      sound.src = '/audio/builtinForActors/' + soundName + '.wav'
      sound.volume = 0.4
      sound && sound.play()
    }
  },

  getAnimationIndex(
    actorPiece,
    currentStepStyle, // -1 means stationary. 0...3 Mean north/east/south/west. If -1, we use priorstepStyle to work out the direction the actor should be facing
    priorStepStyle,
    tweenCount,
    meleeStep = -1, // If in Melee, this is 0..7, stating which melee Animation step to use. This then chooses a melee animation (if there is one) depending on the direction - it can return "", unlike the non-melee use of this function. Note that -1 == ActiveActor.MELEESTEP_NOT_IN_MELEE
  ) {
    const frame = tweenCount % 5 // Normal move animations have 5 steps
    const frame_Stationary = (tweenCount >> 1) % 16 // # Stationary animations have 16 steps
    let hasStationaryAnyDirection = false
    let animationTableIndex = -1 // This will be used to work out which animation tile to use, and will become teh return value from this method
    const effectiveStepStyle = currentStepStyle == -1 ? priorStepStyle : currentStepStyle // This will be the most valid (i.e. not -1) of current/prior stepstyle

    if (meleeStep == ActiveActor.MELEESTEP_NOT_IN_MELEE) {
      // This isn't a meleestep, so use a direction-based tile choice
      switch (currentStepStyle) {
        case 0: // North
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_NORTH + frame
          break
        case 1: // East
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_EAST + frame
          break
        case 2: // South
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_SOUTH + frame
          break
        case 3: // West
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_WEST + frame
          break
        case -1: // stationary
          switch (priorStepStyle) {
            case -1:
              animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_ANYDIRECTION + frame_Stationary
              break
            case 0: // North
              animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_NORTH + frame_Stationary
              break
            case 1: // East
              animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_EAST + frame_Stationary
              break
            case 2: // South
              animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_SOUTH + frame_Stationary
              break
            case 3: // West
              animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_WEST + frame_Stationary
              break
          }

          if (!MgbActor.isAnimationTableIndexValid(actorPiece, animationTableIndex)) {
            animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_ANYDIRECTION + frame_Stationary // Try non-directional stationary animation
            if (MgbActor.isAnimationTableIndexValid(actorPiece, animationTableIndex)) break
            else
              for (let i = 1; i < 16; i++) {
                const idx = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_ANYDIRECTION + i
                if (MgbActor.isAnimationTableIndexValid(actorPiece, idx)) {
                  hasStationaryAnyDirection = true
                  break
                }
              }
            // If there are no any-direction stationary animations, play directional stationary animation or stay facing the same direction
            if (!hasStationaryAnyDirection) {
              switch (priorStepStyle) {
                case -1:
                  animationTableIndex = -1
                  break
                case 0: // North
                  animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_NORTH
                  break
                case 1: // East
                  animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_EAST
                  break
                case 2: // South
                  animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_SOUTH
                  break
                case 3: // West
                  animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_WEST
                  break
              }
            }
          }
          break
      }
    } else {
      // If in melee, see if a melee animation is available
      switch (effectiveStepStyle) {
        case -1: // stationary
          // This is tricky. Let's take a WAG and try North!
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_NORTH + meleeStep
          break
        case 0: // North
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_NORTH + meleeStep
          break
        case 1: // East
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_EAST + meleeStep
          break
        case 2: // South
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_SOUTH + meleeStep
          break
        case 3: // West
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_WEST + meleeStep
          break
      }
      // Now, is there actually an animation here? If not, then revert back
      const animTableEntry = actorPiece.animationTable[animationTableIndex]
      if (!animTableEntry || animTableEntry.tileName === null || animTableEntry.tileName === '')
        animationTableIndex = -1
    }
    return animationTableIndex
  },

  isAnimationTableIndexValid(
    actorPiece,
    animationTableIndex, // i.e. non-empty and correctly formed
  ) {
    var ate = actorPiece.animationTable[animationTableIndex] // Animation Table Entry
    return ate && ((ate.effect !== 'no effect' && ate.effect !== '') || ate.tileName !== '')
  },

  getAnimationEffectFromIndex(actorPiece, animationTableIndex) {
    // We define there
    if (animationTableIndex == -1) return 'no effect'
    const ate = actorPiece.animationTable[animationTableIndex]
    if (!ate) return 'no effect'

    const retval = ate.effect
    if (!retval || retval === '') return 'no effect'

    return retval
  },

  getAnimationTileFromIndex(actorPiece, animationTableIndex) {
    let tileName
    if (animationTableIndex == -1) tileName = actorPiece.databag.all.defaultGraphicName
    else {
      tileName = actorPiece.animationTable[animationTableIndex].tileName
      if (tileName == null || tileName == '') tileName = actorPiece.databag.all.defaultGraphicName
    }
    return tileName ? tileName : '' // Null -> ''
  },

  intFromActorParam(param) {
    if (typeof param == 'number') return Math.floor(param)
    if (typeof param === 'undefined') return 0 // http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f87.html
    return parseInt(param, 10)
  },

  numberFromActorParam(param) {
    if (typeof param == 'number') return param
    if (typeof param === 'undefined') return 0 // http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f87.html
    return Number(param)
  },

  stringFromActorParam(param) {
    if (typeof param == 'string') return param
    if (typeof param === 'undefined') return null // http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f87.html
    return param.toString()
  },
}

export default MgbActor
