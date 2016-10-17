

export default class ActiveActor
{
	creationCause = ''				// CREATION_BY_MAP or CREATION_BY_SPAWN 
	ACidx = ''								// Index of this actor in the actorCache cache - the index is the name
	health = 0								// Current health
	maxHealth = 0							// Current Maximum health
	renderX = 0								// Render this at pixel X (not tile X)
	renderY = 0								// Render this at pixel Y (not tile Y)
	_image = null							// This should be of type Image
	cellSpanX = 0							// How many cells does this actor span (width)?
	cellSpanY = 0							// How many cells does this actor span (height)?
	
	// Some caches of key actor properties - so we don't have to go into the content2 so often (for speed)
	type = 0									// One of MgbActor.alActorType 
	moveSpeed = 0							// From content2.databag.allchar.movementSpeedNum. However, also defined as 1 for a sliding block while isSliding = true

	// Basic positioning info		
	startx = 0			// Where this piece starts from. 	Units are in tiles, not pixels
  starty = 0			// Where this piece starts from. 	Units are in tiles, not pixels
	x = 0				    // Where the actor was.				Units are in tiles, not pixels
  y = 0				    // Where the actor was.				Units are in tiles, not pixels
	xMovePerTween = 0
  yMovePerTween = 0
	fromx = 0			// Where the actor is moving to
  fromy = 0			// Where the actor is moving to
	renderOffsetCellsX = 0				   	// Temporary Position/size adjustments (Melee for example uses this)
	renderOffsetCellsY = 0					  // Temporary Position/size adjustments (Melee for example uses this)
	renderOffsetCellsWidth = 0			 	// Temporary Position/size adjustments (Melee for example uses this)
	renderOffsetCellsHeight = 0				// Temporary position/size adjustments (Melee for example uses this)
	
	// Melee state
	meleeStep = 0							        // -1 for not in melee; 0..7 for in-melee
	turnsBeforeMeleeReady = 0				  // 0 for 'ready now'. Decremented after every non-melee turn for this actor 
	
	//conditions info
	appearIf = 0
	// Auto-move info
	stepStyle = 0							    // Movement style. 0..3 = N, S, E, W
	stepCount = 0							    // Counter - # of steps taken using this movement style. 0 means no steps taken; need to choose
	isSliding = false						  // Used for items that are sliding - this includes sliding blocks and shots
	wasStopped = false						// Used for handling ice
	
	// Respawn tracking
	respawnId = ''							  // A string used to identify this actor instance across map reloads - for example using a string based on {map}/original_x/original_y
	birthTweenCount = 0						// The G_tweenCount when the item was spawned
	
	// Shot tracking - shots
	isAShot = false							  // Only true for Shots
	actorWhoFiredShot = 0					// Which actor fired this shot (metric valid for shots)
	shotRange = 0							    // metric valid for Shots - comes from shooter's "content2.databag.allchar.shotRangeNum"

	// Shot tracking - shooters
	maxActiveShots = 0						// Maximum number of shots that can be active on map at once (metric valid for things that shoot)
	currentActiveShots = 0			  // Current number of Active shots on map (metric valid for things that shoot)
	shotDamageToNPC = 0
	shotDamageToPlayer = 0

	// Dead or dying (explosions etc)
	alive = true							    // true if alive; false if dead or dying
	dyingAnimationFrameCount = 0	// 0 mean no animation of dying; >0 means at frame N of that 'dying' animation
	
	// Active powers
	activePowerUntilGetTime = 0		// 0 means no active power
	activePower = 0							  // One of the MgbActor.alGainPower powers. 

	// Player-related info (this could be kept out of the class, but I've kept it here for simplicity and consistency, and it helps if we later support multi-user)
	score = 0
	extraLives = 0							  // in addition to the one currently in use
	winLevel = false							// True when user reaches some special goal/marker etc
	
	inMelee()
	{
		return this.meleeStep !== undefined && this.meleeStep != ActiveActor.MELEESTEP_NOT_IN_MELEE
	}
}

// static consts
ActiveActor.CREATION_BY_SPAWN = "spawned"
ActiveActor.CREATION_BY_MAP = "mapped"
ActiveActor.MELEESTEP_NOT_IN_MELEE = -1
