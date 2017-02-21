import { Azzets } from '/imports/schemas'
import { assetMakeSelector, allSorters } from '/imports/schemas/assets'

//   aZZets !?
//     ...Note that Meteor has a special reserved global "Assets" so we call these Azzets instead

//
//   ASSETS Publications
//


/**
 * Can see all assets, but does NOT include the big 'content2' field
 * @param userId can be undefined or -1 .. indicating don't filter by user if
 * @param selectedAssetKinds is an array of AssetKindsKeys strings
 * @param nameSearch is going to be stuffed inside a RegEx, so needs to be clean
 *    TODO: cleanse the nameSearch RegExp
 */
Meteor.publish('assets.public', function(
                                    userId,
                                    selectedAssetKinds,
                                    nameSearch,
                                    projectName=null,
                                    showDeleted=false,
                                    showStable=false,
                                    assetSortType=undefined,    // one of the keys of allSorters
                                    limitCount=50)
{
  let selector = assetMakeSelector(userId,
                      selectedAssetKinds,
                      nameSearch,
                      projectName,
                      showDeleted,
                      showStable)
  let assetSorter = assetSortType ? allSorters[assetSortType] : allSorters["edited"]
  const findOpts = {
    fields: {content2: 0, thumbnail: 0},
    sort:  assetSorter,
    limit: limitCount
  }
  return Azzets.find(selector, findOpts )
})

// Observe assets only -
//   TODO: add limit count?
//   TODO: Add to DDP Rate Limiter list?
// https://medium.com/@MaxDubrovin/workaround-for-meteor-limitations-if-you-want-to-sub-for-more-nested-fields-of-already-received-docs-eb3fdbfe4e07#.k76s2u4cs
// selector can be an   id STRING  _or_ an object containing {.dn_OwnerName, .kind, .name }
Meteor.publish('assets.public.partial.bySelector', function(selector) {
  const cleanSelector = typeof selector === "object" ? {dn_ownerName: selector.dn_ownerName, kind: selector.kind, name: selector.name } : selector

  // TODO(@stauzs) Should server look for deleted assets? What about asset editors?
  const cursor = Azzets.find(cleanSelector, {fields: {updatedAt: 1, name: 1, kind: 1, dn_ownerName: 1, isDeleted: 1}})
  // Publish to another client Collection - as partial data will interfere with the
  //   Azzets collection on the client side (Meteor miniMongo)
  //   (@stauzs) I know - this is ugly, but seems that there is no better solution
  //   TODO(@dgolds): Research and review to see if there was a better way.
  Mongo.Collection._publishCursor(cursor, this, 'PartialAzzets')
  this.ready()
})

// Return one asset info only.
Meteor.publish('assets.public.byId', function(assetId) {
  return Azzets.find(assetId, {fields: {content2: 0}})
})

// Return one asset. This is a good subscription for AssetEditRoute
// Removed - as c2 is fetched and cached via ajax / cdn combo
Meteor.publish('assets.public.byId.withContent2', function(assetId) {
  console.error("DEPRECATED: assets.public.byId.withContent2 has been removed. How is this even being invoked!?")
  return null
})


Meteor.publish('assets.public.owner.name', function(owner, name, kind) {
  const sel = {dn_ownerName: owner, name: name, kind: kind, isDeleted: false}
  return Azzets.find(sel,  {fields: {content2: 0, thumbnail: 0}})
})


//
//   ASSETS Indexes!?
//


// I originally created this so we can support $text queries on name,
// but now we are using regex, it's not clear it is of value
// TODO: Consider cost/benefit of this index.. VERY PROBABLY DELETE THIS INDEX
Azzets._ensureIndex({
  "name": "text"        // Index the name field. See https://www.okgrow.com/posts/guide-to-full-text-search-in-meteor
})

Azzets._ensureIndex( {"isDeleted": 1, "updatedAt": -1})
Azzets._ensureIndex( {"isDeleted": 1, "kind": 1})
Azzets._ensureIndex( {"isDeleted": 1, "name": 1, "kind": 1})
Azzets._ensureIndex( {"isDeleted": 1, "name": 1, "updatedAt": -1})
Azzets._ensureIndex( {"isDeleted": 1, "kind": 1, "updatedAt": -1})
Azzets._ensureIndex( {"isDeleted": 1, "ownerId": 1, "kind": 1, "updatedAt": -1})
Azzets._ensureIndex( {"isDeleted": 1, "dn_ownerName": 1, "name": 1, "kind": 1})
