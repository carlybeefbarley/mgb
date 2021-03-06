// Eraser tool.

import bline from './bresenhamLine'

let priorPoint = null // Used for tracking line draws from prior point to current point

// TODO: This is a bit confusing when erasing a lower layer - it shows erased on the top level
// briefly, then redraws to show the change

const ToolEraser = {
  label: 'Eraser',
  name: 'eraserTool',
  tooltip: 'Click and drag to erase individual pixels on the frame',
  icon: 'eraser icon', // Semantic-UI icon CSS class
  editCursor: 'crosshair',
  supportsDrag: true,
  shortcut: 'e',
  changesImage: true, // This does cause changes to the image, so image is dirty if this tool used
  level: 1,

  handleMouseDown(drawEnv) {
    // drawEnv is in the format generated by EditGraphic.collateDrawingToolEnv()
    priorPoint = { x: drawEnv.x, y: drawEnv.y }
    drawEnv.clearPixelsAt(drawEnv.x, drawEnv.y)
  },

  handleMouseMove(drawEnv) {
    if (priorPoint) {
      bline(drawEnv.clearPixelsAt, priorPoint.x, priorPoint.y, drawEnv.x, drawEnv.y)
      priorPoint = { x: drawEnv.x, y: drawEnv.y }
    }
  },

  handleMouseUp(drawEnv) {
    if (priorPoint) {
      bline(drawEnv.clearPixelsAt, priorPoint.x, priorPoint.y, drawEnv.x, drawEnv.y)
      priorPoint = { x: drawEnv.x, y: drawEnv.y }
      priorPoint = null
    }
  },

  handleMouseLeave(drawEnv) {},
}

export default ToolEraser
