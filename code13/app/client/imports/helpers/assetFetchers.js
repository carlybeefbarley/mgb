import { Azzets } from '/imports/schemas'
import SpecialGlobals from '/imports/SpecialGlobals'
import {genetag} from '/imports/helpers/generators'


const ALLOW_OBSERVERS = SpecialGlobals.allowObservers

//  TODO:  make this function hybrid - ajax to get C2 and update on asset change
// used by source tools and actor map
export const fetchAndObserve = (owner, name, onAssets, onChanges, oldSubscription = null) => {
  const cursor = Azzets.find({dn_ownerName: owner, name: name})
  // from now on only observe asset and update tern on changes only

  const subscription = oldSubscription || {
      observer: null,
      getAssets: () => cursor.fetch(),
      subscription: null
    }

  let onReadyCalled = false
  subscription.subscription = Meteor.subscribe("assets.public.owner.name", owner, name, {
    onStop: () => {

      subscription.observer && subscription.observer.stop()
      // Something internally in the Meteor makes subscription to stop even before it's ready
      // try again.. TODO: debug this further
      !onReadyCalled && fetchAndObserve(owner, name, onAssets, onChanges, subscription)
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
export const observe = (id, cb, oldSubscription = null) => {
  // images in the map won't update
  if (!ALLOW_OBSERVERS) {
    return
  }
  const cursor = Azzets.find(id)
  // from now on only observe asset and update tern on changes only

  const subscription = oldSubscription || {
      observer: null,
      getAssets: () => cursor.fetch(),
      subscription: null
    }

  let onReadyCalled = false
  subscription.subscription = Meteor.subscribe("assets.public.byId.withContent2", id, {
    onStop: () => {

      subscription.observer && subscription.observer.stop()
      // Something internally in the Meteor makes subscription to stop even before it's ready
      // try again.. TODO: debug this further
      !onReadyCalled && observe(id, cb, subscription)
    },
    onReady: () => {
      onReadyCalled = true
      subscription.observer = cursor.observeChanges({
        changed: (id, changes) => {
          cb(id, changes)
        }
      })
    },
    onError: (...args) => {
      console.log("Error:", name, ...args)
    }
  })

  return subscription
}

export const fetchAssetByUri = (uri, etag = null) => {
  var promise = new Promise(function (resolve, reject) {
    var client = new XMLHttpRequest()
    client.open('GET', uri)
    // etag && client.setRequestHeader("etag", etag)
    client.send()
    client.onload = function () {
      if (this.status >= 200 && this.status < 300)
        resolve(this.response)  // Performs the function "resolve" when this.status is equal to 2xx
      else
        reject(this.statusText) // Performs the function "reject" when this.status is different than 2xx
    }
    client.onerror = function () {
      reject(this.statusText)
    }
  })
  return promise
}


const fetchedAssets = []
export const getAssetWithContent2 = (id, onReady) => {
  const c = fetchedAssets.find(a => a.id === id)
  if (c) {
    c.update()
    return c
  }

  const ret = {
    id: id,
    asset: null,
    isReady: false,
    ready(){
      return this.isReady
    },
    update(){
      const c2 = this.asset.content2
      const asset = Azzets.findOne(id)

      const etag = genetag(asset)
      if(etag == this.etag){
        this.asset = asset
        if(!this.asset.content2){
          this.asset.content2 = c2
        }
        console.log("Skipping update!")
        return
      }

      this.etag = etag
      //this.isReady = false
      fetchAssetByUri(this.asset.c2location || `/api/asset/content2/${id}`, etag)
        .then((data) => {
          this.asset = asset
          ret.asset.content2 = JSON.parse(data)
          ret.isReady = true
          onReady && onReady()
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
