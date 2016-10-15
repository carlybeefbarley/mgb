
import ActiveActor from './MageActiveActorClass'

const MgbActor = {

  alNpcDialogFinalAction:             ["Disappears", "Stays", "Repeat Question"],
  alNpcDialogFinalAction_disappear:   0,
  alNpcDialogFinalAction_stay:        1,
  alNpcDialogFinalAction_repeat:      2,

  alActorType:              ["Player", "Non-Player Character (NPC)", "Item, wall or scenery", "Shot"],
  alActorTypeShort:         ["Player", "NPC", "Item", "Shot"],
  alActorType_Player:       0,
  alActorType_NPC:          1,
  alActorType_Item:         2,
  alActorType_Shot:         3,

  alNpcTakeTypes:           ["Take", "Require"],
  alNpcTakeType_Take:       0,
  alNpcTakeType_Require:    1,

  alAppearDisappear:              ["No condition", "Disappear", "Appear"],
  alAppearDisappear_NoCondition:  0,
  alAppearDisappear_Disappear:    1,
  alAppearDisappear_Appear:       2,

  alShotRate: ["Cannot Shoot", "Shoot rarely", "One shot at at time", "Many shots at a time"],

  alRespawnOptions:           ["Respawn on map reload", "Never respawn"],
  alRespawnOption_MapReload:  0,
  alRespawnOption_Never:      1,

  isSoundNonNull: function(s) { return s && s != "" && s != "none" },			// these are all types of 'nul' sound

  alCannedSoundsList: [
    "none",
    "Arrow1",	"Arrow2", 
    "Beep1", 	"Beep2", 	"Beep3",	"Beep4",
    "Bounce1", 	"Bounce2",	"Bounce3",	
    "Burp1",	"Burp2",
    "Chime1",
    "Chomp1",	"Chomp2",
    "Gasp1",	"Gasp2",
    "Laser1",	"Laser2",	"Laser3",
    "Money1",	"Money2",	"Money3",	"Money4",
    "Scream1",	"Scream2",	"Scream3",	"Scream4",
    "Shot1",	"Shot2",	"Shot3",	"Shot4",	"Shot5",	"Shot6",	"Shot7",	"Shot8",
    "Siren1",	"Siren2",
    "Slurp1",	"Slurp2",	"Slurp3",
    "Melee1",	"Melee2",	"Melee3",	"Melee4",	"Melee5",	"Melee6"
  ],


  alMovementType:             [ "No automatic movement", 
                                "Moves randomly", 
                                "Moves towards player", 
                                "Moves away from player" ],
  alMovementType_None:        0,
  alMovementType_Random:      1,
  alMovementType_ToPlayer:    2,
  alMovementType_FromPlayer:  3,
  
  alTouchDamageCases: [
    "When overlapping target", 
    "When facing target", 
    "When adjacent to target" 
  ],

  alTouchDamageCases_WhenOverlapped:        0,
  alTouchDamageCases_WhenFacingAndAdjacent: 1,
  alTouchDamageCases_WhenAdjacent:          2,
  
  alItemActivation: [
    "inactive", 
    "Blocks Player", "Blocks NPC", "Blocks Player+NPC", 
    "Player picks up, uses later", 
    "Player picks up, uses immediately", 
    "Player uses, but leaves item", 
    "Player shoots item to use it",
    "Pushes actors in a direction",
    "Floor that causes damage"
  ],
  alItemActivationType_Inactive:                0,
  alItemActivationType_BlocksPlayer:            1,
  alItemActivationType_BlocksNPC:               2,
  alItemActivationType_BlocksPlayerAndNPC:      3,
  alItemActivationType_PlayerPicksUpUsesLater:  4,
  alItemActivationType_PlayerPicksUpUsesNow:    5,
  alItemActivationType_PlayerUsesAndLeavesItem: 6,
  alItemActivationType_PlayerShootsItemToUse:   7,
  alItemActivationType_PushesActors:            8,
  alItemActivationType_CausesDamage:            9,

  alVisualEffect: [
    "none", 
    "glow", 
    "fade-out", 
    "explode"
  ],
        
  alItemPushesActorType: ["Up", "Right", "Down", "Left", "Onwards", "Backwards", "Random"],
  alItemPushesActorType_up:        0,
  alItemPushesActorType_right:     1,
  alItemPushesActorType_down:      2,
  alItemPushesActorType_left:      3,
  alItemPushesActorType_onwards:   4,
  alItemPushesActorType_backwards: 5,
  alItemPushesActorType_random:    6,

  alShotAccuracy: ["Random shot","Poor shot", "Good shot", "Great Shot" ],
  alShotAccuracy_random:  0,
  alShotAccuracy_poor:    1,
  alShotAccuracy_good:    2,
  alShotAccuracy_great:   3,

  alGainPower: ["No power","Cannot be harmed"],
  alGainPowerType_None:         0,
  alGainPowerType_Invulnerable: 1,


  ANIMATION_INDEX_BASE_FACE_NORTH:              0,
  ANIMATION_INDEX_BASE_FACE_EAST:               5,
  ANIMATION_INDEX_BASE_FACE_SOUTH:              10,
  ANIMATION_INDEX_BASE_FACE_WEST:               15,
  ANIMATION_INDEX_BASE_STATIONARY_ANYDIRECTION: 20,// This was called 'ANIMATION_INDEX_BASE_STATIONARY' before we had directional staionary animations
  ANIMATION_INDEX_BASE_MELEE_NORTH:             36,
  ANIMATION_INDEX_BASE_MELEE_EAST:              44,
  ANIMATION_INDEX_BASE_MELEE_SOUTH:             52,
  ANIMATION_INDEX_BASE_MELEE_WEST:              60,			// 8 of these
  ANIMATION_INDEX_BASE_STATIONARY_NORTH:        68,		// 16 of these
  ANIMATION_INDEX_BASE_STATIONARY_EAST:         84,		// 16 of these
  ANIMATION_INDEX_BASE_STATIONARY_SOUTH:        100,	// 16 of these
  ANIMATION_INDEX_BASE_STATIONARY_WEST:         116,	// 16 of these

  playCannedSound: function(soundName) {
    console.log("TODO: Play sound: " + soundName)
  },

  getAnimationIndex: function(	
    actorPiece, 
    currentStepStyle, 					// -1 means stationary. 0...3 Mean north/east/south/west. If -1, we use priorstepStyle to work out the direction the actor should be facing
    priorStepStyle, 
    tweenCount, 
    meleeStep = -1)     				// If in Melee, this is 0..7, stating which melee Animation step to use. This then chooses a melee animation (if there is one) depending on the direction - it can return "", unlike the non-melee use of this function. Note that -1 == ActiveActor.MELEESTEP_NOT_IN_MELEE
  {
    const frame = tweenCount % 5									  // Normal move animations have 5 steps
    const frame_Stationary = (tweenCount >> 1) % 16	// # Stationary animations have 16 steps
    let animationTableIndex = -1			      				// This will be used to work out which animation tile to use, and will become teh return value from this method
    const effectiveStepStyle = (currentStepStyle == -1) ? priorStepStyle : currentStepStyle;		// This will be the most valid (i.e. not -1) of current/prior stepstyle

    if (meleeStep == ActiveActor.MELEESTEP_NOT_IN_MELEE)
    {
      // This isn't a meleestep, so use a direction-based tile choice
      switch (currentStepStyle)
      {
      case 0:	// North
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_NORTH + frame
        break
      case 1: // East 
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_EAST + frame
        break
      case 2:	// South
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_SOUTH + frame
        break
      case 3:	// West
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_FACE_WEST + frame
        break
      case -1: // stationary
        switch (priorStepStyle)
        {
        case -1: // stationary
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_SOUTH + frame_Stationary
          break
        case 0:	// North
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_NORTH + frame_Stationary
          break
        case 1: // East 
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_EAST + frame_Stationary
          break
        case 2:	// South
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_SOUTH + frame_Stationary
          break
        case 3:	// West
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_WEST + frame_Stationary
          break 
        }

        if (!MgbActor.isAnimationTableIndexValid(actorPiece, animationTableIndex))
          animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_STATIONARY_ANYDIRECTION + frame_Stationary				// Hmm, nothing there. Let's try the default (non-directional) stationary animations
        
        if (!MgbActor.isAnimationTableIndexValid(actorPiece, animationTableIndex))
          animationTableIndex = -1			// We give up. Just use the default, nothing better has been specified.
        
        break
      }
    }
    else
    {
      // If in melee, see if a melee animation is available
      switch (effectiveStepStyle)
      {
      case -1: // stationary
        // This is tricky. Let's take a WAG and try North!
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_NORTH + meleeStep
        break
      case 0:	// North
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_NORTH + meleeStep
        break
      case 1: // East 
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_EAST + meleeStep
        break
      case 2:	// South
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_SOUTH + meleeStep
        break
      case 3:	// West
        animationTableIndex = MgbActor.ANIMATION_INDEX_BASE_MELEE_WEST + meleeStep
        break
      }
      // Now, is there actually an animation here? If not, then revert back
      const animTableEntry = actorPiece.animationTable[animationTableIndex]
      if (!animTableEntry || animTableEntry.tilename === null || animTableEntry.tilename === '')
        animationTableIndex = -1 
    }
    return animationTableIndex
  },

  isAnimationTableIndexValid: function(actorPiece, animationTableIndex)		// i.e. non-empty and correctly formed 
  {
    var ate = actorPiece.animationTable[animationTableIndex]		// Animation Table Entry
    return ate && ((ate.effect !== "no effect" && ate.effect !== '') || (ate.tilename !== ''))
  },

  getAnimationEffectFromIndex: function(actorPiece, animationTableIndex)
  {
    return animationTableIndex == -1 ? "no effect" : actorPiece.animationTable[animationTableIndex].effect
  },

  getAnimationTileFromIndex: function(actorPiece, animationTableIndex)
  {
    let tilename
    if (animationTableIndex == -1)
      tilename = actorPiece.databag.all.defaultGraphicName
    else
    {
      tilename = actorPiece.animationTable[animationTableIndex].tileName
      if (tilename == null || tilename == "")
        tilename = actorPiece.databag.all.defaultGraphicName
    }
    return tilename ? tilename :  ''		// Null -> ''
  },

  intFromActorParam: function (param) {
    if (typeof param == 'number')
      return Math.floor(param)
    if (typeof param === 'undefined')
      return 0    // http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f87.html
    return parseInt(param, 10)
  },

  numberFromActorParam: function (param) {
    if (typeof param == 'number')
      return param
    if (typeof param === 'undefined')
      return 0    // http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f87.html
    return Number(param)
  },

  stringFromActorParam: function (param) {
    if (typeof param == 'string')
      return param
    if (typeof param === 'undefined')
      return null    // http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f87.html
    return param.toString()
  }

}

export default MgbActor