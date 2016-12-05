import { Azzets } from '/imports/schemas'

export const fetchAndObserve = ((owner, name, onAssets, onChanges) => {
  // TODO(stauzs):
  //  * cache internally (requires refactoring in source Tools / ActorHelper)
  //  * addCheck to subscribe/observe only once per resource ( meteor does this internally )
  //  * make this function hybrid - ajax to get C2 and update on asset change
  const cachedSubscribers = {}

  return (owner, name, onAssets, onChanges, oldSubscription = null) => {
    const cursor = Azzets.find({dn_ownerName: owner, name: name})
    // from now on only observe asset and update tern on changes only

    const subscription = oldSubscription || {
      observer: null,
      getAssets: () => cursor.fetch(),
      subscription: null
    }

    let onReadyCalled = false
    subscription.subscription =  Meteor.subscribe("assets.public.owner.name", owner, name, {
      onStop: () => {
        console.log(`Stopped! assets.public.owner.name => ${owner}, ${name}`)
        subscription.observer && subscription.observer.stop()

        // Something internally in the Meteor makes subscription to stop even before it's ready
        // try again.. TODO: debug this further
        !onReadyCalled && fetchAndObserve(owner, name, onAssets, onChanges, subscription)
      },
      onReady: () => {
        onReadyCalled = true

        if(onChanges) {
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
})()

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

