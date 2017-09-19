import options from './ActorOptions.js'

const validator = {
  hasConditionalBehavior(databag) {
    return databag.itemOrNPC.appearIf && databag.itemOrNPC.appearIf != options.appearIf['No condition']
  },
  hasKey(databag) {
    return (
      !!databag.item.keyForThisDoor &&
      (databag.item.itemActivationType == options.itemActivationType['Blocks Player'] ||
        databag.item.itemActivationType == options.itemActivationType['Blocks Player + NPC']) &&
      databag.item.pushToSlideNum == 0
    )
  },
  isValidForBG(databag) {
    if (!databag) {
      return false
    }
    const hasConditionalBehavior = validator.hasConditionalBehavior(databag)
    const hasKey = validator.hasKey(databag)

    return (
      [
        options.actorType['Item, Wall, or Scenery'],
        options.actorType['Solid Object'],
        options.actorType['Floor'],
        options.actorType['Scenery'],
      ].indexOf(databag.all.actorType) > -1 &&
      !hasConditionalBehavior &&
      [
        options.itemActivationType['Inactive'],
        options.itemActivationType['Pushes actors in a direction'],
        options.itemActivationType['Floor that causes damage'],
        options.itemActivationType['Blocks NPC'],
        options.itemActivationType['Blocks Player'],
        options.itemActivationType['Blocks Player + NPC'],
      ].indexOf(databag.item.itemActivationType) > -1 &&
      hasKey === false &&
      databag.item.pushToSlideNum == 0
    )
  },
  isValidForActive(databag) {
    if (!databag) {
      return false
    }
    return (
      (databag.all.actorType != options.actorType['Shot'] &&
        databag.all.actorType == options.actorType['Player']) ||
      databag.all.actorType == options.actorType['Non-Player Character (NPC)'] ||
      validator.hasConditionalBehavior(databag) ||
      validator.hasKey(databag) ||
      ([
        options.actorType['Item, Wall, or Scenery'],
        options.actorType['Solid Object'],
        options.actorType['Item'],
      ].indexOf(databag.all.actorType) > -1 &&
        databag.item.itemActivationType != options.itemActivationType['Floor that causes damage'] &&
        databag.item.itemActivationType != options.itemActivationType['Pushes actors in a direction'] &&
        !(
          (databag.item.itemActivationType == options.itemActivationType['Blocks NPC'] ||
            databag.item.itemActivationType == options.itemActivationType['Blocks Player'] ||
            databag.item.itemActivationType == options.itemActivationType['Blocks Player + NPC']) &&
          databag.item.pushToSlideNum == 0
        ) &&
        databag.item.itemActivationType != options.itemActivationType['Inactive'])
    )
  },
  isValidForFG(databag) {
    if (!databag) {
      return false
    }
    const hasConditionalBehavior = validator.hasConditionalBehavior(databag)

    return (
      (databag.all.actorType == options.actorType['Item, Wall, or Scenery'] ||
        databag.all.actorType == options.actorType['Scenery']) &&
      databag.all.actorType !== options.actorType['Floor'] && // To prioritize use of Scenery in FG
      databag.item.itemActivationType == options.itemActivationType['Inactive'] &&
      !hasConditionalBehavior
    )
  },
}

export default validator
