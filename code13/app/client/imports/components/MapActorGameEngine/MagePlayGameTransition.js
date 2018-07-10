import MgbSystem from './MageMgbSystem'

// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on transitioning between maps

const MagePlayGameTransition = {
  /**
   * transitionToNewMap()
   *
   * @param {String} userName
   * @param {String} projectName
   * @param {String} newmapname
   * @param {int} newX
   * @param {int} newY
   *
   * @memberOf MagePlayGame
   */
  transitionToNewMap(userName, projectName, newMapName, newX, newY) {
    this.transitionPlayerAA = this.activeActors[this.AA_player_idx]
    this.playCleanupActiveLayer()
    this.playCleanupBackgroundLayer()

    this.transitionToNextMapFn(newMapName)

    this.transitionNewX = newX
    this.transitionNewY = newY
    this.transitionStateWaitingForActorLoadRequests = true
    this.isTransitionInProgress = true
  },

  resetTransitionState() {
    this.isTransitionInProgress = false
    this.transitionNewX = 0
    this.transitionNewY = 0
    this.transitionPlayerAA = null
    this.transitionStateWaitingForActorLoadRequests = false
  },

  transitionResourcesHaveLoaded(newMapData) {
    this.map = newMapData
    this.map.name =
      newMapData.name.indexOf(':') === -1 ? this.ownerName + ':' + newMapData.name : newMapData.name
    this.transitionStateWaitingForActorLoadRequests = false
    // Note we do NOT set this.isTransitionInProgress = false  -- that is done in TranitionTick()
  },

  /*
  // When debugging, the function gets called but does not run
  // Called on 'Tick' by game loop if transitioning to new map (isTransitionInProgress == true)
  transitionTick()
  {
    if (this.transitionStateWaitingForActorLoadRequests)
    {
      //trace("transitionTick: "+actorLoadsPending+" actor loads still Pending")
      // TODO: Fadeout... if (view.alpha > 0.1)     view.alpha -= 0.1
    }
    else
    {
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
      this.playPrepareActiveLayer(this.map, true)   // Was set by transitionResourcesHaveLoaded()
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

      this.container = document.getElementById("mgb-game-container")
      this.scrollMapToSeePlayer()

      this.clearTicTable()
      // G_tweenCount = 0
      this.isTransitionInProgress = false
      this.clearPlayerKeys()
    }
  }
  */
}

export default MagePlayGameTransition
