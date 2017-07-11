// Constants related to the Map aspects of the MGB MapActor Game Engine

const MgbMap = {
  layerBackground: 0, // Things that the player and bad guys pass in front of visually. This is relatively static
  layerActive: 1, // The normal layer for player actors, enemy actors and items. This is typically very dynamic
  layerForeground: 2, // Things that render in front of the 'active' items - for example a building that players can go behind
  layerEvents: 3, // Things that render in front of the 'active' items - for example a building that players can go behind

  layerNames: ['Background', 'Active', 'Foreground', 'Event'],

  mapMaxHeight: 200,
  mapMaxWidth: 200,
}

export default MgbMap
