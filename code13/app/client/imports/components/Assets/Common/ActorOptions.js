const ActorOptions = {
  itemActivationType: {
    Inactive: '0',
    'Blocks Player': '1',
    'Blocks NPC': '2',
    'Blocks Player + NPC': '3',
    'Player Picks up, uses later': '4',
    'Player Picks up, uses immediately': '5',
    'Player uses, but leaves the item': '6',
    'Player shoots item to use it': '7', // Unused but left for backwards compatibility
    'Pushes actors in a direction': '8',
    'Floor that causes damage': '9',
  },

  // This ordering is to match the templates when creating new actors
  // Actor types 4, 5, 6, 7 will be part of 2 for MAGE. Distinction is primarily for Actor editor
  actorType: {
    Scenery: '4',
    Player: '0',
    'Non-Player Character (NPC)': '1',
    'Item, Wall, or Scenery': '2', // Keep this one for backwards-compatibility with older actors
    'Solid Object': '6',
    Floor: '7',
    Item: '5',
    Shot: '3',
  },

  appearIf: {
    'No condition': '0',
    Disappear: '1',
    Appear: '2',
  },
}

export default ActorOptions
