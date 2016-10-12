import _ from 'lodash'


const _actions = 'up,down,left,right,shift,push,melee,shoot,jump,inventory,npcmessage'.split(',')


THIS NEEDS PROPER FACTORING INTO MagePlayGameClass

export class MagePlayerInput {

  constructor()
  {
    this.playerActioned = {}
    this.clearPlayerKeys()
  }

  clearPlayerKeys()
  {
    _.each(_actions, a => { this.playerActioned = false })
  }

  enablePlayerControls(element)
  {
    this.clearPlayerKeys()
    element.addEventListener(KeyboardEvent.KEY_DOWN, this.playHandleKeyEvents)
    element.addEventListener(KeyboardEvent.KEY_UP, this.playHandleKeyEvents)
    this._eventsAttachedToElement = element
  }
    
  disablePlayerControls()
  {
    this._eventsAttachedToElement.removeEventListener(KeyboardEvent.KEY_DOWN, this.playHandleKeyEvents)
    this._eventsAttachedToElement.removeEventListener(KeyboardEvent.KEY_UP, this.playHandleKeyEvents)
  }
  
  playHandleKeyEvents(k)    // k is a keyboard event
  {
    if (!G_gameOver && !transitionInProgress)
    {
      var newstate = (k.type == KeyboardEvent.KEY_DOWN) ? true : false
debugger
      var pp = this.actors[activeActors[AA_player_idx].ACidx]
      switch (k.keyCode)
      {
        case Keyboard.DELETE:
          if (newstate)
            toggleInventory();
          break;
        case Keyboard.LEFT:
          if (pp.content2.databag.allchar.leftYN)
            G_player_action_left = newstate
          break
        case Keyboard.RIGHT:
          if (pp.content2.databag.allchar.rightYN)
            G_player_action_right = newstate
          break
        case Keyboard.UP:
          if (pp.content2.databag.allchar.upYN)
            G_player_action_up = newstate
          break
        case Keyboard.DOWN:
          if (pp.content2.databag.allchar.downYN)
            G_player_action_down = newstate
          break
        case Keyboard.SPACE:
          if (pp.content2.databag.allchar.pushYN)
            G_player_action_push = newstate
          break
        case Keyboard.END:		// Melee
        case 77:	//Keyboard.M:		// Melee
//		    			if (pp.content2.databag.allchar.meleeYN)
            G_player_action_melee = newstate
          break
        case Keyboard.CONTROL:
          if (pauseGame && newstate)
            hideNpcMessage()				// unpause
          else if (!pauseGame && newstate)	// "key down" event
            doPauseGame()
          break
        case Keyboard.ENTER:
          if (pp.content2.databag.allchar.shotRateNum)
            G_player_action_shoot = newstate
          break		    		
      }
    }
  }


}