import InventoryItem from './MageInventoryItem'
import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'

// Pixel with alpha level below this value is considered transparent
const ALPHALEVEL = 20

class ActorCollision {
  constructor(a1, a2) {
    this.AA1 = a1 // Index of Actor#1 involved in collision
    this.AA2 = a2 // Index of Actor#2 involved in collision
  }
}

const MagePlayGameCollision = {
  // Return value is a list of activeArray[] indexes that have ActorCollision items
  // Note that the array would include collision (A,B) but not (B,A)
  // Important #1:  The returned array is arranged so that if the collision involves
  //                a player, the order in the ActorCollision is (player, other)
  // Important #2:  The activeActors[] array is arranged such that it has moving enities, then non-moving.
  //           ... since we don't check non-moving vs non-moving for collision, we rely on this as a perf optimization
  // Important #3:  The returned array will only include entries for which activeActors[x].alive is true
  //
  // The algorithm here is a variant of qtrees; we use sparse arrays to pigeon sort by cell#, then look for collisions within
  // the cell. We have to actually check to_cell and from_cell because 2 items could be switching positions. Finally we strip
  // duplicates out of the hits[] array

  playFindAACollisions() {
    if (!this.G_tic) this.generateTicTable() // Positions have changed enough that we have to update the tic table
    const { G_tic, activeActors, AA_player_idx } = this

    var hits = []

    // Now, check the cells for collisions
    var i = 0,
      j = 0
    var AA2 = 0
    for (let cell = 0; cell < G_tic.length; cell++) {
      if (G_tic[cell] && G_tic[cell].length > 1) {
        for (let i = 0; i < G_tic[cell].length; i++) {
          var AA1 = G_tic[cell][i]
          var a1 = activeActors[AA1]
          if (a1.alive) {
            // First build an approximate list using the activeActors table. We'll use the bitmap x/y so this maps to user experience
            for (let j = i; j < G_tic[cell].length; j++) {
              AA2 = G_tic[cell][j]
              var a2 = activeActors[AA2]
              if (a2.alive && AA1 < AA2) {
                // Note - calculating now in PIXELS...
                var x1 = a1.renderX + a1.renderOffsetCellsX * MgbSystem.tileMinWidth
                var y1 = a1.renderY + a1.renderOffsetCellsY * MgbSystem.tileMinHeight
                var w1 = a1._image.width - 1 + a1.renderOffsetCellsWidth * MgbSystem.tileMinWidth
                var h1 = a1._image.height - 1 + a1.renderOffsetCellsHeight * MgbSystem.tileMinHeight

                var x2 = a2.renderX + a2.renderOffsetCellsX * MgbSystem.tileMinWidth
                var w2 = a2._image.width - 1 + a2.renderOffsetCellsWidth * MgbSystem.tileMinWidth
                if ((x1 >= x2 && x1 < x2 + w2) || (x2 >= x1 && x2 < x1 + w1)) {
                  var y2 = a2.renderY + a2.renderOffsetCellsY * MgbSystem.tileMinHeight
                  var h2 = a2._image.height - 1 + a2.renderOffsetCellsHeight * MgbSystem.tileMinHeight
                  if ((y1 >= y2 && y1 < y2 + h2) || (y2 >= y1 && y2 < y1 + h1)) {
                    // OK, now let's look really closely..
                    if (this.pixelLevelHitTest(a1._image, x1, y1, w1, h1, a2._image, x2, y2, w2, h2)) {
                      if (AA2 == AA_player_idx)
                        hits.push(new ActorCollision(AA2, AA1)) // Player is always first item in a collision pair
                      else hits.push(new ActorCollision(AA1, AA2))
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
    if (hits.length > 1) {
      hits.sort((a, b) => this.sortOnChoice(a, b)) // TODO - find cheaper way to do this? Array.sort seems to bind
      var hits2 = new Array()
      hits2[0] = hits[0]
      for (let i = 1; i < hits.length; i++) {
        if (hits[i].AA1 != hits2[hits2.length - 1].AA1 || hits[i].AA2 != hits2[hits2.length - 1].AA2)
          hits2.push(hits[i])
      }
      hits = hits2
    }
    return hits
  },

  // Modified implementation of http://www.playmycode.com/blog/2011/08/javascript-per-pixel-html5-canvas-image-collision-detection/
  pixelLevelHitTest(image1, x1, y1, w1, h1, image2, x2, y2, w2, h2) {
    // we need to avoid using floats, as were doing array lookups
    x1 = Math.floor(x1)
    y1 = Math.floor(y1)
    x2 = Math.floor(x2)
    y2 = Math.floor(y2)

    // just draw images in memory and compare pixels
    const c1 = document.createElement('canvas')
    c1.ctx = c1.getContext('2d')
    c1.width = w1
    c1.height = h1
    c1.ctx.drawImage(image1, 0, 0)
    const c2 = document.createElement('canvas')
    c2.ctx = c2.getContext('2d')
    c2.width = w2
    c2.height = h2
    c2.ctx.drawImage(image2, 0, 0)
    // image1 and image2 are correctly defined yet it doesn't seem to draw the images

    // find the top left and bottom right corners of overlapping area
    var xMin = Math.max(x1, x2),
      yMin = Math.max(y1, y2),
      xMax = Math.min(x1 + w1, x2 + w2),
      yMax = Math.min(y1 + h1, y2 + h2)

    var xDiff = xMax - xMin,
      yDiff = yMax - yMin

    // Sanity collision check, we ensure that the top-left corner is both
    // above and to the left of the bottom-right corner.
    if (xMin >= xMax || yMin >= yMax) {
      return false
    }

    // get the pixels out from the images
    var pixels1 = c1.ctx.getImageData(0, 0, w1, h1).data
    var pixels2 = c2.ctx.getImageData(0, 0, w2, h2).data

    // MGB1 would treat everthing below 255 alpha as transparent
    const transparencyLevel = this.isMgb1Game ? 255 : ALPHALEVEL

    // if the area is really small,
    // then just perform a normal image collision check
    if (xDiff < 4 && yDiff < 4) {
      for (var pixelX = xMin; pixelX < xMax; pixelX++) {
        for (var pixelY = yMin; pixelY < yMax; pixelY++) {
          if (
            pixels1[(pixelX - x1 + (pixelY - y1) * w1) * 4 + 3] >= transparencyLevel &&
            pixels2[(pixelX - x2 + (pixelY - y2) * w2) * 4 + 3] >= transparencyLevel
          ) {
            return true
          }
        }
      }
    } else {
      //It is iterating over the overlapping area,
      //across the x then y the,
      //checking if the pixels are on top of this.

      //What is special is that it increments by incX or incY,
      //allowing it to quickly jump across the image in large increments
      //rather then slowly going pixel by pixel.

      //This makes it more likely to find a colliding pixel early.

      // Work out the increments,
      // it's a third, but ensure we don't get a tiny
      // slither of an area for the last iteration (using fast ceil).
      var incX = xDiff / 3.0,
        incY = yDiff / 3.0
      incX = ~~incX === incX ? incX : (incX + 1) | 0
      incY = ~~incY === incY ? incY : (incY + 1) | 0

      for (var offsetY = 0; offsetY < incY; offsetY++) {
        for (var offsetX = 0; offsetX < incX; offsetX++) {
          for (let pixelY = yMin + offsetY; pixelY < yMax; pixelY += incY) {
            for (let pixelX = xMin + offsetX; pixelX < xMax; pixelX += incX) {
              if (
                pixels1[(pixelX - x1 + (pixelY - y1) * w1) * 4 + 3] >= transparencyLevel &&
                pixels2[(pixelX - x2 + (pixelY - y2) * w2) * 4 + 3] >= transparencyLevel
              ) {
                return true
              }
            }
          }
        }
      }
    }
    return false
  },

  sortOnChoice(
    a,
    b, // a and b are ActorCollision object
  ) {
    const { activeActors } = this

    var fa = a.AA1 * activeActors.length + a.AA2
    var fb = b.AA1 * activeActors.length + b.AA2
    if (fa > fb) return 1
    else if (fa < fb) return -1
    else return 0
  },

  playProcessAACollisions() {
    const { actors, activeActors, AA_player_idx, inventory, ownerName } = this
    var hits = this.playFindAACollisions()

    for (let hidx = 0; hidx < hits.length; hidx++) {
      var aa1_idx = hits[hidx].AA1
      var aa1 = activeActors[aa1_idx]
      var ap1 = actors[activeActors[hits[hidx].AA1].ACidx]

      var t1 = aa1.type
      var aa2_idx = hits[hidx].AA2
      var aa2 = activeActors[aa2_idx]
      var ap2 = actors[activeActors[hits[hidx].AA2].ACidx]
      var t2 = aa2.type
      // Since there is only one player, the collision can only be player/item, or item/item.
      if (MgbActor.alActorType_Player == t1) {
        // Note the guarantees offered by playFindAACollisions()... Player is *never* the 2nd tuple
        // Handle Player vs item/NPC collision
        switch (t2) {
          case MgbActor.alActorType_Player:
            throw new Error('Program error: player/player collision - should not happen')
          case MgbActor.alActorType_NPC:
            // 1. Damage to player (aa1) from enemy (aa2)
            if (aa2.inMelee())
              this.applyDamageToActor(
                aa1_idx,
                ap1,
                MgbActor.intFromActorParam(ap2.content2.databag.allchar.meleeDamageToPlayerNum),
              )
            else
              this.applyDamageToActor(
                aa1_idx,
                ap1,
                MgbActor.intFromActorParam(ap2.content2.databag.allchar.touchDamageToPlayerNum),
                MgbActor.intFromActorParam(ap2.content2.databag.allchar.touchDamageAttackChance),
              )
            // 2. Touch Damage to enemy (aa2) from player (aa1)
            if (aa1.inMelee())
              this.applyDamageToActor(
                aa2_idx,
                ap2,
                Math.max(
                  0,
                  MgbActor.intFromActorParam(ap1.content2.databag.allchar.meleeDamageToNPCorItemNum) +
                    inventory.equipmentMeleeDamageBonus,
                ),
              ) // Can't be -ve damage, so use max(0, ...)
            else
              this.applyDamageToActor(
                aa2_idx,
                ap2,
                MgbActor.intFromActorParam(ap1.content2.databag.allchar.touchDamageToNPCorItemNum),
                MgbActor.intFromActorParam(ap1.content2.databag.allchar.touchDamageAttackChance),
              )
            break
          case MgbActor.alActorType_Shot:
            // Shot damage to player from shot; destroy shot
            if (aa2.actorWhoFiredShot != AA_player_idx && aa2.shotDamageToPlayer > 0) {
              // Only worry about shots from non-players and that can hurt the player
              this.applyDamageToActor(aa1_idx, ap1, aa2.shotDamageToPlayer)
              this.playStopItemSliding(aa2)
            }
            break
          case MgbActor.alActorType_Item:
          case 4:
          case 5:
          case 6:
          case 7:
            // 1. Effect of item on player (or vice versa)
            var itemUtilised = false // True if the item had some effect - so we can trigger events
            var itemConsumed = false // True if the item has been consumed and must be removed from play
            var showUseText = false // True if we should show the useText
            var activation = MgbActor.intFromActorParam(ap2.content2.databag.item.itemActivationType)
            switch (activation) { // Note that this switch only covers some of the cases, since only some are touch-based.
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
                inventory.add(new InventoryItem(actors[activeActors[hits[hidx].AA2].ACidx]))
                itemConsumed = true
                showUseText = true
                break
              case MgbActor.alItemActivationType_BlocksPlayer:
              case MgbActor.alItemActivationType_BlocksPlayerAndNPC:
                if (MgbActor.intFromActorParam(ap2.content2.databag.item.pushToSlideNum) > 0)
                  this.playPushItemToStartSliding(hits[hidx].AA1, hits[hidx].AA2)
                break
            }
            // 2. Touch Damage from player to item (if it's not a sliding item)
            if (aa1.inMelee()) {
              if (
                MgbActor.intFromActorParam(ap1.content2.databag.allchar.meleeDamageToNPCorItemNum) &&
                0 == MgbActor.intFromActorParam(ap2.content2.databag.item.pushToSlideNum)
              )
                this.applyDamageToActor(
                  aa2_idx,
                  ap2,
                  Math.max(
                    0,
                    MgbActor.intFromActorParam(ap1.content2.databag.allchar.meleeDamageToNPCorItemNum) +
                      inventory.equipmentMeleeDamageBonus,
                  ),
                ) // Can't do -ve damage...
            } else {
              if (
                MgbActor.intFromActorParam(ap1.content2.databag.allchar.touchDamageToNPCorItemNum) &&
                0 == MgbActor.intFromActorParam(ap2.content2.databag.item.pushToSlideNum)
              )
                this.applyDamageToActor(
                  aa2_idx,
                  ap2,
                  ap1.content2.databag.allchar.touchDamageToNPCorItemNum,
                  MgbActor.intFromActorParam(ap1.content2.databag.allchar.touchDamageAttackChance),
                )
            }
            // 3. Usage notification & after-effects
            if (itemConsumed) {
              // Notes:
              //  (a) NPC/Item death processing is done at end of turn, not in this loop since it would muck up the hits[] array
              //  (b) usage isn't the same as destruction.. even if an item can't be destroyed, it can be used (consumed)
              aa2.health = 0 // That's how we mark this state of transition, even for items
            }
            if (itemUtilised) {
              // TODO: content2.databag.item.visualEffectWhenUsedType
              // TODO: content2.databag.item.UseText
            }
            if (showUseText) {
              var ut = ap2.content2.databag.item.useText
              if (ut && ut.length > 0) this.setGameStatusFn(1, ut)
            }

            break
          default:
            throw new Error('Program error: Unknown actor type ' + t2)
        }
      } else {
        // Item-or-NPC/Item-or-NPC collisions
        for (let iteration = 0; iteration < 2; iteration++) {
          // We'll do this twice - once for AA1's effects on AA2, then we'll flip AA1/AA2 and do it again
          if (iteration) {
            // 2nd time through, let's swap - note that these assignments are flipped on purpose
            aa1_idx = hits[hidx].AA2 // Yes - this is right! we're flipping
            aa1 = activeActors[aa1_idx]
            ap1 = actors[activeActors[hits[hidx].AA2].ACidx]
            t1 = aa1.type // Yes - since aa1 is set for this guy now
            aa2_idx = hits[hidx].AA1
            aa2 = activeActors[aa2_idx] // Yes - this is right! we're flipping
            ap2 = actors[activeActors[hits[hidx].AA1].ACidx]

            t2 = aa2.type
          }
          switch (t1) {
            case MgbActor.alActorType_NPC:
              // 1. Touch Damage from #1 to #2
              this.applyDamageToActor(
                aa2_idx,
                ap2,
                MgbActor.intFromActorParam(ap1.content2.databag.allchar.touchDamageToNPCorItemNum),
                MgbActor.intFromActorParam(ap1.content2.databag.allchar.touchDamageAttackChance),
              )
              break
            case MgbActor.alActorType_Item:
            case 4:
            case 5:
            case 6:
            case 7:
            case MgbActor.alActorType_Shot:
              if (aa1.isSliding) {
                // Aha, a Sliding block or shot...
                if (aa1.isAShot) {
                  // Shot hits: Damage target & destroy shot
                  // we say that shot damage to items is the same as shot damage to npcs
                  if (aa1.shotDamageToNPC != 0) {
                    // if it's not destroyable, we'll let the bullet through. Walls have been handled elsewhere...
                    this.applyDamageToActor(aa2_idx, ap2, aa1.shotDamageToNPC)
                    this.playStopItemSliding(aa1)
                  }
                } else {
                  // Sliding block
                  if (
                    t2 == MgbActor.alActorType_NPC &&
                    1 == MgbActor.intFromActorParam(ap1.content2.databag.item.squishNPCYN)
                  ) {
                    aa2.health = 0
                    MgbActor.playCannedSound(
                      ap2.content2.databag.all.soundWhenHarmed,
                      ap2.content2,
                      ownerName,
                    )
                    // TODO: ap1.content2.databag.all.visualEffectWhenHarmedType
                  } else {
                    aa1.x = aa1.fromx
                    aa1.y = aa1.fromy
                    this.playStopItemSliding(aa1)
                    if (
                      t2 == MgbActor.alActorType_NPC &&
                      0 == MgbActor.intFromActorParam(ap1.content2.databag.item.squishNPCYN) &&
                      aa2.x == aa1.x &&
                      aa2.y == aa1.y
                    ) {
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
  },
}

export default MagePlayGameCollision
