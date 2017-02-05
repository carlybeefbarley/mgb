(function() {
// if adblock blocks analytics
  Package = typeof(Package) === "undefined" ? {} : Package;
  Package['okgrow:analytics'] = {
    analytics: {
      page: function () {
      },
      track: function () {
      },
      identify: function () {
      }
    }
  }
// IE and onlder browser fixes
  if (Number.isInteger === void(0)) {
    Number.isInteger = function (value) {
      return typeof value === "number" &&
        isFinite(value) &&
        Math.floor(value) === value;
    }
  }
  if (String.prototype.startsWith === void(0)) {
    String.prototype.startsWith = function (search) {
      return this.indexOf(search) === 0
    }
  }
//if (window.CustomEvent === void(0)) {
// IE11 has CutomEvent defined, but throws exception - Object doesn't support this action
  function CustomEvent(event, params) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent
//}

// allows CDN connections from other locations

  window.setTimeout(function () {
    if (!__meteor_runtime_config__ || !__meteor_runtime_config__.ROOT_URL)
      return

    const root_host = __meteor_runtime_config__.ROOT_URL.split("//").pop()
    if (root_host.startsWith(window.location.host) || root_host.startsWith('localhost'))
      return

    __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = __meteor_runtime_config__.ROOT_URL
  }, 1)
})()
