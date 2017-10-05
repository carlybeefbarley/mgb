import _ from 'lodash'
import { Azzets } from '/imports/schemas'
import SpecialGlobals from '/imports/SpecialGlobals'
import { genetag } from '/imports/helpers/generators'
import { getProjectAvatarUrl as getProjectAvatarUrlBasic } from '/imports/schemas/projects'

// export so all required functions can be accesed only from assetFetchers
export { genetag }

// This browser/client will store partially fetched Azzets.
// PartialAssets because Meteor atm cannot merge assets recursively
// https://medium.com/@MaxDubrovin/workaround-for-meteor-limitations-if-you-want-to-sub-for-more-nested-fields-of-already-received-docs-eb3fdbfe4e07#.k76s2u4cs

const PartialAzzets = new Meteor.Collection('PartialAzzets')

const ALLOW_OBSERVERS = SpecialGlobals.allowObservers // Big hammer to disable it if we hit a scalability crunch (or could make it user-specific or sysvar)
const MAX_CACHED_ASSETHANDLERS = 10 // Max # of AssetHandlers that will be cached

// CDN_DOMAIN will be set at startup. See createCloudFront.js for the magic
let CDN_DOMAIN = ''
Meteor.startup(() => {
  Meteor.call('CDN.domain', (err, cdnDomain) => {
    if (!err) CDN_DOMAIN = cdnDomain
    /*
    // for CDN debugging only
    else
      CDN_DOMAIN = 'test.loc:3000' // any other domain that points to same machine (hosts hack)
    */
    console.log(`Using CDN: '${CDN_DOMAIN}'`)
  })
})

export const getCDNDomain = () => CDN_DOMAIN

/**
 * Converts uri to full url on CDN server (prefixes uri with CDN server)
 * @param uri - uri to convert
 * @param etagOrHash - used for cache bust
 * @param prefixDomainAlways - set this to force prefixing - even if CDN is not set it will add origin to the uri
 * @returns {String}
 */
export const makeCDNLink = (uri, etagOrHash = null, prefixDomainAlways = false) => {
  if (uri === undefined) {
    //throw new Error("UriIsNotDefined!")
    console.error('makeCDNLink - missing uri') // error for stack trace
    return
  }

  // received
  if (uri.indexOf('hash=') > 0) {
    //console.error("Already hashed link!", uri)
    return uri
  }
  // don't cache at all
  if (uri.startsWith('/api') && !etagOrHash) return CDN_DOMAIN ? `//${CDN_DOMAIN}${uri}` : uri

  // if etag is not preset, then we will use Meteor autoupdateVersion - so we don't end up with outdated resource
  const hash =
    etagOrHash != null
      ? etagOrHash
      : __meteor_runtime_config__ ? __meteor_runtime_config__.autoupdateVersion : Date.now()

  if (uri.startsWith('/') && !uri.startsWith('//')) {
    if (CDN_DOMAIN) {
      return `//${CDN_DOMAIN}${uri}?hash=${hash}`
    } else {
      if (__meteor_runtime_config__ && __meteor_runtime_config__.ROOT_URL) {
        // make sure we don't break http / https
        const root_host = __meteor_runtime_config__.ROOT_URL.split('//').pop()
        if (
          (!root_host.startsWith(window.location.host) && !root_host.startsWith('localhost')) ||
          prefixDomainAlways
        ) {
          return `${__meteor_runtime_config__.ROOT_URL}${uri}?hash=${hash}`
        }
      }
    }
    return CDN_DOMAIN ? `//${CDN_DOMAIN}${uri}?hash=${hash}` : uri + `?hash=${hash}`
  }

  return uri
}

export const makeExpireThumbnailLink = (
  assetOrId,
  maxAge = SpecialGlobals.thumbnail.defaultExpiresDuration,
) => {
  return typeof assetOrId === 'string'
    ? makeCDNLink(`/api/asset/cached-thumbnail/png/${maxAge}/${assetOrId}`, makeExpireTimestamp(maxAge))
    : // if we know asset - we can use etag to get updated version - which will be also updated when asset changes
      makeCDNLink(`/api/asset/thumbnail/png/${assetOrId._id}`, genetag(assetOrId))
}
/**
 * Generates CDN link to Graphic Asset
 * @param assetOrId - object representing asset or ID or owner/name
 * @param maxAge {int} - maximum amount of seconds fetched resource should be kept in the cache
 * @returns {string}
 */
// TODO: this function can be more universal
export const makeGraphicAPILink = (assetOrId, maxAge = SpecialGlobals.thumbnail.defaultExpiresDuration) => {
  return typeof assetOrId === 'string'
    ? makeCDNLink(`/api/asset/png/${assetOrId}`, makeExpireTimestamp(maxAge))
    : // if we know asset - we can use etag to get updated version - which will be also updated when asset changes
      makeCDNLink(`/api/asset/png/${assetOrId._id}`, genetag(assetOrId))
}

