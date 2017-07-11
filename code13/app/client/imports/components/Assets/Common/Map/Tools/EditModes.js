// keep as strings for easier debugging
const EditModes = {
  // add something to map
  view: 'view',
  stamp: 'stamp',
  terrain: 'terrain',
  fill: 'fill',
  eraser: 'eraser',
  // select something from map
  // also threated as edit modes - selecting and adding at the same time would be bugous ;)
  rectangle: 'rectangle',
  wand: 'wand',
  picker: 'picker',

  // object tools
  drawRectangle: 'drawRectangle',
  drawEllipse: 'drawEllipse',
  drawShape: 'drawShape',
}
export default EditModes
