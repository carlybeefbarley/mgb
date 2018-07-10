const ToolPaste = {
  label: 'Paste',
  name: 'pasteTool',
  tooltip: 'Rotate (Alt+Scroll). Scale (Shift+Scroll). Flip (Ctrl+Scroll)',
  icon: 'paste icon', // Semantic-UI icon CSS class
  editCursor: 'copy',
  supportsDrag: false,
  shortcut: 'Ctrl+V',
  level: 6,
  changesImage: true, // This does cause changes to the image, so image is dirty if this tool used
  hasHover: true, // enable mouse hover (not only on drag. Needed for paste preview)
  // hideTool: false,                 // don't show tool in tool panel

  _angle: 0,
  _scale: 1,
  _flipH: 1, // -1 if flipped

  handleMouseDown(drawEnv) {
    let pasteCanvas = drawEnv.getPasteCanvas()
    if (!pasteCanvas) return

    drawEnv.previewCtx.save()
    drawEnv.previewCtx.translate(drawEnv.x, drawEnv.y)
    drawEnv.previewCtx.rotate(ToolPaste._angle)
    drawEnv.previewCtx.scale(ToolPaste._flipH, 1)
    drawEnv.previewCtx.drawImage(
      pasteCanvas,
      0,
      0,
      pasteCanvas.width,
      pasteCanvas.height,
      0,
      0,
      pasteCanvas.width * ToolPaste._scale,
      pasteCanvas.height * ToolPaste._scale,
    )
    drawEnv.previewCtx.rotate(-ToolPaste._angle)
    drawEnv.previewCtx.translate(-drawEnv.x, -drawEnv.y)
    drawEnv.previewCtx.restore()
    drawEnv.updateEditCanvasFromSelectedPreviewCanvas()
  },

  handleMouseMove(drawEnv) {
    let pasteCanvas = drawEnv.getPasteCanvas()
    if (!pasteCanvas) return

    drawEnv.updateEditCanvasFromSelectedPreviewCanvas()
    drawEnv.editCtx.save()
    drawEnv.editCtx.translate(drawEnv.x * drawEnv.scale, drawEnv.y * drawEnv.scale)
    drawEnv.editCtx.rotate(ToolPaste._angle)
    drawEnv.editCtx.scale(ToolPaste._flipH, 1)
    drawEnv.editCtx.globalAlpha = 0.4
    drawEnv.editCtx.drawImage(
      pasteCanvas,
      0,
      0,
      pasteCanvas.width,
      pasteCanvas.height,
      0,
      0,
      pasteCanvas.width * drawEnv.scale * ToolPaste._scale,
      pasteCanvas.height * drawEnv.scale * ToolPaste._scale,
    )
    drawEnv.editCtx.rotate(-ToolPaste._angle)
    drawEnv.editCtx.translate(-drawEnv.x * drawEnv.scale, -drawEnv.y * drawEnv.scale)
    drawEnv.editCtx.restore()
  },

  handleMouseWheel(drawEnv, wd, scrollMode) {
    // rotate paste preview
    if (drawEnv.event.altKey || (scrollMode && scrollMode == 'Rotate')) {
      let direction = wd > 0 ? -1 : 1
      ToolPaste._angle += direction * (2 * Math.PI) / 16
      ToolPaste.handleMouseMove(drawEnv)
    }
    // scale paste preview
    if (drawEnv.event.shiftKey || (scrollMode && scrollMode == 'Scale')) {
      let newScale = wd > 0 ? ToolPaste._scale / 2 : ToolPaste._scale * 2
      if (newScale >= 0.25 && newScale <= 8) {
        ToolPaste._scale = newScale
      }
      ToolPaste.handleMouseMove(drawEnv)
    }
    if (drawEnv.event.ctrlKey || (scrollMode && scrollMode == 'Flip')) {
      ToolPaste._flipH *= -1
      ToolPaste.handleMouseMove(drawEnv)
    }
  },

  handleMouseUp(drawEnv) {},

  handleMouseLeave(drawEnv) {
    ToolPaste.handleMouseUp()
  },
}

export default ToolPaste
