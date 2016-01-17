
const toolPen = {
  name: "Pen",
  icon: "pencil icon",        // Semantic-UI icon CSS class
  editCursor: "crosshair",
  supportsDrag: true,
  shortcutKey: 'p',

  handleMouseDown: ( drawEnv ) => {
    // drawEnv is in the format generated by EditGraphic.collateDrawingToolEnv()
    drawEnv.setPixelsAt(drawEnv.x, drawEnv.y)
  },

  handleMouseMove: ( drawEnv ) => { toolPen.handleMouseDown(drawEnv) },

  handleMouseUp: ( drawEnv ) => {},

  handleMouseLeave: ( drawEnv ) => {}

};

export default toolPen
