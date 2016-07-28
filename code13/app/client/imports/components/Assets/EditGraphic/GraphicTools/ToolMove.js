
const ToolMove = {
  label: "Move",
  name: "moveTool",
  tooltip: "Grab and drag to move the the frame's contents up, down, left or right",
  icon: "move icon",        // Semantic-UI icon CSS class
  editCursor: "move",
  supportsDrag: true,
  shortcut: 'm',
  changesImage: true,             // This does cause changes to the image, so image is dirty if this tool used


  handleMouseDown: ( drawEnv ) => {
    // drawEnv is in the format generated by EditGraphic.collateDrawingToolEnv()

    ToolMove._storedPreviewImageData = drawEnv.previewCtx.getImageData(0,0, drawEnv.width, drawEnv.height)
    ToolMove._startx = drawEnv.x
    ToolMove._starty = drawEnv.y
  },

  handleMouseMove: ( drawEnv ) => {

    let x = drawEnv.x - ToolMove._startx
    let y = drawEnv.y - ToolMove._starty
    drawEnv.previewCtx.clearRect(0,0, drawEnv.width, drawEnv.height)
    drawEnv.previewCtx.putImageData(ToolMove._storedPreviewImageData, x, y)
    drawEnv.updateEditCanvasFromSelectedPreviewCanvas()
  },

  handleMouseUp: ( drawEnv ) => {

    ToolMove._storedPreviewImageData = null
    ToolMove._startx = null
    ToolMove._starty = null

  },

  handleMouseLeave: ( drawEnv ) => {
    // Treat as cancel:
      // drawEnv.previewCtx.clearRect(0,0, drawEnv.width, drawEnv.height)
      // drawEnv.previewCtx.putImageData(ToolMove._storedPreviewImageData, 0, 0)
    ToolMove.handleMouseUp()
  }

};

export default ToolMove
