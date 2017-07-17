import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'

// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on the NPC (Non Player Character) behaviors

const MagePlayGameNpc = {
  askDeferredNpcQuestion() {
    if (this.deferredAsk_aa != null && this.deferredAsk_ap != null) {
      this.askNpcQuestion(this.deferredAsk_aa, this.deferredAsk_ap)
      this.deferredAsk_aa = null
      this.deferredAsk_ap = null
    }
  },

  /**
   *
   *
   * @param {ActiveActor} aa
   * @param {MgbActor} ap
   * @param {Boolean} [deferredAsk=false]
   */
  askNpcQuestion(aa, ap, deferredAsk = false) {
    if (deferredAsk) {
      this.deferredAsk_aa = aa
      this.deferredAsk_ap = ap
    } else {
      var msg = ap.content2.databag.npc.talkText
      var fnt = 0 //MgbSystem.gameFonts[MgbActor.intFromActorParam(ap.content2.databag.npc.talkTextFontIndex)]
      let choicesArray = []
      const npc = ap.content2.databag.npc
      choicesArray.push(npc.responseChoice1)
      choicesArray.push(npc.responseChoice2)
      choicesArray.push(npc.responseChoice3)

      if (msg && msg.length > 0)
        this.showNpcMessage({ leftActor: ap, message: msg, font: fnt, choicesArray }, aa)
    }
  },

  showNpcMessage(params, actor = null) {
    this.npcDialogActor = actor // The one who is being interacted with

    params.activeActor = actor
    params.responseCallbackFn = choice => this.handleNpcResponse(choice)
    this.showNpcMessageFn(params)
    this.doPauseGame()
  },

  hideNpcMessage() {
    if (this.isPaused) {
      this.G_gameUnpausedAtMS = new Date().getTime()
      this.G_pausedTime += Math.floor(this.G_gameUnpausedAtMS - this.G_gamePausedAtMS) / 1000 // Paused time to subtract from game time
      this.npcDialogActor = null
      this.showNpcMessageFn(null)
      this.isPaused = false
    }
  },

  handleNpcResponse(choice) {
    const { actors, inventory, npcDialogActor } = this
    var drop = null
    var say = null
    var stayYN = 1
    var take = null
    var takeType = 0
    var takeCount = 0
    var dropPersistsYN = 0
    var repeatQuestion = false

    var ap // MgbActor
    if (npcDialogActor != null && npcDialogActor.ACidx != null) ap = actors[npcDialogActor.ACidx]

    switch (choice) {
      case 0:
        // do nothing 00 == cancel
        break
      case 1:
        drop = MgbActor.stringFromActorParam(ap.content2.databag.npc.dropsObjectOnChoice1)
        stayYN = MgbActor.intFromActorParam(ap.content2.databag.npc.responseChoice1StayYN)
        dropPersistsYN = MgbActor.intFromActorParam(ap.content2.databag.npc.responseChoice1DropPersistsYN)
        say = MgbActor.stringFromActorParam(ap.content2.databag.npc.saysWhatOnChoice1)
        take = MgbActor.stringFromActorParam(ap.content2.databag.npc.takesObjectOnChoice1)
        takeType = MgbActor.intFromActorParam(ap.content2.databag.npc.takeObjectTypeOnChoice1)
        takeCount = MgbActor.intFromActorParam(ap.content2.databag.npc.takesObjectCountOnChoice1Num)
        break
      case 2:
        drop = MgbActor.stringFromActorParam(ap.content2.databag.npc.dropsObjectOnChoice2)
        stayYN = MgbActor.intFromActorParam(ap.content2.databag.npc.responseChoice2StayYN)
        dropPersistsYN = MgbActor.intFromActorParam(ap.content2.databag.npc.responseChoice2DropPersistsYN)
        say = MgbActor.stringFromActorParam(ap.content2.databag.npc.saysWhatOnChoice2)
        take = MgbActor.stringFromActorParam(ap.content2.databag.npc.takesObjectOnChoice2)
        takeType = MgbActor.intFromActorParam(ap.content2.databag.npc.takeObjectTypeOnChoice2)
        takeCount = MgbActor.intFromActorParam(ap.content2.databag.npc.takesObjectCountOnChoice2Num)
        break
      case 3:
        drop = MgbActor.stringFromActorParam(ap.content2.databag.npc.dropsObjectOnChoice3)
        stayYN = MgbActor.intFromActorParam(ap.content2.databag.npc.responseChoice3StayYN)
        dropPersistsYN = MgbActor.intFromActorParam(ap.content2.databag.npc.responseChoice3DropPersistsYN)
        say = MgbActor.stringFromActorParam(ap.content2.databag.npc.saysWhatOnChoice3)
        take = MgbActor.stringFromActorParam(ap.content2.databag.npc.takesObjectOnChoice3)
        takeType = MgbActor.intFromActorParam(ap.content2.databag.npc.takeObjectTypeOnChoice3)
        takeCount = MgbActor.intFromActorParam(ap.content2.databag.npc.takesObjectCountOnChoice3Num)
        break
    }

    if (take && take == '') take = null // just normalizing "" to null
    if (take) {
      if (takeCount <= 0) takeCount = 1 // <1 isn't valid, minimum is 1

      var item = inventory.get(take)
      var itemName = take.split(':').pop()
      if (!item || item.count < takeCount) {
        if (takeCount === 1) say = `You don't have the ${itemName} to give me.`
        else say = `You don't have enough ${itemName} to give me. I want ${takeCount}.`
        drop = null
        stayYN = 1
      } else {
        switch (takeType) {
          case MgbActor.alNpcTakeType_Take:
            if (false == inventory.removeByName(take, takeCount)) {
              say = "You don't have the " + itemName + ' to give me...'
              drop = null
              stayYN = 1
            }
            break
          case MgbActor.alNpcTakeType_Require:
            if (null == inventory.get(take)) {
              say = "You don't have the " + itemName + ' with you...'
              drop = null
              stayYN = 1
            }
            break
        }
      }
    }

    switch (stayYN) {
      case MgbActor.alNpcDialogFinalAction_disappear:
        npcDialogActor.health = 0
        break
      case MgbActor.alNpcDialogFinalAction_stay:
        // do nothing
        break
      case MgbActor.alNpcDialogFinalAction_repeat:
        repeatQuestion = true
        break
    }

    if (drop && drop !== '') {
      this.playSpawnNewActor(
        drop,
        npcDialogActor.x,
        npcDialogActor.y + (npcDialogActor.health == 0 ? 0 : npcDialogActor.cellSpanY), //drop below if actor stays
        true,
        dropPersistsYN ? true : false,
      )
    }

    if (say) {
      let fnt = MgbSystem.gameFonts[MgbActor.intFromActorParam(ap.content2.databag.npc.talkTextFontIndex)]
      this.showNpcMessage({ message: say, leftActor: ap, font: fnt }, npcDialogActor)
      if (repeatQuestion) this.askNpcQuestion(npcDialogActor, ap, true) // final "true" asks to queue this up
    } else {
      if (repeatQuestion) this.askNpcQuestion(npcDialogActor, ap)
      else this.hideNpcMessage()
    }
  },
}

export default MagePlayGameNpc
