// start https://github.com/binarymax/floodfill.js/blob/master/floodfill.js
// See http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/ for explanation and another implementation

function floodfill(x, y, fillcolor, ctx, width, height, tolerance) {
  var img = ctx.getImageData(0, 0, width, height)
  var data = img.data
  var length = data.length
  var Q = []
  var i = (x + y * width) * 4
  var e = i,
    w = i,
    me,
    mw,
    w2 = width * 4 // e=east color-boundary;   w=west color-boundary
  var targetcolor = [data[i], data[i + 1], data[i + 2], data[i + 3]]
  let startTimeMS = Date.now()
  let abort = false

  if (!pixelCompare(i, targetcolor, fillcolor, data, length, tolerance)) return false

  Q.push(i)
  while (Q.length > 0 && abort === false) {
    i = Q.pop()
    if (pixelCompareAndSet(i, targetcolor, fillcolor, data, length, tolerance)) {
      e = i
      w = i
      mw = parseInt(i / w2) * w2 //left bound
      me = mw + w2 //right bound
      while (
        mw < w &&
        pixelCompareAndSet(w - 4, targetcolor, fillcolor, data, length, tolerance) &&
        mw < (w -= 4)
      ); //go left until edge hit
      while (
        me > e &&
        me > (e += 4) &&
        pixelCompareAndSet(e, targetcolor, fillcolor, data, length, tolerance)
      ); //go right until edge hit
      for (let j = w; j < e; j += 4) {
        if (j - w2 >= 0 && pixelCompare(j - w2, targetcolor, fillcolor, data, length, tolerance))
          Q.push(j - w2) //queue y-1
        if (j + w2 < length && pixelCompare(j + w2, targetcolor, fillcolor, data, length, tolerance))
          Q.push(j + w2) //queue y+1
      }
    }
    if (Date.now() - startTimeMS > 100) {
      console.log('aborting flood fill:  took > 100ms')
      abort = true
      return
    }
  }
  ctx.putImageData(img, 0, 0)
}

function pixelCompare(i, targetcolor, fillcolor, data, length, tolerance) {
  if (i < 0 || i >= length) return false //out of bounds
  if (data[i + 3] === 0 && fillcolor.a > 0) return true //surface is invisible and fill is visible

  if (
    targetcolor[3] === fillcolor.a &&
    targetcolor[0] === fillcolor.r &&
    targetcolor[1] === fillcolor.g &&
    targetcolor[2] === fillcolor.b
  )
    return false //target is same as fill

  if (
    targetcolor[3] === data[i + 3] &&
    targetcolor[0] === data[i] &&
    targetcolor[1] === data[i + 1] &&
    targetcolor[2] === data[i + 2]
  )
    return true //target matches surface

  const d3 = Math.abs(targetcolor[3] - data[i + 3])
  const d0 = Math.abs(targetcolor[0] - data[i])
  const d1 = Math.abs(targetcolor[1] - data[i + 1])
  const d2 = Math.abs(targetcolor[2] - data[i + 2])
  //console.log("i", i, "diffs", d0, d1, d2, d3, 'd3r', d3r, 'tc3', targetcolor[3], 'da3', data[i+3])
  return d0 + d1 + d2 + d3 <= tolerance //target to surface within tolerance
}

function pixelCompareAndSet(i, targetcolor, fillcolor, data, length, tolerance) {
  if (pixelCompare(i, targetcolor, fillcolor, data, length, tolerance)) {
    //fill the color
    data[i] = fillcolor.r
    data[i + 1] = fillcolor.g
    data[i + 2] = fillcolor.b
    data[i + 3] = fillcolor.a
    return true
  }
  return false
}

//// end https://github.com/binarymax/floodfill.js/blob/master/floodfill.js

const ToolFill = {
  label: 'Fill',
  name: 'fillTool',
  tooltip: 'Click to fill an area with the chosen color. Color 00000000 is transparent/erase',
  icon: 'maximize icon', // Semantic-UI icon CSS class
  editCursor: 'crosshair',
  supportsDrag: false,
  shortcut: 'f',
  changesImage: true, // This does cause changes to the image, so image is dirty if this tool used
  level: 5,

  handleMouseDown: drawEnv => {
    // drawEnv is in the format generated by EditGraphic.collateDrawingToolEnv()

    // Change Preview canvas (which is the real data)
    let crgba = drawEnv.chosenColor.rgb
    let c = { r: crgba.r, g: crgba.g, b: crgba.b, a: Math.floor(crgba.a * 255) }
    floodfill(drawEnv.x, drawEnv.y, c, drawEnv.previewCtx, drawEnv.width, drawEnv.height, 8)

    // We don't need to update the Edit canvas since we EditGraphic will handle redraws anyway
  },

  handleMouseMove: drawEnv => {},

  handleMouseUp: drawEnv => {},

  handleMouseLeave: drawEnv => {},
}

export default ToolFill