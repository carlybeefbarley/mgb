/*
    SuperGif

    Example usage:

        <img src="./example1_preview.gif" rel:animated_src="./example1.gif" width="360" height="360" rel:auto_play="1" />

        <script type="text/javascript">
            $$('img').each(function (img_tag) {
                if (/.*\.gif/.test(img_tag.src)) {
                    var rub = new SuperGif({ gif: img_tag } );
                    rub.load();
                }
            });
        </script>

    Constructor options args

        gif                 Required. The DOM element of an img tag.
        loop_mode           Optional. Setting this to false will force disable looping of the gif.
        auto_play           Optional. Same as the rel:auto_play attribute above, this arg overrides the img tag info.
        max_width           Optional. Scale images over max_width down to max_width. Helpful with mobile.
        on_end              Optional. Add a callback for when the gif reaches the end of a single loop (one iteration). The first argument passed will be the gif HTMLElement.
        loop_delay          Optional. The amount of time to pause (in ms) after each single loop (iteration).
        draw_while_loading  Optional. Determines whether the gif will be drawn to the canvas whilst it is loaded.
        show_progress_bar   Optional. Only applies when draw_while_loading is set to true.

    Instance methods

        // loading
        load( callback )        Loads the gif specified by the src or rel:animated_src sttributie of the img tag into a canvas element and then calls callback if one is passed
        load_url( src, callback )   Loads the gif file specified in the src argument into a canvas element and then calls callback if one is passed

        // play controls
        play -              Start playing the gif
        pause -             Stop playing the gif
        move_to(i) -        Move to frame i of the gif
        move_relative(i) -  Move i frames ahead (or behind if i < 0)

        // getters
        get_canvas          The canvas element that the gif is playing in. Handy for assigning event handlers to.
        get_playing         Whether or not the gif is currently playing
        get_loading         Whether or not the gif has finished loading/parsing
        get_auto_play       Whether or not the gif is set to play automatically
        get_length          The number of frames in the gif
        get_current_frame   The index of the currently displayed frame of the gif

        For additional customization (viewport inside iframe) these params may be passed:
        c_w, c_h - width and height of canvas
        vp_t, vp_l, vp_ w, vp_h - top, left, width and height of the viewport

        A bonus: few articles to understand what is going on
            http://enthusiasms.org/post/16976438906
            http://www.matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp
            http://humpy77.deviantart.com/journal/Frame-Delay-Times-for-Animated-GIFs-214150546

*/

// Generic functions
var bitsToNum = function(ba) {
  return ba.reduce(function(s, n) {
    return s * 2 + n
  }, 0)
}

var byteToBitArr = function(bite) {
  var a = []
  for (let i = 7; i >= 0; i--) {
    a.push(!!(bite & (1 << i)))
  }
  return a
}

// Stream
/**
 * @constructor
 */
// Make compiler happy.
var Stream = function(data) {
  this.data = data
  this.len = this.data.length
  this.pos = 0

  this.readByte = function() {
    if (this.pos >= this.data.length) {
      throw new Error('Attempted to read past end of stream.')
    }
    if (data instanceof Uint8Array) return data[this.pos++]
    else return data.charCodeAt(this.pos++) & 0xff
  }

  this.readBytes = function(n) {
    var bytes = []
    for (let i = 0; i < n; i++) {
      bytes.push(this.readByte())
    }
    return bytes
  }

  this.read = function(n) {
    var s = ''
    for (let i = 0; i < n; i++) {
      s += String.fromCharCode(this.readByte())
    }
    return s
  }

  this.readUnsigned = function() {
    // Little-endian.
    var a = this.readBytes(2)
    return (a[1] << 8) + a[0]
  }
}

var lzwDecode = function(minCodeSize, data) {
  // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
  var pos = 0 // Maybe this streaming thing should be merged with the Stream?
  var readCode = function(size) {
    var code = 0
    for (let i = 0; i < size; i++) {
      if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
        code |= 1 << i
      }
      pos++
    }
    return code
  }

  var output = []

  var clearCode = 1 << minCodeSize
  var eoiCode = clearCode + 1

  var codeSize = minCodeSize + 1

  var dict = []

  var clear = function() {
    dict = []
    codeSize = minCodeSize + 1
    for (let i = 0; i < clearCode; i++) {
      dict[i] = [i]
    }
    dict[clearCode] = []
    dict[eoiCode] = null
  }

  var code
  var last

  while (true) {
    last = code
    code = readCode(codeSize)

    if (code === clearCode) {
      clear()
      continue
    }
    if (code === eoiCode) break

    if (code < dict.length) {
      if (last !== clearCode) {
        dict.push(dict[last].concat(dict[code][0]))
      }
    } else {
      if (code !== dict.length) throw new Error('Invalid LZW code.')
      dict.push(dict[last].concat(dict[last][0]))
    }
    output.push.apply(output, dict[code])

    if (dict.length === 1 << codeSize && codeSize < 12) {
      // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
      codeSize++
    }
  }

  // I don't know if this is technically an error, but some GIFs do it.
  //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
  return output
}

