// this will simulate API caching on as it would be on NGINX production machine
// usage: $ curl -k -H "nocache: true"  http://localhost:3000/api/test - to manually invalidate cache
// !!! not suitable for production - only for testing purposes
import cache from '/imports/cache'
import { Restivus } from 'meteor/nimble:restivus'

export default class CachedRestivus extends Restivus {
  addRoute(path, options, req, ...rest) {
    const origGet = req.get
    req.get = function() {
      let key = path
      for (let i in this.urlParams) {
        key += '{' + i + ':' + this.urlParams[i] + '}'
      }
      if (this.request.headers[cache.cleanHeader]) {
        console.log('CLEAR CACHE', this.urlParams)
      }
      if (!cache.store[key] || this.request.headers[cache.cleanHeader] != void 0) {
        cache.store[key] = origGet.call(this)
      }
      return cache.store[key]
    }
    super.addRoute(path, options, req, ...rest)
  }
}