// This syncTime function is to help warn when a server and client have
// very different times.  Otherwise, it can be a confusing debug!
// TODO: Maybe use https://github.com/mizzao/meteor-timesync instead
let lastDiff = 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
const syncTime = () => {
  const emitted = Date.now()
  Meteor.call('syncTime', { now: emitted }, (err, date) => {
    lastDiff = Date.now() - date.now

    console.log(
      `[Timeslip check: Server->Client Diff = ${lastDiff}ms; Client->Server Diff = ${date.diff} ms]`,
    )
  })
  // sync every 15 minutes
  setTimeout(syncTime, 15 * 1000 * 60)
}
Meteor.startup(syncTime)

/**
 * Generates same timestamp for every maxAge seconds
 *
 * it will round timestamp to maxAge seconds
 * it's easier to understand with tens and fives, but it will work with any number
 * for example if maxAge is set to 10s - then return will be rounded to 10 * 1000 (four zeroes)
 * and makeExpireTimestamp will return same value for next 10 seconds
 * actually it can return different earlier for the first and second call,
 * but all next calls will get same value for next 10 seconds
 *
 * @param maxAge - in seconds
 * @returns {number} timestamp with next expire datetime
 */
export const makeExpireTimestamp = maxAge => {
  const now = Date.now() - lastDiff

  const maxAgeMS = maxAge * 1000 // 1000 because JS timestamps are in milliseconds
  return now - now % maxAgeMS + maxAgeMS
}

// project avatar url prefixed with CDN host
export const getProjectAvatarUrl = (p, expires = 60) =>
  // etag here is hardcoded - because we will receive asset which will stay very short period of time (1-60) minutes
  makeCDNLink(getProjectAvatarUrlBasic(p, expires), makeExpireTimestamp(SpecialGlobals.avatar.validFor))

// used by maps - to get notifications about image changes
// used by edit code - to get notification about imported source changes
// Note: very similar solution is used in the DropArea ( DropArea is mostly used by EditActor - to observe attached to actor images and other actors)
export const observeAsset = (selector, onReady, onChange = onReady, cachedObservable = null) => {
  // images in the map won't update
  const cursor = PartialAzzets.find(selector)
  // from now on only observe asset and call onChange only when asset has been changed
  let onReadyCalled = false
  let stopped = false
  const observable = cachedObservable || {
    observer: null,
    getAssets: () => cursor.fetch(),
    getAsset() {
      const assets = cursor.fetch()
      if (assets.length > 0) {
        return assets[0]
      }
      // throw error instead ????
      return null
    },
    subscription: null,
    ready: () => onReadyCalled && !stopped,
    stopped: () => stopped,
  }
  observable.subscription = Meteor.subscribe('assets.public.partial.bySelector', selector, {
    onStop() {
      observable.observer && observable.observer.stop()
      // Something internally in Meteor makes subscription stop even before it's ready
      // ..this is caused by subscriptions called in ReactGetMeteorData() - as they
      // automatically gets closed. Another fix is to remove from stack Meteor.subscribe..:( (DG says NO NO NO!)
      // TODO(@dgolds):See if there is another approach?
      if (!onReadyCalled) observeAsset(selector, onReady, onChange, observable)
      else stopped = true
    },
    onReady() {
      onReadyCalled = true
      if (ALLOW_OBSERVERS) {
        observable.observer = cursor.observeChanges({
          changed(id, changes) {
            onChange(id, changes)
          },
        })
      }
      onReady && onReady()
    },
    onError(...args) {
      console.log(' AssetFetcher:observe:observable:onError:', selector, ...args)
    },
  })
  return observable
}

export const getAssetBySelector = (selector, onReady) => {
  // get meteor data issue
  setTimeout(() => {
    const sub = Meteor.subscribe('assets.public.partial.bySelector', selector, {
      onReady() {
        const assets = PartialAzzets.find(selector).fetch()
        sub.stop()
        if (assets && assets.length) return onReady(assets[0])

        onReady(null)
      },
    })
  }, 0)
}

// fetchAssetByUri() will fetch Asset by uri via ajax - returns Promise
export const fetchAssetByUri = uri => {
  return new Promise(function(resolve, reject) {
    mgbAjax(
      uri,
      (err, content) => {
        err ? reject(err) : resolve(content)
      },
      null,
    )
  })
}

