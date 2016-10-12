
import MgbActor from './MageMgbActor'


export default MagePlayGameItem = {
  useItemOnPlayer(itemAA)
  {
    const { actors, activeActors } = this
    var itemAP = actors[activeActors[itemAA].ACidx]
    this.useItemActorOnPlayer(itemAP)
  },

  useItemActorOnPlayer(itemAP)  	// This just handles the effects on the player, not the resulting effects (visuals, messages, destruction etc) on the item
  {
    const { actors, activeActors, AA_player_idx, G_tweenSinceMapStarted } = this
    var increasesMaxHealth = parseInt(itemAP.content2.databag.item.increasesMaxHealthNum)
    if (increasesMaxHealth && activeActors[AA_player_idx].maxHealth != 0)
    {
      activeActors[AA_player_idx].maxHealth += increasesMaxHealth
      var ap = actors[activeActors[AA_player_idx].ACidx]
      MgbActor.playCannedSound(increasesMaxHealth > 0 ? ap.content2.databag.all.soundWhenHealed : ap.content2.databag.all.soundWhenHarmed )  
      // TODO: Player's content2.databag.all.visualEffectWhenHarmedType / content2.databag.all.visualEffectWhenHealedType
    }
    
    var heal = parseInt(itemAP.content2.databag.item.healOrHarmWhenUsedNum)
    if (heal)
    {
      activeActors[AA_player_idx].health += heal
      ap = actors[activeActors[AA_player_idx].ACidx]
      MgbActor.playCannedSound(heal > 0 ? ap.content2.databag.all.soundWhenHealed : ap.content2.databag.all.soundWhenHarmed)								// TODO: ap1.content2.databag.all.visualEffectWhenHarmedType  
      // TODO: Player's content2.databag.all.visualEffectWhenHarmedType / content2.databag.all.visualEffectWhenHealedType
    }
    if (1 == parseInt(itemAP.content2.databag.item.gainExtraLifeYN))
    {
      activeActors[AA_player_idx].extraLives++
      // TODO: content2.databag.all.visualEffectWhenHealedType
    }
    var points = parseInt(itemAP.content2.databag.item.gainOrLosePointsNum)
    if (points)
    {
      activeActors[AA_player_idx].score += points
    }
    if (1 == parseInt(itemAP.content2.databag.item.winLevelYN))
    {
      activeActors[AA_player_idx].winLevel = true
    }
    var power = parseInt(itemAP.content2.databag.item.gainPowerType)
    if (power)
    {
      // Note, this just replaces any previous power; there is no accumulation of concurrent powers...
      activeActors[AA_player_idx].activePower = power
      var powersecs = parseInt(itemAP.content2.databag.item.gainPowerSecondsNum)
debugger  // need to change how power timer works
      if (0 == powersecs)
        activeActors[AA_player_idx].activePowerUntilTweenCount = int.MAX_VALUE
      else
        activeActors[AA_player_idx].activePowerUntilTweenCount = G_tweenSinceMapStarted + (stage.frameRate * powersecs)
    }
  }

}