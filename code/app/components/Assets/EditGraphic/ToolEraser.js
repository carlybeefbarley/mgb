
const toolEraser = {
  name: "Eraser",
  description: "Click and drag to erase individual pixels on the frame",
  icon: "eraser icon",        // Semantic-UI icon CSS class
  editCursor: "not-allowed",
  supportsDrag: true,
  shortcutKey: 'e',

  handleMouseDown: ( drawEnv ) => {
    // drawEnv is in the format generated by EditGraphic.collateDrawingToolEnv()
    drawEnv.clearPixelsAt(drawEnv.x, drawEnv.y)
  },

  handleMouseMove: ( drawEnv ) => { toolEraser.handleMouseDown(drawEnv) },

  handleMouseUp: ( drawEnv ) => {},

  handleMouseLeave: ( drawEnv ) => {}
};

export default toolEraser
