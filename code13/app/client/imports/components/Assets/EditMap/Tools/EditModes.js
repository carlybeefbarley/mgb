// keep as strings for easier debugging
const EditModes = {
  // add something to map
  stamp: "stamp",
  terrain: "terrain",
  fill: "fill",
  eraser: "eraser",
  // select something from map
  // also threated as edit modes - selecting and adding at the same time will be bogous ;)
  rectangle: "rectangle",
  wand: "wand",
  picker: "picker",

  // object tools
  drawRectangle: "drawRectangle",
  drawEllipse: "drawEllipse",
  drawShape: "drawShape"
};
export default EditModes;
