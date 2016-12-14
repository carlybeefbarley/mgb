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
export const observe = (selector, cb, oldSubscription = null) => {
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
      !onReadyCalled && observe(selector, cb, subscription)
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

export const fetchAssetByUri = uri => {
  var promise = new Promise(function (resolve, reject) {
    var client = new XMLHttpRequest()
    client.open('GET', uri)
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
    updateAsset(){
      let c2 = this.asset.content2
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
          const asset = Azzets.findOne(this.asset._id)
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
    update(){
      const c2 = this.asset && this.asset.content2
      const asset = Azzets.findOne(id)
      if(!asset){
        return
      }

      const etag = genetag(asset)
      if (etag == this.etag) {
        this.asset = asset
        this.asset.content2 = this.asset.content2 ? this.asset.content2 : c2
        return
      }
      this.etag = etag
      //this.isReady = false
      fetchAssetByUri(asset.c2location || `/api/asset/content2/${id}`, etag)
        .then((data) => {
          const c2 = JSON.parse(data)
          const oldC2 = this.asset.content2
          this.isReady = true

          if (!_.isEqual(c2, oldC2)) {
            this.asset = asset
            this.asset.content2 = c2

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
