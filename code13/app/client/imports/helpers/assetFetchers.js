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
    if(!err)
      CDN_DOMAIN = cdnDomain
  })
})

// will convert local link e.g. /api/asset to //xxx.cloufront.com/api/asset?hash
export const makeCDNLink = (uri, etagOrHash = null) => {
  // if etag is not preset, then we will use Meteor autoupdateVersion - so we don't end up with outdated resource
  const hash = etagOrHash ? etagOrHash : (__meteor_runtime_config__ ? __meteor_runtime_config__.autoupdateVersion : Date.now())
  if(CDN_DOMAIN && uri.startsWith("/") && uri.substr(0, 2) != "//"){
    return `//${CDN_DOMAIN}${uri}?${hash}`
  }
  return uri
}

// project avatar url prefixed with CDN host
export const getProjectAvatarUrl = (p) => (
  makeCDNLink(getProjectAvatarUrlBasic(p))
)


// used by maps - to get notifications about image changes
export const observe = (selector, onReady, onChange = onReady, oldSubscription = null) => {
  // images in the map won't update
  const cursor = PartialAzzets.find(selector)
  // from now on only observe asset and update tern on changes only
  let onReadyCalled = false
  const subscription = oldSubscription || {
      observer: null,
      getAssets: () => cursor.fetch(),
      subscription: null,
      ready: () => onReadyCalled
    }


  subscription.subscription = Meteor.subscribe("assets.public.partial.bySelector", selector, {
    onStop: () => {

      subscription.observer && subscription.observer.stop()
      // Something internally in the Meteor makes subscription to stop even before it's ready
      // try again.. TODO: debug this further
      !onReadyCalled && observe(selector, onReady, onChange, subscription)
    },
    onReady: () => {
      onReadyCalled = true
      if (ALLOW_OBSERVERS) {
        subscription.observer = cursor.observeChanges({
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
  return subscription
}

export const fetchAssetByUri = (uri, allowCache) => {
  return new Promise(function (resolve, reject) {
    mgbAjax(uri, (err, content) => {
      err ? reject(err) : resolve(content)
    }, null, allowCache)
  })
}



const ajaxCache = []
const getFromCache = (uri, etag = null) => {
  return ajaxCache.find(c => {return (c.uri == uri && (etag ? c.etag == etag : true)) })
}

const addToCache = (uri, etag, response) => {
  const cached = getFromCache(uri, etag)
  if(cached){
    cached.response = response
    cached.lastAccessed = Date.now()
  }
  else{
    // check
    ajaxCache.push({
      uri, etag, response, lastAccessed: Date.now()
    })
    ajaxCache.sort((a, b) => a.lastAccessed < b.lastAccessed)
    if(ajaxCache.length > MAX_ASSET_CACHE_LENGTH)
      ajaxCache.shift()
  }
}
const removeFromCache = uri => {
  const index = ajaxCache.findIndex(c => c.uri === uri)
  if(index > -1){
    ajaxCache.splice(index, 1)
  }
}
// this function will try to make the best of etag
// asset param is optional - without it this function will work as normal ajax
// cached resources should save 100-1000 ms per request (depends on headers roundtrip)

export const mgbAjax = (uri, callback, asset, pullFromCache = false, onRequestOpen = null) => {
  if(pullFromCache === true){
    const cached = getFromCache(uri)
    if(cached){
      // remove from stack to maintain async behaviour
      setTimeout(() => {
        console.log("From cache")
        callback(null, cached.response)
      }, 0)
      return
    }
  }
  const etag = (asset && typeof asset === "object") ? genetag(asset) : null
  if(etag){
    const cached = getFromCache(uri, etag)
    if(cached){
      // remove from stack to maintain async behaviour
      setTimeout(() => {
        callback(null, cached.response)
      }, 0)
      return
    }
  }
  else{
    removeFromCache(uri)
  }
  const client = new XMLHttpRequest()
  const cdnLink = makeCDNLink(uri, etag)
  const usingCDN = uri == cdnLink
  client.open('GET', cdnLink)

  if(onRequestOpen){
    onRequestOpen(client)
  }
  client.send()
  client.onload = function () {
    // ajax will return 200 even for 304 Not Modified
    if (this.status >= 200 && this.status < 300) {
      if(etag && this.getResponseHeader("etag")){
        addToCache(uri, etag, this.response)
      }
      callback(null, this.response, client)
    }
    else{
      // try link without CDN
      if(usingCDN){
        console.log("CDN failed - trying local uri")
        mgbAjax(window.location.origin + uri, callback, asset, pullFromCache)
        return
      }
      callback(this.statusText)
    }
  }
  client.onerror = function (e) {
    if(usingCDN){
      console.log("CDN failed - trying local uri")
      mgbAjax(window.location.origin + uri, callback, asset, pullFromCache)
      return
    }
    callback(e, this.statusText)
  }
}

const fetchedAssets = []
// this will return asset wrapped in the
export const getAssetWithContent2 = (id, onReady) => {
  const c = fetchedAssets.find(a => a.id === id)
  if (c) {
    c.update()
    return c
  }
  // keep only 10 assets in memory
  if(fetchedAssets.length > 10){
    fetchedAssets.shift()
  }
  const ret = {
    id: id,
    asset: null,
    isReady: false,
    ready(){
      return this.isReady
    },
    updateAsset: function(){
      let c2 = ret.asset.content2
      const asset = Azzets.findOne(this.asset._id)
      if(asset){
        this.asset = asset
        this.asset.content2 = this.asset.content2 ? this.asset.content2 : c2
        c2 = this.asset.content2

        this.etag = genetag(this.asset)
        this.update()
      }

      // we still need latest asset fromDB
      Meteor.subscribe("assets.public.byId", id, {
        onReady: () => {
          const asset = Azzets.findOne(ret.asset._id)
          if(!asset){
            return
          }
          this.asset = asset
          this.asset.content2 = this.asset.content2 ? this.asset.content2 : c2
          // actually etag is not correct here
          // as there is small difference in timestamps
          // saved minimongo data and fetched new differs approx ~ 10ms
          this.etag = genetag(this.asset)
          this.update()
        }
      })
    },
    update: function(){
      const asset = Azzets.findOne(id)
      if(!asset){
        return
      }

      const c2 = this.asset && this.asset.content2
      const etag = genetag(asset)
      if (etag == this.etag) {
        this.asset = asset
        this.asset.content2 = this.asset.content2 ? this.asset.content2 : c2
        return
      }
      this.etag = etag
      //ret.isReady = false
      mgbAjax(asset.c2location || `/api/asset/content2/${id}`, (err, data) => {
        if(err){
          console.log("Failed to retrieve c2 for asset with id: ", id)
          return
        }
        const c2 = JSON.parse(data)
        const oldC2 = ret.asset ? this.asset.content2 : null
        this.isReady = true

        let needUpdate = false
        if (!_.isEqual(c2, oldC2)){
          this.asset = asset
          this.asset.content2 = c2
          needUpdate = true
        }
        else if(!_.isEqual(asset, this.asset)) {
          this.asset = asset
          this.asset.content2 = oldC2
          needUpdate = true
        }

        if(needUpdate){
          console.log("DOING full update")
          onReady && onReady()
        }
        else{
          console.log("Sources are equal.. preventing update!")
        }
      }, asset)
    }
  }
  fetchedAssets.push(ret)
  Meteor.subscribe("assets.public.byId", id, {
    onReady(){
      ret.asset = Azzets.findOne(id)
      ret.update()
    }
  })

  return ret
}
