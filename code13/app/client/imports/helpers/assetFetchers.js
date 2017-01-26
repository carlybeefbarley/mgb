import { Azzets } from '/imports/schemas'
import SpecialGlobals from '/imports/SpecialGlobals'
import { genetag } from '/imports/helpers/generators'
import { getProjectAvatarUrl as getProjectAvatarUrlBasic } from '/imports/schemas/projects'

// This browser/client will store partially fetched Azzets.
// PartialAssets because Meteor atm cannot merge assets recursively
// https://medium.com/@MaxDubrovin/workaround-for-meteor-limitations-if-you-want-to-sub-for-more-nested-fields-of-already-received-docs-eb3fdbfe4e07#.k76s2u4cs

const PartialAzzets = new Meteor.Collection('PartialAzzets')

const ALLOW_OBSERVERS = SpecialGlobals.allowObservers  // Big hammer to disable it if we hit a scalability crunch (or could make it user-specific or sysvar)
const MAX_ASSET_CACHE_LENGTH = 500  // Max # of assets in cache; not a size-based metric yet

// CDN_DOMAIN will be set at startup. See createCloudFront.js for the magic
let CDN_DOMAIN = ""
Meteor.startup(() => {
  Meteor.call("CDN.domain", (err, cdnDomain) => {
    if (!err)
      CDN_DOMAIN = cdnDomain
    console.log(`Using CDN ${CDN_DOMAIN}`)
  })
})

// makeCDNLink() will convert a local link e.g. /api/asset to //xxx.cloufront.com/api/asset?hash
// uri MUST have a leading slash in order to be converted (but not //)
export const makeCDNLink = (uri, etagOrHash = null) => {
  // if etag is not preset, then we will use Meteor autoupdateVersion - so we don't end up with outdated resource
  const hash = etagOrHash != null ? etagOrHash : (__meteor_runtime_config__ ? __meteor_runtime_config__.autoupdateVersion : Date.now())

  if (uri.startsWith("/") && !uri.startsWith("//"))
    return CDN_DOMAIN ? (`//${CDN_DOMAIN}${uri}?hash=${hash}`) : (uri + `?hash=${hash}`)

  return uri
}

export const makeExpireThumbnailLink = (assetId, expires) => {
  return makeCDNLink(`/api/asset/cached-thumbnail/png/${expires}/${assetId}`, makeExpireTimestamp(expires))
}

// use this to allow client NOT pull resources every time
export const makeExpireTimestamp = (expires) => {
  // TODO(@stauzs): we need server time here - this will work only for short periods of time !!!!
  // See https://github.com/mizzao/meteor-timesync 
  const now = Date.now()
  // this will be timestamp rounded to seconds
  return now - (now % (expires * 1000))
}

// project avatar url prefixed with CDN host
export const getProjectAvatarUrl = (p, expires = 60) => (
  // etag here is hardcoded - because we will receive asset which will stay very short period of time (1-60) minutes
  makeCDNLink(getProjectAvatarUrlBasic(p, expires), 'mgb')
)


// used by maps - to get notifications about image changes
export const observe = (selector, onReady, onChange = onReady, cachedObservable = null) => {
  // images in the map won't update
  const cursor = PartialAzzets.find(selector)
  // from now on only observe asset and update tern on changes only
  let onReadyCalled = false
  const observable = cachedObservable || {
    observer: null,
    getAssets: () => cursor.fetch(),
    subscription: null,
    ready: () => onReadyCalled
  }
  observable.subscription = Meteor.subscribe("assets.public.partial.bySelector", selector, {
    onStop: () => {
      observable.observer && observable.observer.stop()
      // Something internally in Meteor makes subscription stop even before it's ready
      // ..this is caused by subscriptions called in ReactGetMeteorData() - as they 
      // automatically gets closed. Another fix is to remove from stack Meteor.subscribe..:(
      // TODO(@dgolds):See if there is another approach?
      !onReadyCalled && observe(selector, onReady, onChange, observable)
    },
    onReady: () => {
      onReadyCalled = true
      if (ALLOW_OBSERVERS) {
        observable.observer = cursor.observeChanges({
          changed: (id, changes) => {
            onChange(id, changes)
          }
        })
      }
      onReady && onReady()
    },
    onError: (...args) => {
      console.log("Error:", name, ...args)
    }
  })
  return observable
}

