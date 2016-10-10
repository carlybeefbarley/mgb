
import ActiveActor from './MageActiveActorClass'

export const MgbActor = {
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
      if (actorPiece.animationTable[animationTableIndex].tilename == null || actorPiece.animationTable[animationTableIndex].tilename == "")
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
    return tilename ? tilename :  ""		// Null -> ""
  }
}
