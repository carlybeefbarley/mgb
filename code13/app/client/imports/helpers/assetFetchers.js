import { Azzets } from '/imports/schemas'
import SpecialGlobals from '/imports/SpecialGlobals'
import { genetag } from '/imports/helpers/generators'
import { getProjectAvatarUrl as getProjectAvatarUrlBasic } from '/imports/schemas/projects'



// here client will store partially fetched Azzets
// PartialAssets because meteor atm cannot merge assets recursively - https://medium.com/@MaxDubrovin/workaround-for-meteor-limitations-if-you-want-to-sub-for-more-nested-fields-of-already-received-docs-eb3fdbfe4e07#.k76s2u4cs
const PartialAzzets = new Meteor.Collection('PartialAzzets')

const ALLOW_OBSERVERS = SpecialGlobals.allowObservers
const MAX_ASSET_CACHE_LENGTH = 500

// CDN_DOMAIN will be set at startup
let CDN_DOMAIN = ""
Meteor.startup(() => {
  Meteor.call("CDN.domain", (err, cdnDomain) => {
    if (!err)
      CDN_DOMAIN = cdnDomain
  })
})

// will convert local link e.g. /api/asset to //xxx.cloufront.com/api/asset?hash
export const makeCDNLink = (uri, etagOrHash = null) => {
  // if etag is not preset, then we will use Meteor autoupdateVersion - so we don't end up with outdated resource
  const hash = etagOrHash != null ? etagOrHash : (__meteor_runtime_config__ ? __meteor_runtime_config__.autoupdateVersion : Date.now())
  // const now = Date.now()
  // const nextUpdate = now - (now % (60 * 1000)) // by default keep 1 minute in cache
  // const hash = etagOrHash ? etagOrHash :  nextUpdate

  if (CDN_DOMAIN && uri.startsWith("/") && uri.substr(0, 2) != "//") {
    return `//${CDN_DOMAIN}${uri}?hash=${hash}`
  }
  return uri
}

export const makeExpireLink = (assetId, expires) => {
  // we need server time here !!!!
  // time removed - as cloudfront will respect s-maxage directive - set by MGB server
  //const now = Date.now()
  //const nextUpdate = now - (now % (expires * 1000))
  return makeCDNLink(`/api/asset/cached-thumbnail/png/${expires}/${assetId}`)
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
      // Something internally in the Meteor makes subscription to stop even before it's ready
      // try again.. TODO: debug this further
      // this is caused by subscriptions called in ReactGetMeteorData - as they automatically gets closed
      // another fix is to remove from stack Meteor.subscribe
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

// will fetch asset by uri via ajax - returns Promise
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
  else {
    removeFromCache(uri)
  }
  const client = new XMLHttpRequest()
  const cdnLink = makeCDNLink(uri, etag)
  const usingCDN = uri == cdnLink
  client.open('GET', cdnLink)

  if (onRequestOpen) {
    onRequestOpen(client)
  }
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

// this class fetches and updates asset and its content2

class AssetHandler {
  constructor(assetId, onChange) {
    this.id = assetId
    this.onChange = onChange

    this.asset = null
    this.isReady = false
    this.update()
  }

  stop(){
    if(this.subscription){
      this.subscription.stop()
    }
  }
  ready() {
    return this.isReady
  }
  get loading(){
    return !this.isReady
  }

  update(onChange = null, updateObj = null) {
    if (onChange) {
      this.onChange = onChange
    }

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
      this.asset.content2 = updateObj.content2
    }
    // viewer won't
    else{
      this.updateContent2(updateObj)
    }

    if(this.subscription){
      this._onReady(updateObj)
    }
    else{
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
            console.log("Stopped sub for", this.id)
            this.subscription = null
          }
        })
      }, 0)
    }

  }

  updateContent2(updateObj) {
    const asset = Azzets.findOne(this.id)
    if (!asset) {
      return
    }

    if (updateObj) {
      this.asset.content2 = updateObj.content2
      this.onChange && this.onChange()
      return
    }

    mgbAjax(asset.c2location || `/api/asset/content2/${this.id}`, (err, data) => {
      if (err) {
        console.log("Failed to retrieve c2 for asset with id: ", this.id)
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
        console.log("DOING full update")
        this.onChange && this.onChange()
      }
      else {
        console.log("Sources are equal.. preventing update!")
      }
    }, asset)
  }

  _onReady(updateObj){
    // save previous content2
    let oldC2 = this.asset ? this.asset.content2 : null
    const asset = Azzets.findOne(this.id)
    if (!asset) {
      return
    }

    if (this.asset) {
      const etag = genetag(asset)
      if (this.etag == etag) {
        return
      }
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
// this will return AssedHandler
// used in the AssetEditRoute -> getMeteorData
export const getAssetWithContent2 = (id, onChange) => {
  let handler = cachedAssetHandlers.find(a => a.id === id)
  if (handler) {
    handler.update(onChange)
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