// The actual parsing; returns an object with properties.
var parseGIF = function(st, handler) {
  handler || (handler = {})

  // LZW (GIF-specific)
  var parseCT = function(entries) {
    // Each entry is 3 bytes, for RGB.
    var ct = []
    for (let i = 0; i < entries; i++) {
      ct.push(st.readBytes(3))
    }
    return ct
  }

  var readSubBlocks = function() {
    var size, data
    data = ''
    do {
      size = st.readByte()
      data += st.read(size)
    } while (size !== 0)
    return data
  }

  var parseHeader = function() {
    var header = {}
    header.sig = st.read(3)
    header.ver = st.read(3)
    if (header.sig !== 'GIF') throw new Error('Not a GIF file.') // XXX: This should probably be handled more nicely.
    header.width = st.readUnsigned()
    header.height = st.readUnsigned()

    var bits = byteToBitArr(st.readByte())
    header.gctFlag = bits.shift()
    header.colorRes = bitsToNum(bits.splice(0, 3))
    header.sorted = bits.shift()
    header.gctSize = bitsToNum(bits.splice(0, 3))

    header.bgColor = st.readByte()
    header.pixelAspectRatio = st.readByte() // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (header.gctFlag) {
      header.gct = parseCT(1 << (header.gctSize + 1))
    }
    handler.header && handler.header(header)
  }

  var parseExt = function(block) {
    var parseGCExt = function(block) {
      var blockSize = st.readByte() // Always 4
      var bits = byteToBitArr(st.readByte())
      block.reserved = bits.splice(0, 3) // Reserved; should be 000.
      block.disposalMethod = bitsToNum(bits.splice(0, 3))
      block.userInput = bits.shift()
      block.transparencyGiven = bits.shift()

      block.delayTime = st.readUnsigned()

      block.transparencyIndex = st.readByte()

      block.terminator = st.readByte()

      handler.gce && handler.gce(block)
    }

    var parseComExt = function(block) {
      block.comment = readSubBlocks()
      handler.com && handler.com(block)
    }

    var parsePTExt = function(block) {
      // No one *ever* uses this. If you use it, deal with parsing it yourself.
      var blockSize = st.readByte() // Always 12
      block.ptHeader = st.readBytes(12)
      block.ptData = readSubBlocks()
      handler.pte && handler.pte(block)
    }

    var parseAppExt = function(block) {
      var parseNetscapeExt = function(block) {
        var blockSize = st.readByte() // Always 3
        block.unknown = st.readByte() // ??? Always 1? What is this?
        block.iterations = st.readUnsigned()
        block.terminator = st.readByte()
        handler.app && handler.app.NETSCAPE && handler.app.NETSCAPE(block)
      }

      var parseUnknownAppExt = function(block) {
        block.appData = readSubBlocks()
        // FIXME: This won't work if a handler wants to match on any identifier.
        handler.app && handler.app[block.identifier] && handler.app[block.identifier](block)
      }

      var blockSize = st.readByte() // Always 11
      block.identifier = st.read(8)
      block.authCode = st.read(3)
      switch (block.identifier) {
        case 'NETSCAPE':
          parseNetscapeExt(block)
          break
        default:
          parseUnknownAppExt(block)
          break
      }
    }

    var parseUnknownExt = function(block) {
      block.data = readSubBlocks()
      handler.unknown && handler.unknown(block)
    }

    block.label = st.readByte()
    switch (block.label) {
      case 0xf9:
        block.extType = 'gce'
        parseGCExt(block)
        break
      case 0xfe:
        block.extType = 'com'
        parseComExt(block)
        break
      case 0x01:
        block.extType = 'pte'
        parsePTExt(block)
        break
      case 0xff:
        block.extType = 'app'
        parseAppExt(block)
        break
      default:
        block.extType = 'unknown'
        parseUnknownExt(block)
        break
    }
  }

  var parseImg = function(img) {
    var deinterlace = function(pixels, width) {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...
      var newPixels = new Array(pixels.length)
      var rows = pixels.length / width
      var cpRow = function(toRow, fromRow) {
        var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width)
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels))
      }

      // See appendix E.
      var offsets = [0, 4, 2, 1]
      var steps = [8, 8, 4, 2]

      var fromRow = 0
      for (let pass = 0; pass < 4; pass++) {
        for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
          cpRow(toRow, fromRow)
          fromRow++
        }
      }

      return newPixels
    }

    img.leftPos = st.readUnsigned()
    img.topPos = st.readUnsigned()
    img.width = st.readUnsigned()
    img.height = st.readUnsigned()

    var bits = byteToBitArr(st.readByte())
    img.lctFlag = bits.shift()
    img.interlaced = bits.shift()
    img.sorted = bits.shift()
    img.reserved = bits.splice(0, 2)
    img.lctSize = bitsToNum(bits.splice(0, 3))

    if (img.lctFlag) {
      img.lct = parseCT(1 << (img.lctSize + 1))
    }

    img.lzwMinCodeSize = st.readByte()

    var lzwData = readSubBlocks()

    img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData)

    if (img.interlaced) {
      // Move
      img.pixels = deinterlace(img.pixels, img.width)
    }

    handler.img && handler.img(img)
  }

  var parseBlock = function() {
    var block = {}
    block.sentinel = st.readByte()

    switch (String.fromCharCode(block.sentinel)) { // For ease of matching
      case '!':
        block.type = 'ext'
        parseExt(block)
        break
      case ',':
        block.type = 'img'
        parseImg(block)
        break
      case ';':
        block.type = 'eof'
        handler.eof && handler.eof(block)
        break
      default:
        throw new Error('Unknown block: 0x' + block.sentinel.toString(16)) // TODO: Pad this with a 0.
    }

    if (block.type !== 'eof') setTimeout(parseBlock, 0)
  }

  var parse = function() {
    parseHeader()
    setTimeout(parseBlock, 0)
  }

  parse()
}

