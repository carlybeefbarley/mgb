
const ToolPaste = {
  name: "Paste",
  description: "Paste copied region",
  icon: "paste icon",        // Semantic-UI icon CSS class
  editCursor: "copy",
  supportsDrag: false,
  shortcutKey: 'v',
  changesImage: true,             // This does cause changes to the image, so image is dirty if this tool used
  hasHover: true,                 // enable mouse hover (not only on drag. Needed for paste preview)


  handleMouseDown: ( drawEnv ) => {
    let pasteCanvas = drawEnv.getPasteCanvas();
    if(!pasteCanvas) return;

    drawEnv.previewCtx.drawImage(
      pasteCanvas
      , 0
      , 0
      , pasteCanvas.width
      , pasteCanvas.height
      , drawEnv.x
      , drawEnv.y
      , pasteCanvas.width
      , pasteCanvas.height
    );
    drawEnv.updateEditCanvasFromSelectedPreviewCanvas()
  },

  handleMouseMove: ( drawEnv ) => {
    let pasteCanvas = drawEnv.getPasteCanvas();
    if(!pasteCanvas) return;

    drawEnv.updateEditCanvasFromSelectedPreviewCanvas()
    drawEnv.editCtx.save();
    drawEnv.editCtx.globalAlpha = 0.4;
    drawEnv.editCtx.drawImage(
      pasteCanvas
      , 0
      , 0
      , pasteCanvas.width
      , pasteCanvas.height
      , drawEnv.x*drawEnv.scale
      , drawEnv.y*drawEnv.scale
      , pasteCanvas.width*drawEnv.scale
      , pasteCanvas.height*drawEnv.scale
    );
    drawEnv.editCtx.restore();
  },

  handleMouseUp: ( drawEnv ) => {

  },

  handleMouseLeave: ( drawEnv ) => {
    ToolPaste.handleMouseUp()
  }

};

export default ToolPaste