// fetchAssetByUri() will fetch Asset by uri via ajax - returns Promise
export const fetchAssetByUri = (uri) => {
  return new Promise(function (resolve, reject) {
    mgbAjax(uri, (err, content) => {
      err ? reject(err) : resolve(content)
    }, null)
  })
}

// simple cache of ajax requests
const ajaxCache = []
const getFromCache = (uri, etag = null) => {
  return ajaxCache.find(c => {
    return (c.uri == uri && (etag ? c.etag == etag : true))
  })
}

const addToCache = (uri, etag, response) => {
  const cached = getFromCache(uri, etag)
  if (cached) {
    cached.response = response
    cached.lastAccessed = Date.now()
  }
  else {
    // check
    ajaxCache.push({
      uri, etag, response, lastAccessed: Date.now()
    })
    ajaxCache.sort((a, b) => a.lastAccessed < b.lastAccessed)
    if (ajaxCache.length > MAX_ASSET_CACHE_LENGTH)
      ajaxCache.shift()
  }
}
const removeFromCache = uri => {
  const index = ajaxCache.findIndex(c => c.uri === uri)
  if (index > -1) {
    ajaxCache.splice(index, 1)
  }
}

// this function will try to make the best of etag
// asset param is optional - without it this function will work as normal ajax
// cached resources should save 100-1000 ms per request (depends on headers roundtrip)
export const mgbAjax = (uri, callback, asset, onRequestOpen = null) => {
  const etag = (asset && typeof asset === "object") ? genetag(asset) : null
  if (etag) {
    const cached = getFromCache(uri, etag)
    if (cached) {
      // remove from stack to maintain async behaviour
      setTimeout(() => {
        callback(null, cached.response)
      }, 0)
      return
    }
  }
  else
    removeFromCache(uri)

  const client = new XMLHttpRequest()
  const cdnLink = makeCDNLink(uri, etag)
  const usingCDN = uri == cdnLink
  client.open('GET', cdnLink)

  if (onRequestOpen)
    onRequestOpen(client)
  
  client.send()
  client.onload = function () {
    // ajax will return 200 even for 304 Not Modified
    if (this.status >= 200 && this.status < 300) {
      if (etag && this.getResponseHeader("etag")) {
        addToCache(uri, etag, this.response)
      }
      callback(null, this.response, client)
    }
    else {
      // try link without CDN
      if (usingCDN) {
        console.log("CDN failed - trying local uri")
        mgbAjax(window.location.origin + uri, callback, asset, pullFromCache)
        return
      }
      callback(this.statusText)
    }
  }
  client.onerror = function (e) {
    if (usingCDN) {
      console.log("CDN failed - trying local uri")
      mgbAjax(window.location.origin + uri, callback, asset, pullFromCache)
      return
    }
    callback(e, this.statusText)
  }
}

// this class fetches and updates Asset and its content2

class AssetHandler {
  constructor(assetId, onChange) {
    this.id = assetId
    this.onChange = onChange

    this.asset = null
    this.isReady = false
    this.update()
  }

  stop() {
    if (this.subscription)
      this.subscription.stop()
  }

  ready() {
    return this.isReady
  }

  get loading() {
    return !this.isReady
  }

  updateAsset(onChange = null) {
    this.onChange = onChange
    const asset = Azzets.findOne(this.id)
    // save previous content2
    let oldC2 = this.asset ? this.asset.content2 : null
    asset.content2 = oldC2

    const etag = genetag(asset)
    if (this.etag !== etag && !asset.content2)
      this.etag = etag

    this.asset = asset
  }

