
const toolMove = {
  name: "Move",
  description: "Grab and drag to move the the frame's contents up, down, left or right",
  icon: "move icon",        // Semantic-UI icon CSS class
  editCursor: "move",
  supportsDrag: true,
  shortcutKey: 'm',

  handleMouseDown: ( drawEnv ) => {
    // drawEnv is in the format generated by EditGraphic.collateDrawingToolEnv()

    toolMove._storedPreviewImageData = drawEnv.previewCtx.getImageData(0,0, drawEnv.width, drawEnv.height)
    toolMove._startx = drawEnv.x
    toolMove._starty = drawEnv.y
  },

  handleMouseMove: ( drawEnv ) => {

    let x = drawEnv.x - toolMove._startx
    let y = drawEnv.y - toolMove._starty
    drawEnv.previewCtx.clearRect(0,0, drawEnv.width, drawEnv.height)
    drawEnv.previewCtx.putImageData(toolMove._storedPreviewImageData, x, y)
    drawEnv.updateEditCanvasFromSelectedPreviewCanvas()
  },

  handleMouseUp: ( drawEnv ) => {

    toolMove._storedPreviewImageData = null
    toolMove._startx = null
    toolMove._starty = null

  },

  handleMouseLeave: ( drawEnv ) => {
    // Treat as cancel:
      // drawEnv.previewCtx.clearRect(0,0, drawEnv.width, drawEnv.height)
      // drawEnv.previewCtx.putImageData(toolMove._storedPreviewImageData, 0, 0)
    toolMove.handleMouseUp()
  }

};

export default toolMove
