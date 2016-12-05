import { Azzets } from '/imports/schemas'
import SpecialGlobals from '/imports/SpecialGlobals'

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

