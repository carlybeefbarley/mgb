import _ from 'lodash'
import MgbActor from './MageMgbActor'

// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on user input

const _actions = 'up,down,left,right,shift,push,melee,shoot,jump,inventory,npcmessage'.split(',')

const MagePlayGameInput = {
  clearPlayerKeys() {
    _.each(_actions, a => {
      this.G_player_action[a] = false
    })
  },

  enablePlayerControls(element) {
    this.G_player_action = {}
    this.clearPlayerKeys()
    this.disablePlayerControls() // Just in case enablePlayerControls() is being called twice
    this._boundKeyHandler = this.playHandleKeyEvents.bind(this)
    element.addEventListener('keydown', this._boundKeyHandler)
    element.addEventListener('keyup', this._boundKeyHandler)
    this._eventsAttachedToElement = element
  },

  disablePlayerControls() {
    if (this._eventsAttachedToElement) {
      this._eventsAttachedToElement.removeEventListener('keydown', this._boundKeyHandler)
      this._eventsAttachedToElement.removeEventListener('keyup', this._boundKeyHandler)
      this._boundKeyHandler = null
      this._eventsAttachedToElement = null
    }
  },

  playHandleKeyEvents(
    k, // k is a keyboard event
  ) {
    // don't steal events from input fields
    if (_.includes(['INPUT', 'SELECT', 'TEXTAREA'], k.target.tagName)) return

    k.preventDefault()
    const {
      actors,
      activeActors,
      inventory,
      AA_player_idx,
      isPaused,
      G_gameOver,
      isTransitionInProgress,
    } = this
    if (!G_gameOver && !isTransitionInProgress) {
      var newstate = k.type === 'keydown'
      var pp = actors[activeActors[AA_player_idx].ACidx]

      switch (k.key) {
        case 'Backspace':
        case 'Delete':
        case 'i':
          if (newstate) this.toggleInventory()
          break
        case 'ArrowLeft':
        case 'a':
          if (MgbActor.intFromActorParam(pp.content2.databag.allchar.leftYN))
            this.G_player_action.left = newstate
          break
        case 'ArrowRight':
        case 'd':
          if (MgbActor.intFromActorParam(pp.content2.databag.allchar.rightYN))
            this.G_player_action.right = newstate
          break
        case 'ArrowUp':
        case 'w':
          if (MgbActor.intFromActorParam(pp.content2.databag.allchar.upYN)) this.G_player_action.up = newstate
          break
        case 'ArrowDown':
        case 's':
          if (MgbActor.intFromActorParam(pp.content2.databag.allchar.downYN))
            this.G_player_action.down = newstate
          break
        case ' ':
          if (MgbActor.intFromActorParam(pp.content2.databag.allchar.pushYN))
            this.G_player_action.push = newstate
          break
        case 'm': // Melee
        case 'End':
          if (
            inventory.equipEffects.newActorGraphics ||
            _.some(pp.content2.animationTable, anim => {
              return anim.action.startsWith('melee') && anim.tileName !== ''
            })
          )
            this.G_player_action.melee = newstate
          break
        case 'Control':
          if (
            isPaused &&
            newstate // unpause
          )
            this.hideNpcMessage()
          else if (
            !isPaused &&
            newstate // "key down" event
          )
            this.doPauseGame()
          break
        case 'Enter':
          if (
            MgbActor.intFromActorParam(pp.content2.databag.allchar.shotRateNum) ||
            inventory.equipEffects.shotRateBonus
          )
            this.G_player_action.shoot = newstate
          break
      }
    }
  },
}

export default MagePlayGameInput