/******************** SUPER GIF class *************************/
var GifParser = function(opts) {
  var options = {
    //canvas sizes
    c_w: null,
    c_h: null,
  }
  for (let i in opts) {
    options[i] = opts[i]
  }

  var stream
  var header

  var loadError = null
  var loading = false

  var transparency = null
  var delay = null
  var disposalMethod = null
  var disposalRestoreFromIdx = null
  var lastDisposalMethod = null
  var frame = null
  var lastImg = null

  var frames = []

  var gif = options.gif

  var clear = function() {
    transparency = null
    delay = null
    lastDisposalMethod = disposalMethod
    disposalMethod = null
    frame = null
  }

  // XXX: There's probably a better way to handle catching exceptions when
  // callbacks are involved.
  var doParse = function() {
    try {
      parseGIF(stream, handler)
    } catch (err) {
      // doLoadError('parse');
      console.log('Parse error')
    }
  }

  var setSizes = function(w, h) {
    canvas.width = w * get_canvas_scale()
    canvas.height = h * get_canvas_scale()

    tmpCanvas.width = w
    tmpCanvas.height = h
    tmpCanvas.style.width = w + 'px'
    tmpCanvas.style.height = h + 'px'
    tmpCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0)
  }

  var doHeader = function(_header) {
    header = _header
    setSizes(header.width, header.height)
  }

  var doGCE = function(gce) {
    pushFrame()
    clear()
    transparency = gce.transparencyGiven ? gce.transparencyIndex : null
    delay = gce.delayTime
    disposalMethod = gce.disposalMethod
    // We don't have much to do with the rest of GCE.
  }

  var pushFrame = function() {
    if (!frame) return
    frames.push({
      data: frame.getImageData(0, 0, header.width, header.height),
      delay,
    })
    // frameOffsets.push({ x: 0, y: 0 });
  }

  var doImg = function(img) {
    if (!frame) frame = tmpCanvas.getContext('2d')

    var currIdx = frames.length

    //ct = color table, gct = global color table
    var ct = img.lctFlag ? img.lct : header.gct // TODO: What if neither exists?

    /*
        Disposal method indicates the way in which the graphic is to
        be treated after being displayed.

        Values :    0 - No disposal specified. The decoder is
                        not required to take any action.
                    1 - Do not dispose. The graphic is to be left
                        in place.
                    2 - Restore to background color. The area used by the
                        graphic must be restored to the background color.
                    3 - Restore to previous. The decoder is required to
                        restore the area overwritten by the graphic with
                        what was there prior to rendering the graphic.

                        Importantly, "previous" means the frame state
                        after the last disposal of method 0, 1, or 2.
        */
    if (currIdx > 0) {
      if (lastDisposalMethod === 3) {
        // Restore to previous
        // If we disposed every frame including first frame up to this point, then we have
        // no composited frame to restore to. In this case, restore to background instead.
        if (disposalRestoreFromIdx !== null) {
          frame.putImageData(frames[disposalRestoreFromIdx].data, 0, 0)
        } else {
          frame.clearRect(lastImg.leftPos, lastImg.topPos, lastImg.width, lastImg.height)
        }
      } else {
        disposalRestoreFromIdx = currIdx - 1
      }

      if (lastDisposalMethod === 2) {
        // Restore to background color
        // Browser implementations historically restore to transparent; we do the same.
        // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
        frame.clearRect(lastImg.leftPos, lastImg.topPos, lastImg.width, lastImg.height)
      }
    }
    // else, Undefined/Do not dispose.
    // frame contains final pixel data from the last frame; do nothing

    //Get existing pixels for img region after applying disposal method
    var imgData = frame.getImageData(img.leftPos, img.topPos, img.width, img.height)

    //apply color table colors
    img.pixels.forEach(function(pixel, i) {
      // imgData.data === [R,G,B,A,R,G,B,A,...]
      if (pixel !== transparency) {
        imgData.data[i * 4 + 0] = ct[pixel][0]
        imgData.data[i * 4 + 1] = ct[pixel][1]
        imgData.data[i * 4 + 2] = ct[pixel][2]
        imgData.data[i * 4 + 3] = 255 // Opaque.
      }
    })

    frame.putImageData(imgData, img.leftPos, img.topPos)

    lastImg = img
  }

  var doDecodeProgress = function(draw) {
    // doShowProgress(stream.pos, stream.data.length, draw);
  }

  var doNothing = function() {}

  var withProgress = function(fn, draw) {
    return function(block) {
      fn(block)
      doDecodeProgress(draw)
    }
  }

  var handler = {
    header: withProgress(doHeader),
    gce: withProgress(doGCE),
    com: withProgress(doNothing),
    // I guess that's all for now.
    app: {
      // TODO: Is there much point in actually supporting iterations?
      NETSCAPE: withProgress(doNothing),
    },
    img: withProgress(doImg, true),
    eof(block) {
      pushFrame()
      doDecodeProgress(false)
      if (!(options.c_w && options.c_h)) {
        canvas.width = header.width * get_canvas_scale()
        canvas.height = header.height * get_canvas_scale()
      }
      loading = false
      if (load_callback) {
        load_callback(gif)
      }
    },
  }

  var init = function() {
    var parent = gif.parentNode

    var div = document.createElement('div')
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')

    tmpCanvas = document.createElement('canvas')

    div.width = canvas.width = gif.width
    div.height = canvas.height = gif.height
  }

  var get_canvas_scale = function() {
    return 1
  }

  var canvas, ctx, tmpCanvas
  var initialized = false
  var load_callback = false

  return {
    load_url(src, callback) {
      load_callback = callback
      var h = new XMLHttpRequest()
      // new browsers (XMLHttpRequest2-compliant)
      h.open('GET', src, true)

      if ('overrideMimeType' in h) {
        h.overrideMimeType('text/plain; charset=x-user-defined')
      } else if ('responseType' in h) {
        // old browsers (XMLHttpRequest-compliant)
        h.responseType = 'arraybuffer'
      } else {
        // IE9 (Microsoft.XMLHTTP-compliant)
        h.setRequestHeader('Accept-Charset', 'x-user-defined')
      }

      h.onloadstart = function() {
        // Wait until connection is opened to replace the gif element with a canvas to avoid a blank img
        if (!initialized) init()
      }
      h.onload = function(e) {
        if (this.status != 200) {
          // doLoadError('xhr - response');
        }
        // emulating response field for IE9
        if (!('response' in this)) {
          this.response = new window.VBArray(this.responseText)
            .toArray()
            .map(String.fromCharCode)
            .join('')
        }
        var data = this.response
        if (data.toString().indexOf('ArrayBuffer') > 0) {
          data = new Uint8Array(data)
        }

        stream = new Stream(data)
        setTimeout(doParse, 0)
      }
      h.onprogress = function(e) {
        // if (e.lengthComputable) console.log(e.loaded, e.total);
      }
      h.onerror = function() {
        /* doLoadError('xhr'); */
      }
      h.send()
    },
    load(callback) {
      this.load_url(gif.src, callback)
    },

    getFrames() {
      return frames
    },
  }
}

export default GifParser
