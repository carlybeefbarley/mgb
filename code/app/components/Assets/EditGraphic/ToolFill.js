// start https://github.com/binarymax/floodfill.js/blob/master/floodfill.js
// See http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/ for explanation and another implementation

function floodfill(x,y,fillcolor,ctx,width,height,tolerance) {
  var img = ctx.getImageData(0,0,width,height);
  var data = img.data;
  var length = data.length;
  var Q = [];
  var i = (x+y*width)*4;
  var e = i, w = i, me, mw, w2 = width*4;
  var targetcolor = [data[i],data[i+1],data[i+2],data[i+3]];
  let startTimeMS = Date.now();
  let abort = false;

  if (!pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) { return false; }
  Q.push(i);
  while(Q.length > 0 && abort === false) {
    i = Q.pop();
    if(pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance)) {
      e = i;
      w = i;
      mw = parseInt(i/w2)*w2; //left bound
      me = mw+w2;	//right bound
      while(mw<(w-=4) && pixelCompareAndSet(w,targetcolor,fillcolor,data,length,tolerance)); //go left until edge hit
      while(me>(e+=4) && pixelCompareAndSet(e,targetcolor,fillcolor,data,length,tolerance)); //go right until edge hit
      for(var j=w;j<e;j+=4) {
        if(j-w2>=0 		&& pixelCompare(j-w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j-w2); //queue y-1
        if(j+w2<length	&& pixelCompare(j+w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j+w2); //queue y+1
      }
    }
    if (Date.now() - startTimeMS > 100) {
      console.log("aborting flood fill:  took > 100ms")
      abort = true;
      return
    }
  }
  ctx.putImageData(img,0,0);
}


function pixelCompare(i, targetcolor, fillcolor, data, length, tolerance) {
  if (i<0||i>=length) return false; //out of bounds
  if (data[i+3]===0)  return true;  //surface is invisible

  if (
    (targetcolor[3] === fillcolor.a) &&
    (targetcolor[0] === fillcolor.r) &&
    (targetcolor[1] === fillcolor.g) &&
    (targetcolor[2] === fillcolor.b)
  ) return false; //target is same as fill

  if (
    (targetcolor[3] === data[i+3]) &&
    (targetcolor[0] === data[i]  ) &&
    (targetcolor[1] === data[i+1]) &&
    (targetcolor[2] === data[i+2])
  ) return true; //target matches surface

  if (
    Math.abs(targetcolor[3] - data[i+3])<=(255-tolerance) &&
    Math.abs(targetcolor[0] - data[i]  )<=tolerance &&
    Math.abs(targetcolor[1] - data[i+1])<=tolerance &&
    Math.abs(targetcolor[2] - data[i+2])<=tolerance
  ) return true; //target to surface within tolerance

  return false; //no match
}

function pixelCompareAndSet(i, targetcolor, fillcolor, data, length, tolerance) {
  if (pixelCompare(i,targetcolor, fillcolor,data,length,tolerance)) {
    //fill the color
    data[i] 	 = fillcolor.r;
    data[i+1] = fillcolor.g;
    data[i+2] = fillcolor.b;
    data[i+3] = fillcolor.a;
    return true;
  }
  return false;
}

//// end https://github.com/binarymax/floodfill.js/blob/master/floodfill.js


const toolFill = {
  name: "Fill",
  icon: "maximize icon",        // Semantic-UI icon CSS class
  editCursor: "crosshair",
  supportsDrag: false,

  handleMouseDown: ( drawEnv ) => {
    // x,y are the unscaled pixel coordinates of the mousedown
    // drawEnv is in the format generated by EditGraphic.collateDrawingToolEnv()
console.log("starting fill...")
    // Change Preview canvas (which is the real data)
    let crgba = drawEnv.chosenColor.rgb;
    let c = { r: crgba.r, g: crgba.g, b: crgba.b, a: Math.floor((crgba.a)*255) }
    floodfill(drawEnv.x, drawEnv.y, c, drawEnv.previewCtx, drawEnv.width, drawEnv.height, 16)
console.log("ended fill")

    // We don't need to edit the Edit canvas since we declared 'supportsDrag: false' so EditGraphic will handle redraw

  },

  handleMouseMove: ( drawEnv ) => { },

  handleMouseUp: ( drawEnv ) => {},

  handleMouseLeave: ( drawEnv ) => {}

};

export default toolFill
