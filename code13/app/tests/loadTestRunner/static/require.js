{
  const toLoad = []
  const callbacks = []
  window.require = (sources, cb) => {
    callbacks.push(cb)
    sources.forEach(s => toLoad.push(s))
    const load = () => {
      if (!toLoad.length) {
        setTimeout(() => {
          while (callbacks.length) {
            callbacks.pop()()
          }
        }, 0)
        return
      }
      const src = toLoad[0]
      const scripts = document.head.getElementsByTagName("script")
      const loading = Array.prototype.find.call(scripts, s => {
        return s.src === src || s.src.substring(window.location.href.length - 1) === src
      })
      if (loading) {
        if (!loading.loaded) {
          const onload = loading.onload
          loading.onload = () => {
            onload()
            load()
          }
        }
        else {
          load()
        }
        return
      }
      const script = document.createElement('script')
      script.onload = () => {
        script.loaded = true
        toLoad.shift()
        setTimeout(load, 0)
      }
      script.src = src
      document.head.appendChild(script)
    }
    load()
  }
}
