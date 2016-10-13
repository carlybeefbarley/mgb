
import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'


export default MagePlayGameCollision = {

    
  // Return value is a list of activeArray[] indexes that have ActorCollision items
  // Note that the array would include collision (A,B) but not (B,A)
  // Important #1:  The returned array is arranged so that if the collision involves 
  //                a player, the order in the ActorCollision is (player, other)
  // Important #2:  The activeActors[] array is arranged such that it has moving enities, then non-moving. 
  // 				  ... since we don't check non-moving vs non-moving for collision, we rely on this as a perf optimization
  // Important #3:  The returned array will only include entries for which activeActors[x].alive is true
  //
  // The algorithm here is a variant of qtrees; we use sparse arrays to pigeon sort by cell#, then look for collisions within
  // the cell. We have to actually check to_cell and from_cell because 2 items could be switching positions. Finally we strip
  // duplicates out of the hits[] array
  
  playFindAACollisions()
  {
    const { G_tic, activeActors, AA_player_idx } = this
    var hits = new Array()
    if (null == G_tic)
      this.generateTicTable()					// Positions have changed enough that we have to update the tic table

    // Now, check the cells for collisions
    var i = 0, j = 0;
    var AA2 = 0;
    for (var cell = 0 ; cell < G_tic.length; cell++) {
      if (G_tic[cell] && G_tic[cell].length > 1) {
        for (i = 0; i < G_tic[cell].length; i++) {
          var AA1 = G_tic[cell][i]
          var a1 = activeActors[AA1]
          if (a1.alive)
          {
            // First build an approximate list using the activeActors table. We'll use the bitmap x/y so this maps to user experience
            for (j = i; j < G_tic[cell].length; j++)
            {
              AA2 = G_tic[cell][j]
              var a2 = activeActors[AA2] 
              if (a2.alive && AA1 < AA2)
              {
                // Note - calculating now in PIXELS...
                var x1 = a1.renderX + (a1.renderOffsetCellsX * MgbSystem.tileMinWidth)
                var y1 = a1.renderY + (a1.renderOffsetCellsY * MgbSystem.tileMinHeight)
debugger // check _image.width
                var w1 = (a1._image.width - 1) + (a1.renderOffsetCellsWidth * MgbSystem.tileMinWidth)
                var h1 = (a1._image.height - 1) + (a1.renderOffsetCellsHeight * MgbSystem.tileMinHeight)

                var x2 = a2.renderX + (a2.renderOffsetCellsX * MgbSystem.tileMinWidth)
                var w2 = (a2._image.width - 1) + (a2.renderOffsetCellsWidth * MgbSystem.tileMinWidth)
                if ((x1 >= x2 && x1 < x2+w2) || (x2 >= x1 && x2 < x1+w1)) {
                  var y2 = a2.renderY + (a2.renderOffsetCellsY * MgbSystem.tileMinHeight)
                  var h2 = (a2._image.height - 1) + (a2.renderOffsetCellsHeight * MgbSystem.tileMinHeight) 
                  if ((y1 >= y2 && y1 < y2+h2) ||	(y2 >= y1 && y2 < y1+h1))  {
                    // OK, now let's look really closely..
debugger
                    if (a1._image.hitTest(new Point (x1, y1), 0xF0, a2._image, new Point (x2, y2), 0xF0))
                    {
                      if (AA2 == AA_player_idx)
                        hits.push(new ActorCollision(AA2, AA1))		// Player is always first item in a collision pair
                      else
                        hits.push(new ActorCollision(AA1, AA2))
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // hits could have dupes in it; we have to check
    if (hits.length > 1)
    {
      hits.sort(this.sortOnChoice)
      var hits2 = new Array()
      hits2[0] = hits[0]
      for (i = 1; i < hits.length; i++)
      {
        if (hits[i].AA1 != hits2[hits2.length-1].AA1 || hits[i].AA2 != hits2[hits2.length-1].AA2)
          hits2.push(hits[i])
      }
      hits = hits2
    }
    return hits
  },

  sortOnChoice(a, b) // a and b are ActorCollision object
  {
    const { activeActors } = this
    
    var fa = (a.AA1 * activeActors.length) + a.AA2
    var fb = (b.AA1 * activeActors.length) + b.AA2
    if (fa > fb) 
      return 1
    else if (fa < fb)
      return -1
    else
      return 0
  },

  playProcessAACollisions()
  {
    const { actors, activeActors, AA_player_idx, inventory } = this    
    var hits = this.playFindAACollisions()
    
    for (var hidx = 0; hidx < hits.length; hidx++)
    {
      var aa1_idx = hits[hidx].AA1
      var aa1 = activeActors[aa1_idx]
      var ap1 = actors[activeActors[hits[hidx].AA1].ACidx]
      
      var t1 = aa1.type;
      var aa2_idx = hits[hidx].AA2
      var aa2 = activeActors[aa2_idx]
      var ap2 = actors[activeActors[hits[hidx].AA2].ACidx]
      var t2 = aa2.type
      // Since there is only one player, the collision can only be player/item, or item/item. 
      if (MgbActor.alActorType_Player == t1)		// Note the guarantees offered by playFindAACollisions()... Player is *never* the 2nd tuple
      {
        // Handle Player vs item/NPC collision
        switch (t2)
        {
        case MgbActor.alActorType_Player:
          throw new Error("Program error: player/player collision - should not happen")
          break
        case MgbActor.alActorType_NPC:
          // 1. Damage to player (aa1) from enemy (aa2)
          if (aa2.inMelee())
            this.applyDamageToActor(aa1_idx, ap1, parseInt(ap2.content2.databag.allchar.meleeDamageToPlayerNum))
          else
            this.applyDamageToActor(aa1_idx, ap1, parseInt(ap2.content2.databag.allchar.touchDamageToPlayerNum), parseInt(ap2.content2.databag.allchar.touchDamageAttackChance))
          // 2. Touch Damage to enemy (aa2) from player (aa1)
          if (aa1.inMelee())
            this.applyDamageToActor(aa2_idx, ap2,
                  Math.max(0, parseInt(ap1.content2.databag.allchar.meleeDamageToNPCorItemNum) + inventory.equipmentMeleeDamageBonus))	// Can't be -ve damage, so use max(0, ...) 
          else
            this.applyDamageToActor(aa2_idx, ap2, parseInt(ap1.content2.databag.allchar.touchDamageToNPCorItemNum), parseInt(ap1.content2.databag.allchar.touchDamageAttackChance))
          break
        case MgbActor.alActorType_Shot:
          // Shot damage to player from shot; destroy shot
          if (aa2.actorWhoFiredShot != AA_player_idx && aa2.shotDamageToPlayer > 0)
          {
            // Only worry about shots from non-players and that can hurt the player
            this.applyDamageToActor(aa1_idx, ap1, aa2.shotDamageToPlayer)
            this.playStopItemSliding(aa2)
          }
          break
        case MgbActor.alActorType_Item:
          // 1. Effect of item on player (or vice versa)
          var itemUtilised = false		// True if the item had some effect - so we can trigger events
          var itemConsumed = false		// True if the item has been consumed and must be removed from play
          var showUseText = false			// True if we should show the useText
          var activation = parseInt(ap2.content2.databag.item.itemActivationType)
          switch (activation)				// Note that this switch only covers some of the cases, since only some are touch-based.
          {
          case MgbActor.alItemActivationType_PlayerPicksUpUsesNow:
            this.useItemOnPlayer(hits[hidx].AA2)
            itemUtilised = true
            itemConsumed = true
            showUseText = true									
            break
          case MgbActor.alItemActivationType_PlayerUsesAndLeavesItem:
            this.useItemOnPlayer(hits[hidx].AA2)
            itemUtilised = true
            // TODO: Need to put in some kind of hysterisys to stop continuous usage of items that remain in place...???
            break
          case MgbActor.alItemActivationType_PlayerPicksUpUsesLater:
debugger
            inventory.add(new InventoryItem(actors[activeActors[hits[hidx].AA2].ACidx]))
            itemConsumed = true
            showUseText = true
            break
          case MgbActor.alItemActivationType_BlocksPlayer:
          case MgbActor.alItemActivationType_BlocksPlayerAndNPC:
            if (parseInt(ap2.content2.databag.item.pushToSlideNum)> 0)
              this.playPushItemToStartSliding(hits[hidx].AA1, hits[hidx].AA2)
            break
          }
          // 2. Touch Damage from player to item (if it's not a sliding item)
          if (aa1.inMelee())
          {
            if (ap1.content2.databag.allchar.meleeDamageToNPCorItemNum && 0 == ap2.content2.databag.item.pushToSlideNum)
              this.applyDamageToActor(aa2_idx, ap2, 
                Math.max(0, ap1.content2.databag.allchar.meleeDamageToNPCorItemNum + inventory.equipmentMeleeDamageBonus)) // Can't do -ve damage...
          }
          else
          {
            if (ap1.content2.databag.allchar.touchDamageToNPCorItemNum && 0 == ap2.content2.databag.item.pushToSlideNum)
              this.applyDamageToActor(aa2_idx, ap2, ap1.content2.databag.allchar.touchDamageToNPCorItemNum, parseInt(ap1.content2.databag.allchar.touchDamageAttackChance))
          }
          // 3. Usage notification & after-effects
          if (itemConsumed)
          {
            // Notes: 
            //	(a) NPC/Item death processing is done at end of turn, not in this loop since it would muck up the hits[] array
            //  (b) usage isn't the same as destruction.. even if an item can't be destroyed, it can be used (consumed)
            aa2.health = 0				// That's how we mark this state of transition, even for items
          }
          if (itemUtilised)
          {
            // TODO: content2.databag.item.visualEffectWhenUsedType
            // TODO: content2.databag.item.UseText
          }
          if (showUseText)
          {
            var ut = ap2.content2.databag.item.useText
            if (ut && ut.length > 0)
              this.setGameStatusFn(1,ut)
          }
          
          break
        default:
          throw new Error("Program error: Unknown actor type "+t2)
        }
      }
      else
      {
        // Item-or-NPC/Item-or-NPC collisions
        for (var iteration = 0; iteration < 2; iteration++)
        {
          // We'll do this twice - once for AA1's effects on AA2, then we'll flip AA1/AA2 and do it again
          if (iteration)			// 2nd time through, let's swap - note that these assignments are flipped on purpose
          {
            aa1_idx = hits[hidx].AA2			//yes, this is right! we're flipping
            aa1 = activeActors[aa1_idx]
            ap1 = actors[activeActors[hits[hidx].AA2].ACidx]
            t1 = aa1.type;			// Yes - since aa1 is set for this guy now
            aa2_idx = hits[hidx].AA1
            aa2 = activeActors[aa2_idx]			//yes, this is right! we're flipping
            ap2 = actors[activeActors[hits[hidx].AA1].ACidx]

            t2 = aa2.type;
          }
          switch (t1)
          {
          case MgbActor.alActorType_NPC:
            // 1. Touch Damage from #1 to #2
            this.applyDamageToActor(aa2_idx, ap2, parseInt(ap1.content2.databag.allchar.touchDamageToNPCorItemNum), parseInt(ap1.content2.databag.allchar.touchDamageAttackChance))
            break
          case MgbActor.alActorType_Item:
          case MgbActor.alActorType_Shot:
            if (aa1.isSliding)												// Aha, a Sliding block or shot... 
            {
              if (aa1.isAShot)
              {
                // Shot hits: Damage target & destroy shot
                // we say that shot damage to items is the same as shot damage to npcs
                if (aa1.shotDamageToNPC != 0)	// if it's not destroyable, we'll let the bullet through. Walls have been handled elsewhere...
                {
                  this.applyDamageToActor(aa2_idx, ap2, aa1.shotDamageToNPC)
                  this.playStopItemSliding(aa1)
                }
              }
              else
              {
                // Sliding block
                if (t2 == MgbActor.alActorType_NPC && 1 == parseInt(ap1.content2.databag.item.squishNPCYN))
                {
                  aa2.health = 0
                  MgbActor.playCannedSound(ap2.content2.databag.all.soundWhenHarmed)
                  // TODO: ap1.content2.databag.all.visualEffectWhenHarmedType  
                }
                else
                {
                  aa1.x = aa1.fromx;
                  aa1.y = aa1.fromy;
                  this.playStopItemSliding(aa1)
                  if (t2 == MgbActor.alActorType_NPC && 0 == parseInt(ap1.content2.databag.item.squishNPCYN && aa2.x == aa1.x && aa2.y == aa1.y))
                  {
                    // The NPC moves from position A to B, and sliding block (non-lethal type) moves from B to A. 
                    // We need to move the NPC back
                    aa2.x = aa2.fromx
                    aa2.y = aa2.fromy
                    aa2.xMovePerTween = 0
                    aa2.yMovePerTween = 0
                    aa2.renderX = aa2.fromx * MgbSystem.tileMinWidth
                    aa2.renderY = aa2.fromy * MgbSystem.tileMinHeight
                  }
                }
              }
            }
            break
          }
        }
      }
    }
  }

}