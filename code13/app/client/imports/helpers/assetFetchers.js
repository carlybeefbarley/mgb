import { Azzets } from '/imports/schemas'
import SpecialGlobals from '/imports/SpecialGlobals'
import {genetag} from '/imports/helpers/generators'


const ALLOW_OBSERVERS = SpecialGlobals.allowObservers

// getAssetWithContent2
// used by source tools and actor map
export const fetchAndObserve = (owner, name, kind, onAssets, onChanges, oldSubscription = null) => {
  const sel = {dn_ownerName: owner, name: name, isDeleted: false}
  // kind is not always known
  if(kind)
    sel.kind = kind


  const cursor = Azzets.find(sel)
  // from now on only observe asset and update asset on changes only
  const subscription = oldSubscription || {
      observer: null,
      getAssets: () => cursor.fetch(),
      subscription: null
    }

  let onReadyCalled = false
  subscription.subscription = Meteor.subscribe("assets.public.owner.name", owner, name, kind, {
    onStop: () => {

      subscription.observer && subscription.observer.stop()
      // Something internally in the Meteor makes subscription to stop even before it's ready
      // try again.. TODO: debug this further
      !onReadyCalled && fetchAndObserve(owner, name, kind, onAssets, onChanges, subscription)
    },
    onReady: () => {
      onReadyCalled = true

      if (ALLOW_OBSERVERS && onChanges) {
        subscription.observer = cursor.observeChanges({
          changed: (id, changes) => {
            onChanges(id, changes)
          }
        })
      }
      onAssets(null, cursor.fetch())
    },
    onError: (...args) => {
      console.log("Error:", name, ...args)
      onAssets(args)
    }
  })

  return subscription
}

// used by maps - to get notifications about image changes
export const observe = (selector, onReady, onChange = onReady, oldSubscription = null) => {
  // images in the map won't update
  if (!ALLOW_OBSERVERS) {
    return
  }
  const cursor = Azzets.find(selector)
  // from now on only observe asset and update tern on changes only

  const subscription = oldSubscription || {
      observer: null,
      getAssets: () => cursor.fetch(),
      subscription: null
    }

  let onReadyCalled = false
  subscription.subscription = Meteor.subscribe("assets.public.bySelector", selector, {
    onStop: () => {

      subscription.observer && subscription.observer.stop()
      // Something internally in the Meteor makes subscription to stop even before it's ready
      // try again.. TODO: debug this further
      !onReadyCalled && observe.apply(null, arguments)
    },
    onReady: () => {
      onReadyCalled = true
      subscription.observer = cursor.observeChanges({
        changed: (id, changes) => {
          onChange(id, changes)
        }
      })
      onReady()
    },
    onError: (...args) => {
      console.log("Error:", name, ...args)
    }
  })
  return subscription
}

export const fetchAssetByUri = uri => {
  return new Promise(function (resolve, reject) {
    mgbAjax(uri, (err, content) => {
      err ? reject(err) : resolve(content)
    })
  })
}

const ajaxCache = []
const getFromCache = (uri, etag) => {
  return ajaxCache.find(c => {return c.etag == etag && c.uri == uri})
}

const addToCache = (uri, etag, response) => {
  const cached = getFromCache(uri, etag)
  if(cached){
    cached.response = response
    cached.updated = Date.now()
  }
  else{
    ajaxCache.push({
      uri, etag, response, updated: Date.now()
    })
    ajaxCache.sort((a, b) => {
      a.updated < b.updated
    })
    if(ajaxCache.length > 20)
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

export const mgbAjax = (uri, callback, asset) => {
  const etag = asset ? genetag(asset) : null
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
  client.open('GET', uri)
  client.send()
  client.onload = function () {
    // ajax will return 200 even for 304 Not Modified
    if (this.status >= 200 && this.status < 300) {
      if(etag && this.getResponseHeader("etag")){
        addToCache(uri, etag, this.response)
      }
      callback(null, this.response)
    }
    else
      callback(this.statusText)
  }
  client.onerror = function (e) {
    callback(e, this.statusText)
  }
}

const fetchedAssets = []
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
      return ret.isReady
    },
    updateAsset(){
      let c2 = ret.asset.content2
      const asset = Azzets.findOne(ret.asset._id)
      if(asset){
        ret.asset = asset
        ret.asset.content2 = ret.asset.content2 ? ret.asset.content2 : c2
        c2 = ret.asset.content2

        ret.etag = genetag(ret.asset)
        ret.update()
      }

      // we still need latest asset fromDB
      Meteor.subscribe("assets.public.byId", id, {
        onReady: () => {
          const asset = Azzets.findOne(ret.asset._id)
          if(!asset){
            return
          }
          ret.asset = asset
          ret.asset.content2 = ret.asset.content2 ? ret.asset.content2 : c2
          // actually etag is not correct here
          // as there is small difference in timestamps
          // saved minimongo data and fetched new differs approx ~ 10ms
          ret.etag = genetag(ret.asset)
          ret.update()
        }
      })


    },
    update(){
      const c2 = ret.asset && ret.asset.content2
      const asset = Azzets.findOne(id)
      if(!asset){
        return
      }

      const etag = genetag(asset)
      if (etag == ret.etag) {
        ret.asset = asset
        ret.asset.content2 = ret.asset.content2 ? ret.asset.content2 : c2
        return
      }
      ret.etag = etag
      //ret.isReady = false
      fetchAssetByUri(asset.c2location || `/api/asset/content2/${id}`, etag)
        .then((data) => {
          const c2 = JSON.parse(data)
          const oldC2 = ret.asset.content2
          ret.isReady = true

          if (!_.isEqual(c2, oldC2)) {
            ret.asset = asset
            ret.asset.content2 = c2

            console.log("DOING full update")
            onReady && onReady()
          }
          else{
            console.log("Sources are equal.. preventing update!")
          }
        })
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