  update(onChange = null, updateObj = null) {
    if (onChange) 
      this.onChange = onChange

    const asset = Azzets.findOne(this.id)

    // save previous content2
    let oldC2 = this.asset ? this.asset.content2 : null

    // check if we can skip subscription and further ajax call for c2
    if (asset) {
      if (this.asset) {
        const etag = genetag(asset)
        if (this.etag == etag) {
          // here we can silently update content2 without requesting new c2 from DB
          if (updateObj) {
            this.c2UpdatedAt = new Date()
            this.asset.content2 = updateObj.content2
            this.onChange && this.onChange()
          }
          return
        }
        // set reference to new asset
        this.asset = asset
      }

      // update content2 if there is one
      if (this.asset) {
        this.asset.content2 = updateObj ? updateObj.content2 : (this.asset.content2 ? this.asset.content2 : oldC2)
        this.etag = genetag(this.asset)
      }
    }

    // user that has modified asset will have updateObj
    if (updateObj) {
      this.c2UpdatedAt = new Date()
      this.asset.content2 = updateObj.content2
    }
    // viewer won't
    else
      this.updateContent2(updateObj)

    if (this.subscription)
      this._onReady(updateObj)
    else {
      // without timeout subscription will end automatically right after it starts (ReactMeteorData.getMeteorData is responsible for that),
      // but we want to keep subscription active as long as user is checking out asset
      // NOTE: we are calling onready only after ajax also has been loaded -
      // also without timeout getMeteorData will start infinite subscribe / unsubscribe loop - this is very very bad
      // getMeteorData is calling forceUpdate internally and it's called before render
      window.setTimeout(() => {
        // we still need latest asset fromDB
        this.subscription = Meteor.subscribe("assets.public.byId", this.id, {
          // onReady is called multiple times
          onReady: () => {
            this._onReady(updateObj)
          },
          // onStop is called multiple times and then immediately is fired onReady again
          onStop: () => {
            console.log("Stopped Meteor subscription for", this.id)
            this.subscription = null
          }
        })
      }, 0)
    }

  }

  updateContent2(updateObj) {
    const asset = Azzets.findOne(this.id)
    if (!asset)
      return

    if (updateObj) {
      this.c2UpdatedAt = new Date()
      this.asset.content2 = updateObj.content2
      this.onChange && this.onChange()
      return
    }

    mgbAjax(asset.c2location || `/api/asset/content2/${this.id}`, (err, data) => {
      if (err) {
        console.log("Failed to retrieve c2 for asset with id: ", this.id, err)
        return
      }
      const c2 = JSON.parse(data)
      const oldC2 = this.asset ? this.asset.content2 : null
      this.isReady = true

      let needUpdate = false
      if (!oldC2 || !_.isEqual(c2, oldC2)) {
        this.asset = asset
        this.asset.content2 = c2
        needUpdate = true
      }
      else if (!_.isEqual(asset, this.asset)) {
        this.asset = asset
        this.asset.content2 = oldC2
        needUpdate = true
      }

      if (needUpdate) {
        console.log("updateContent2() DOING full update")
        this.onChange && this.onChange()
      }
      else {
        console.log("updateContent2() Sources are equal.. preventing update!")
      }
      this.c2UpdatedAt = new Date()
    }, asset)
  }

  _onReady(updateObj) {
    // save previous content2
    let oldC2 = this.asset ? this.asset.content2 : null
    const asset = Azzets.findOne(this.id)
    if (!asset)
      return

    if (this.asset) {
      const etag = genetag(asset)
      if (this.etag == etag)
        return
    }

    this.asset = asset
    this.asset.content2 = updateObj ? updateObj.content2 : oldC2
    // actually etag is not correct here
    // as there is small difference in timestamps
    // saved minimongo data and fetched new differs approx ~ 10ms
    this.etag = genetag(this.asset)
    this.updateContent2(updateObj)
  }
}

const cachedAssetHandlers = []
// this will return AssetHandler
// This is used in the AssetEditRoute -> getMeteorData
// it's (NOT?) possible to pass cached c2 - to skip xhr request
export const getAssetWithContent2 = (id, onChange, forceUpdate) => {
  let handler = cachedAssetHandlers.find(a => a.id === id)
  if (handler) {
    if (!forceUpdate)
      handler.update(onChange)
    else
      handler.updateAsset(onChange)
    return handler
  }
  // keep only 10 assets in memory
  if (cachedAssetHandlers.length > 10) {
    handler = cachedAssetHandlers.shift()
    handler.stop()
  }
  handler = new AssetHandler(id, onChange)
  cachedAssetHandlers.push(handler)
  return handler
}
