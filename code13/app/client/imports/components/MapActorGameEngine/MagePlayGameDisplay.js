
import MgbActor from './MageMgbActor'

export default MagePlayGameDisplay = {

  /**
   * 
   * 
   * @param {int} AA
   */
  chooseActiveActorDisplayTile(AA)
  {
    const { actors, activeActors, AA_player_idx, inventory, graphics, G_tweenCount } = this

    // 1. Reset any render offsets
    activeActors[AA].renderOffsetCellsX = 0
    activeActors[AA].renderOffsetCellsY = 0
    activeActors[AA].renderOffsetCellsWidth = 0
    activeActors[AA].renderOffsetCellsHeight = 0

    // 2. Get the actorPiece
    let ap
    if (AA == AA_player_idx && inventory.equipmentNewActorGraphics)
      ap = actors[inventory.equipmentNewActorGraphics]
    else
      ap = actors[activeActors[AA].ACidx]

    // 3. Find out which tile to use
    
    var animationTableIndex = MgbActor.getAnimationIndex(
      ap.content2, 
      (activeActors[AA].xMovePerTween == 0 && activeActors[AA].yMovePerTween == 0) ? -1 : activeActors[AA].stepStyle,
      activeActors[AA].stepStyle,  
      G_tweenCount,
      activeActors[AA].meleeStep)
    
    if (activeActors[AA].inMelee())
    {
      if (animationTableIndex == -1)
      {
        // No interesting Melee animation so just revert to using direction
        animationTableIndex = MgbActor.getAnimationIndex(	
          ap.content2, 
          (activeActors[AA].xMovePerTween == 0 && activeActors[AA].yMovePerTween == 0) ? -1 : activeActors[AA].stepStyle,
          activeActors[AA].stepStyle,  
          G_tweenCount)	// Note - Melee Step purposely omitted
      }
      else
      {
        // Tile *was* specified-  we have a special case where if it's a melee tile we offset the UI
        if (activeActors[AA].inMelee())
        {
          activeActors[AA].renderOffsetCellsX = -1
          activeActors[AA].renderOffsetCellsY = -1
          activeActors[AA].renderOffsetCellsWidth = 2
          activeActors[AA].renderOffsetCellsHeight = 2
        }
      }
    } 
    
    var newTileName = MgbActor.getAnimationTileFromIndex(ap.content2, animationTableIndex)
    var effect = MgbActor.getAnimationEffectFromIndex(ap.content2, animationTableIndex)

    // Load the tile if necessary
    if (newTileName != "")
    {
      var newTilePiece = graphics[newTileName]
      activeActors[AA]._image = this.bitmapDataVariant(newTilePiece, effect)
    }
  },

  bitmapDataVariant(graphics, effect)
  {
    // TODO
    return graphics._image    
  }
}