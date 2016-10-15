
import MgbSystem from './MageMgbSystem'
import MgbActor from './MageMgbActor'


export default MagePlayGameNpc = {

  askDeferredNpcQuestion()
  {
    if (this.deferredAsk_aa != null && this.deferredAsk_ap != null)
    {
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
  askNpcQuestion(aa, ap, deferredAsk = false)
  {
    if (deferredAsk)
    {
      this.deferredAsk_aa = aa
      this.deferredAsk_ap = ap
    }
    else
    {
      console.log("TODO: NPC MESSAGE ", msg, '--', c1, c2, c3)
      debugger
      var msg = ap.content2.databag.npc.talkText
//      var fnt = MgbSystem.gameFonts[MgbActor.intFromActorParam(ap.content2.databag.npc.talkTextFontIndex)]
      var c1 = ap.content2.databag.npc.responseChoice1
      var c2 = ap.content2.databag.npc.responseChoice2
      var c3 = ap.content2.databag.npc.responseChoice3
      // if (msg && msg.length > 0)
      //   this.showNpcMessage({leftActor:ap, message:msg, font:fnt, choice1:c1, choice2:c2, choice3:c3}, aa)
    }
  }

}