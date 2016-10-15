import _ from 'lodash'
import MgbActor from './MageMgbActor'

const _actions = 'up,down,left,right,shift,push,melee,shoot,jump,inventory,npcmessage'.split(',')

export default MagePlayGameInput = {

  clearPlayerKeys()
  {
    _.each(_actions, a => { this.G_player_action[a] = false })
  },

  enablePlayerControls(element)
  {
    this.G_player_action = {}
    this.clearPlayerKeys()
    this._boundKeyHandler = this.playHandleKeyEvents.bind(this)
    element.addEventListener('keydown', this._boundKeyHandler)
    element.addEventListener('keyup', this._boundKeyHandler)
    this._eventsAttachedToElement = element
  },

  disablePlayerControls()
  {
    this._eventsAttachedToElement.removeEventListener('keydown', this._boundKeyHandler)
    this._eventsAttachedToElement.removeEventListener('keyup', this._boundKeyHandler)
    this._boundKeyHandler = null
    this._eventsAttachedToElement = null
  },
  
  playHandleKeyEvents(k)    // k is a keyboard event
  {
    const { actors, activeActors, AA_player_idx, isGamePaused, G_gameOver, isTransitionInProgress } = this
    if (!G_gameOver && !isTransitionInProgress)
    {
      var newstate = (k.type === 'keydown')
      var pp = actors[activeActors[AA_player_idx].ACidx]
      switch (k.key)
      {
      case 'Backspace':
      case 'Delete':
        if (newstate)
          this.toggleInventory()
        break
      case 'ArrowLeft':
        if (MgbActor.intFromActorParam(pp.content2.databag.allchar.leftYN))
          this.G_player_action.left = newstate
        break
      case 'ArrowRight':
        if (MgbActor.intFromActorParam(pp.content2.databag.allchar.rightYN))
          this.G_player_action.right = newstate
        break
      case 'ArrowUp':
        if (MgbActor.intFromActorParam(pp.content2.databag.allchar.upYN))
          this.G_player_action.up = newstate
        break
      case 'ArrowDown':
        if (MgbActor.intFromActorParam(pp.content2.databag.allchar.downYN))
          this.G_player_action.down = newstate
        break
      case ' ':
        if (MgbActor.intFromActorParam(pp.content2.databag.allchar.pushYN))
          this.G_player_action.push = newstate
        break
      case 'm':		// Melee
      case 'End':	
        if (MgbActor.intFromActorParam(pp.content2.databag.allchar.meleeYN))
          this.G_player_action.melee = newstate
        break
      case 'Control':
        if (isGamePaused && newstate)
          this.hideNpcMessage()				// unpause
        else if (!isGamePaused && newstate)	// "key down" event
          this.doPauseGame()
        break
      case 'Enter':
        if (MgbActor.intFromActorParam(pp.content2.databag.allchar.shotRateNum))
          this.G_player_action.shoot = newstate
        break		    		
      }
    }
  }

}