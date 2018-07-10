// This is used to represent the state of an actor on the Active Layer of the map.

export default class ActiveActor {
  constructor() {
    this.creationCause = '' // CREATION_BY_MAP or CREATION_BY_SPAWN
    this.ACidx = '' // Index of this actor in the actorCache cache - the index is the name
    this.health = 0 // Current health
    this.maxHealth = 0 // Current Maximum health
    this.renderX = 0 // Render this at pixel X (not tile X)
    this.renderY = 0 // Render this at pixel Y (not tile Y)
    this._image = null // This should be of type Image
    this.cellSpanX = 0 // How many cells does this actor span (width)?
    this.cellSpanY = 0 // How many cells does this actor span (height)?

    // Some caches of key actor properties - so we don't have to go into the content2 so often (for speed)
    this.type = 0 // One of MgbActor.alActorType
    this.moveSpeed = 0 // From content2.databag.allchar.movementSpeedNum. However, also defined as 1 for a sliding block while isSliding = true

    // Basic positioning info
    this.startx = 0 // Where this piece starts from.   Units are in tiles, not pixels
    this.starty = 0 // Where this piece starts from.   Units are in tiles, not pixels
    this.x = 0 // Where the actor was.        Units are in tiles, not pixels
    this.y = 0 // Where the actor was.        Units are in tiles, not pixels
    this.xMovePerTween = 0
    this.yMovePerTween = 0
    this.fromx = 0 // Where the actor is moving to
    this.fromy = 0 // Where the actor is moving to
    this.renderOffsetCellsX = 0 // Temporary Position/size adjustments (Melee for example uses this)
    this.renderOffsetCellsY = 0 // Temporary Position/size adjustments (Melee for example uses this)
    this.renderOffsetCellsWidth = 0 // Temporary Position/size adjustments (Melee for example uses this)
    this.renderOffsetCellsHeight = 0 // Temporary position/size adjustments (Melee for example uses this)

    // Melee state
    this.meleeStep = 0 // -1 for not in melee; 0..7 for in-melee
    this.turnsBeforeMeleeReady = 0 // 0 for 'ready now'. Decremented after every non-melee turn for this actor

    //conditions info
    this.appearIf = 0

    // Auto-move info
    this.stepStyle = 2 // Movement style. 0..3 = N, S, E, W; Default: Face South
    this.stepCount = 0 // Counter - # of steps taken using this movement style. 0 means no steps taken; need to choose
    this.isSliding = false // Used for items that are sliding - this includes sliding blocks and shots
    this.wasStopped = false // Used for handling ice

    // Respawn tracking
    this.respawnId = '' // A string used to identify this actor instance across map reloads - for example using a string based on {map}/original_x/original_y
    this.birthTweenCount = 0 // The G_tweenCount when the item was spawned

    // Shot tracking - shots
    this.isAShot = false // Only true for Shots
    this.actorWhoFiredShot = 0 // Which actor fired this shot (metric valid for shots)
    this.shotRange = 0 // metric valid for Shots - comes from shooter's "content2.databag.allchar.shotRangeNum"

    // Shot tracking - shooters
    this.maxActiveShots = 0 // Maximum number of shots that can be active on map at once (metric valid for things that shoot)
    this.currentActiveShots = 0 // Current number of Active shots on map (metric valid for things that shoot)
    this.shotDamageToNPC = 0
    this.shotDamageToPlayer = 0

    // Dead or dying (explosions etc)
    this.alive = true // true if alive; false if dead or dying
    this.dyingAnimationFrameCount = 0 // 0 mean no animation of dying; >0 means at frame N of that 'dying' animation

    // Active powers
    this.activePowerUntilGetTime = 0 // 0 means no active power
    this.activePower = 0 // One of the MgbActor.alGainPower powers.

    // Player-related info (this could be kept out of the class, but I've kept it here for simplicity and consistency, and it helps if we later support multi-user)
    this.score = 0
    this.extraLives = 0 // in addition to the one currently in use
    this.winLevel = false // True when user reaches some special goal/marker etc
  }

  inMelee() {
    return this.meleeStep !== undefined && this.meleeStep != ActiveActor.MELEESTEP_NOT_IN_MELEE
  }
}

// static consts
ActiveActor.CREATION_BY_SPAWN = 'spawned'
ActiveActor.CREATION_BY_MAP = 'mapped'
ActiveActor.MELEESTEP_NOT_IN_MELEE = -1