export const mgbAjax = (uri, callback, asset = null, onRequestOpen = null) => {
  const etag = asset && typeof asset === 'object' ? genetag(asset) : null
  const client = new XMLHttpRequest()
  const cdnLink = makeCDNLink(uri, etag)

  const isLocal = uri.startsWith('/') && !uri.startsWith('//')

  if (__meteor_runtime_config__ && __meteor_runtime_config__.ROOT_URL) {
    // make sure we don't break http / https
    const root_host = __meteor_runtime_config__.ROOT_URL.split('//').pop()
    if (isLocal && !root_host.startsWith(window.location.host) && !root_host.startsWith('localhost')) {
      return mgbAjax(cdnLink, callback, asset, onRequestOpen)
    }
  }

  const usingCDN = uri === cdnLink
  client.open('GET', cdnLink)

  if (onRequestOpen) onRequestOpen(client)

  client.onload = function() {
    // ajax will return 200 even for 304 Not Modified
    if (this.status >= 200 && this.status < 300) callback(null, this.response, client)
    else {
      // try link without CDN
      if (usingCDN && isLocal) {
        console.log('CDN failed - trying local uri:', uri)
        mgbAjax(window.location.origin + uri, callback, asset, onRequestOpen)
        return
      }
      callback(this.status, this.response, client)
    }
  }
  client.onerror = function(e) {
    if (usingCDN && isLocal) {
      console.log('CDN failed - trying local uri')
      mgbAjax(window.location.origin + uri, callback, asset, onRequestOpen)
      return
    }
    callback(e, this.statusText)
  }

  client.send()
}

/** Class representing an AssetHandler. */
class AssetHandler {
  /**
   * Create an AssetHandler.
   * @param {string} assetId - Asset Id.
   * @param {function} onChange - Callback when changes to asset or content2 occur - first time will be called on successful content2 acquisition.
   */
  constructor(assetId, onChange) {
    this.id = assetId
    this.onChange = onChange // TODO: Needs default for undefined? otherwise we have undefined/null which can cause errors if truthy comparisons aren't precise

    this.asset = null
    this.isReady = false
    this.update()
  }
  /**
   * Stop subscription - call this on component unmount
   */
  stop() {
    if (this.subscription) this.subscription.stop()
  }
  /**
   * Is assetHandler ready - similar to Meteor subscription ready()
   */
  ready() {
    return this.isReady
  }
  /**
   * is assetHandler loading
   */
  get loading() {
    return !this.isReady
  }
  /**
   * is assetDeleted?
   */
  get isDeleted() {
    return this.isReady && this.asset
  }

  // this method only updatea Asset meta info, but will skip content2
  /**
   * tell assetHandler to update Asset info - except content2
   * @param {function} onChange - Overwrite previous onChange callback
   */
  updateAsset(onChange = null) {
    if (onChange) this.onChange = onChange

    const asset = Azzets.findOne(this.id)
    // TODO: figure out what to do if we don't have asset in the DB - is it on it's way? or is it deleted?
    if (!asset) {
      if (this.isReady) {
        console.log('Asset is deleted!!!!')
      }
      return
    }
    // save previous content2
    asset.content2 = this.asset ? this.asset.content2 : null

    const etag = genetag(asset)
    if (this.etag !== etag && !asset.content2) this.etag = etag

    this.asset = asset
  }

