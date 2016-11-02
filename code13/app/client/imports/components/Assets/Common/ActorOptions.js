
// TODO: Make these in MageMgbActor.js
export default {
  itemActivationType: {
    "Inactive": "0",
    "Blocks Player": "1",
    "Blocks NPC": "2",
    "Blocks Player + NPC": "3",
    "Player Picks up, uses later": "4",
    "Player Picks up, uses immediately": "5",
    "Player uses, but leaves the item": "6",
    "Player shoots item to use it": "7",
    "Pushes actors in a direction": "8",
    "Floor that causes damage": "9"
  },

  actorType: {
    'Player': "0",
    'Non-Player Character (NPC)': "1",
    'Item, Wall or Scenery': "2",
    'Shot': "3"
  },
  
  appearIf: {
    "No condition": "0",
    "Disappear": "1",
    "Appear": "2"
  }
}
