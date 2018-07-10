/**
 * Displays logs and Javascript errors in an overlay on top of your site. Useful for mobile webdevelopment.
 *
 * Originally based on http://markknol.github.io/console-log-viewer/ but  dgolds modified this heavily to remove
 * stuff like the HAXE.ORG custom settings hack & features, plus the way logging actually happened (%c etc)
 */

var ConsoleLogViewer = (function() {
  ConsoleLogViewer.isMinimized = true
  ConsoleLogViewer.logEnabled = true
  ConsoleLogViewer.TOTAL = 15

  var _items = []

  function ConsoleLogViewer() {
    var self = this
    try {
      self.addCSS()
      self.addDivs(self)
      self.overwrite()
    } catch (e) {
      setTimeout(function() {
        self.addCSS()
        self.addDivs(self)
        self.overwrite()
      }, 61)
    }
  }

  ConsoleLogViewer.prototype.getFormattedTime = function() {
    var date = new Date()
    return (
      this.format(date.getHours(), 2) +
      ':' +
      this.format(date.getMinutes(), 2) +
      ':' +
      this.format(date.getSeconds(), 2) +
      ':' +
      this.format(date.getMilliseconds(), 3)
    )
  }

  ConsoleLogViewer.prototype.format = function(v, x) {
    if (x == 2) return v < 10 ? '0' + v : '' + v
    else if (x == 3) {
      if (v < 10) return '00' + v
      else if (v < 100) return '0' + v
      else return '' + v
    }
  }

  ConsoleLogViewer.prototype.log = function(args, color) {
    if (!ConsoleLogViewer.logEnabled) return

    // Get rid of any %c modifiers, and remove the associated parameters. this is not robust, but works for the common case.
    var arg0 = args.shift()
    var noColor0 = arg0.replace(/%c/g, '')
    var removed = (arg0.length - noColor0.length) / 2
    while (removed--) args.shift()

    var content = noColor0 + '  ' + this.flatten(args.join(', '))

    _items.push(
      "<font class='log-date'>" +
        this.getFormattedTime() +
        "</font> &nbsp; <font class='" +
        color +
        "'>" +
        content +
        '</font>',
    )
    while (_items.length > ConsoleLogViewer.TOTAL) _items.shift()

    this.updateLog()
  }

  ConsoleLogViewer.prototype.updateLog = function() {
    if (!ConsoleLogViewer.isMinimized) {
      document.getElementById('debug_console_messages').innerHTML = _items.join('<br>')
    } else {
      var minimized = []
      for (let i = Math.max(0, _items.length - 3), leni = _items.length; i < leni; i++)
        minimized.push(_items[i])
      document.getElementById('debug_console_messages').innerHTML = minimized.join('<br>')
    }
  }

  ConsoleLogViewer.prototype.flatten = function(value) {
    return value
      .split('<')
      .join('&lt;')
      .split('>')
      .join('&gt;')
      .split('"')
      .join('&quot;')
  }

  ConsoleLogViewer.prototype.overwrite = function() {
    var self = this
    // store original functions
    var original = {
      console: {
        log: console.log,
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
      },
      window: { onerror: window.onerror },
    }

    // overwrite original functions
    if (original.console.log)
      console.log = function() {
        self.log(Array.prototype.slice.call(arguments), 'log-normal')
        original.console.log.apply(this, arguments)
      }
    if (original.console.debug)
      console.debug = function() {
        self.log(Array.prototype.slice.call(arguments), 'log-debug')
        original.console.debug.apply(this, arguments)
      }
    if (original.console.info)
      console.info = function() {
        self.log(Array.prototype.slice.call(arguments), 'log-info')
        original.console.info.apply(this, arguments)
      }
    if (original.console.warn)
      console.warn = function() {
        self.log(Array.prototype.slice.call(arguments), 'log-warn')
        original.console.warn.apply(this, arguments)
      }
    if (original.console.error)
      console.error = function() {
        self.log(Array.prototype.slice.call(arguments), 'log-error')
        original.console.error.apply(this, arguments)
      }
    window.onerror = function(message, url, lineNumber) {
      //      self.log([message, "<a target='_blank' onclick='javascript:DebugSource.show(this.href, this.parentNode.innerText);return false' href='"+url+"#"+lineNumber+"'>"+url+"</a>", "line: " + lineNumber], "log-error");
      self.log([message, 'Line: ' + lineNumber], 'log-error')
      if (original.window.onerror) return original.window.onerror(message, url, lineNumber)
      else return false
    }
  }

  ConsoleLogViewer.prototype.addDivs = function(self) {
    var alignment =
      window.location.href.indexOf('console_at_bottom=true') > -1 ||
      window.location.href.indexOf('console_at_bottom=1') > -1
        ? 'bottom-aligned'
        : 'top-aligned'
    var scripts = window.document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; i++) {
      var script = scripts[i]
      if (typeof script !== 'undefined' && typeof script.src !== 'undefined') {
        if (script.src.indexOf('console-log-viewer.js') !== -1) {
          if (script.src.indexOf('console_at_bottom=true') !== -1) {
            alignment = 'bottom-aligned'
            break
          }
        }
      }
    }

    var div = document.createElement('div')
    div.id = 'debug_console'
    div.className = alignment
    div.innerHTML =
      '<a href="#close" id="debug_console_close_button" class="log-button">x</a><a href="#close" id="debug_console_minimize_button" class="log-button">+</a><a href="#position" id="debug_console_position_button" class="log-button">&#8597;</a><a href="#pause" id="debug_console_pause_button" class="log-button">||</a><div id="debug_console_messages"></div>'
    document.getElementsByTagName('body')[0].appendChild(div)

    document.getElementById('debug_console_close_button').addEventListener(
      'click',
      function(e) {
        div.style.display = 'none'
        e.preventDefault()
      },
      false,
    )

    document.getElementById('debug_console_minimize_button').addEventListener(
      'click',
      function(e) {
        ConsoleLogViewer.isMinimized = !ConsoleLogViewer.isMinimized
        this.innerHTML = ConsoleLogViewer.isMinimized ? '+' : '&mdash;'
        self.updateLog()
        e.preventDefault()
      },
      false,
    )

    document.getElementById('debug_console_position_button').addEventListener(
      'click',
      function(e) {
        div.className = div.className == 'top-aligned' ? 'bottom-aligned' : 'top-aligned'
        e.preventDefault()
      },
      false,
    )

    document.getElementById('debug_console_pause_button').addEventListener(
      'click',
      function(e) {
        ConsoleLogViewer.logEnabled = !ConsoleLogViewer.logEnabled
        this.innerHTML = ConsoleLogViewer.logEnabled ? '||' : '&#9658;'
        e.preventDefault()
      },
      false,
    )
  }

  ConsoleLogViewer.prototype.addCSS = function() {
    var css =
      '#debug_console { background: rgba(0,0,0,.75); font: 11px Arial, sans-serif!important; position:fixed; padding:0; margin:0; z-index:12834567; box-sizing:border-box; pointer-events:none; text-align:left; text-transform:none; }'
    css += '#debug_console_messages { background:transparent;pointer-events:none; }'
    css += '#debug_console_button { border:1px solid #fff; position:absolute; z-index:2; }'
    css += '#debug_console.top-aligned {left:0; right:0; top:0;}'
    css += '#debug_console.minimized {left:0; right:0; top:0;}'
    css += '#debug_console.bottom-aligned {left:0; right:0; bottom:0;}'
    css +=
      '#debug_console a.log-button {font: bold 11px Arial, sans-serif!important; pointer-events:all; text-align:center; text-decoration:none; border:1px solid #999; background:#333; color:#fff; width:14px; height:14px; padding:5px; margin:1px; display:block; float:right; }'
    css += '#debug_console font.log-error a {pointer-events:all;color:red;}'
    css += '#debug_console font.log-date {color:gray;}'
    css += '#debug_console font.log-info {color:yellow;}'
    css += '#debug_console font.log-warn {color:orange;}'
    css += '#debug_console font.log-debug {color:lightblue;}'
    css += '#debug_console font.log-error {color:red;}'
    css += '#debug_console font.log-normal {color:white;}'

    var style = document.createElement('style')
    style.type = 'text/css'
    if (style.styleSheet) style.styleSheet.cssText = css
    else style.appendChild(document.createTextNode(css))

    document.getElementsByTagName('head')[0].appendChild(style)
  }

  return ConsoleLogViewer
})()

new ConsoleLogViewer()