  /**
   * tell assetHandler to do full update - Asset info AND content2
   * @param {function} onChange - Overwrite previous onChange callback
   * @param {updateObj} updateObj - last known object with content2
   * @see {@link https://github.com/devlapse/mgb/blob/10b8393ba61863a430af398392a726588a8c082a/code13/app/client/imports/routes/Assets/AssetEditRoute.js#L643} for more info.
   * assetHandler will try to update content2 from this object if etags will match
   */
  update(onChange = null, updateObj = null) {
    if (onChange) this.onChange = onChange

    const asset = Azzets.findOne(this.id)

    if (asset && updateObj && updateObj.assetId && this.id !== updateObj.assetId) {
      console.error('AssetFetchers update() detected stale write attempt')
      return
    }

    // save previous content2
    let oldC2 = this.asset ? this.asset.content2 : null

    // check if we can skip subscription and further ajax call for c2
    if (asset) {
      if (this.asset) {
        const etag = genetag(asset)
        if (this.etag === etag) {
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
        this.asset.content2 = updateObj
          ? updateObj.content2
          : this.asset.content2 ? this.asset.content2 : oldC2
        this.etag = genetag(this.asset)
      }
    }

    // user that has modified asset will have updateObj
    if (updateObj) {
      this.asset.content2 = updateObj.content2
    } else
      // viewer won't
      this.updateContent2(updateObj)

    if (this.subscription) this._onReady(updateObj)
    else {
      // without timeout subscription will end automatically right after it starts (ReactMeteorData.getMeteorData is responsible for that),
      // but we want to keep subscription active as long as user is checking out asset
      // NOTE: we are calling onReady only after ajax also has been loaded -
      // also without timeout getMeteorData will start infinite subscribe / unsubscribe loop - this is very very bad
      // getMeteorData is calling forceUpdate internally and it's called before render
      window.setTimeout(() => {
        // we still need latest asset fromDB
        this.subscription = Meteor.subscribe('assets.public.byId', this.id, {
          // onReady is called multiple times
          onReady: () => {
            // TODO: figure out what to do if we don't have asset in the DB - is it on it's way? or is it deleted?
            this._onReady(updateObj)

            const asset = Azzets.findOne(this.id)
            if (!asset) {
              console.log('Asset has been deleted')
              this.onChange && this.onChange()
            }
          },
          // onStop is called multiple times and then immediately is fired onReady again
          onStop: () => {
            console.log('Stopped Meteor subscription for', this.id)
            this.subscription = null
          },
        })
      }, 0)
    }
  }
  /**
   * tell assetHandler to do update content2 Object
   * @param {updateObj} updateObj - last known object with content2
   * @see {@link https://github.com/devlapse/mgb/blob/10b8393ba61863a430af398392a726588a8c082a/code13/app/client/imports/routes/Assets/AssetEditRoute.js#L643} for more info.
   */
  updateContent2(updateObj) {
    const asset = Azzets.findOne(this.id)
    if (!asset) return

    if (updateObj) {
      this.asset.content2 = updateObj.content2
      this.onChange && this.onChange()
      return
    }

    mgbAjax(
      asset.c2location || `/api/asset/content2/${this.id}`,
      (err, data) => {
        if (err) {
          console.log('updateContent2: Failed to retrieve c2 for asset with id: ', this.id, err)
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
        } else if (!_.isEqual(asset, this.asset)) {
          this.asset = asset
          this.asset.content2 = oldC2
          needUpdate = true
        }

        if (needUpdate) {
          // console.log("updateContent2() DOING full update")
          this.onChange && this.onChange()
        } else {
          console.log('updateContent2() Sources are equal.. preventing update!')
        }
      },
      asset,
    )
  }
  /**
   * this function is called after Meteor subscription becomes ready - or if subscription is already present, then it will be called immediately
   * this function will fetch new content2 if updateObj is not present
   * @param {updateObj} updateObj - last known object with content2
   * @see {@link https://github.com/devlapse/mgb/blob/10b8393ba61863a430af398392a726588a8c082a/code13/app/client/imports/routes/Assets/AssetEditRoute.js#L643} for more info.
   * assetHandler will try to update content2 from this object if etags will match
   */
  _onReady(updateObj) {
    // save previous content2
    let oldC2 = this.asset ? this.asset.content2 : null
    const asset = Azzets.findOne(this.id)
    // asset has been deleted???
    if (!asset) return

    if (this.asset) {
      const etag = genetag(asset)
      if (this.etag == etag) return
    }

    this.asset = asset
    this.asset.content2 = updateObj ? updateObj.content2 : oldC2
    // actually etag is not correct here (probably will be automatically fixed some day)
    // as there is small difference in the asset timestamp in server and client
    // saved minimongo data and fetched new differs approx ~ 10ms
    this.etag = genetag(this.asset)
    this.updateContent2(updateObj)
  }
}

const cachedAssetHandlers = []

// This is used in the AssetEditRoute -> getMeteorData and in the PlayGameRoute
/** @function
 * @name getAssetHandlerWithContent2 - factory function for AssetHandlers
 * this will return a (potentially cached or new) AssetHandler, not an Asset
 * */
export const getAssetHandlerWithContent2 = (id, onChange, forceFullUpdate = false) => {
  // stop other handler subscriptions - e.g. AssetRoute changed asset without calling unmount
  cachedAssetHandlers.forEach(h => h.id !== id && h.stop())
  let handler = cachedAssetHandlers.find(h => h.id === id)
  //
  if (handler) {
    handler.lastAccessed = Date.now()
    if (!forceFullUpdate) handler.update(onChange)
    else handler.updateAsset(onChange)
    return handler
  }
  // keep only MAX_CACHED_ASSETHANDLERS assets in memory (e.g. 10)
  if (cachedAssetHandlers.length > MAX_CACHED_ASSETHANDLERS) {
    // keep most recently accessed handlers at start
    cachedAssetHandlers.sort((a, b) => b.lastAccessed - a.lastAccessed)
    // pop is faster than shift
    handler = cachedAssetHandlers.pop()
    handler.stop()
  }
  handler = new AssetHandler(id, onChange)
  handler.lastAccessed = Date.now()
  cachedAssetHandlers.push(handler)
  return handler
}
