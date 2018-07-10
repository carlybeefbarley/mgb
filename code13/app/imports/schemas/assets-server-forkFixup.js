import _ from 'lodash'
/**
 * Replaces oldOwner:assetName with newOwner:assetName
 * @param str - string that references asset e.g. newOwner:assetName
 * @param oldOwner - original asset owner
 * @param newOwner - user's name who is performing fork
 * @param assets - known assets (projects assets) - array with assetInfo {_id, name}
 *
 * @returns String - converted value
 */
const doFix = (str, oldOwner, newOwner, assets) => {
  // DropArea import: owner:assetName
  if (str.startsWith(`${oldOwner}:`)) {
    const assetName = str.substring(oldOwner.length + 1)
    if (_.find(assets, a => a.name === assetName)) {
      return newOwner + ':' + assetName
    }
  }

  // map references: /api/asset/png/stauzs/simple.sample.graphics
  if (str.startsWith(`/api/asset/png/${oldOwner}/`)) {
    const assetName = str.substring(`/api/asset/png/${oldOwner}/`.length)
    if (_.find(assets, a => a.name === assetName)) {
      return `/api/asset/png/${newOwner}/${assetName}`
    }
  }

  // TODO: DRY ? this and above is copy-pasta
  // map tileset: /api/asset/tileset/stauzs/simple.sample.graphics
  if (str.startsWith(`/api/asset/tileset/${oldOwner}/`)) {
    const assetName = str.substring(`/api/asset/tileset/${oldOwner}/`.length)
    if (_.find(assets, a => a.name === assetName)) {
      return `/api/asset/tileset/${newOwner}/${assetName}`
    }
  }
  return str
}

/**
 * Fixes parts where asset is referenced as string: owner:name
 * iterates objToFix props and changes oldOwner:xxxx to newOwner:xxxx
 *
 * @param objToFix - reference to object (usually it's content2)
 * @param oldOwner - original asset owner
 * @param newOwner - user's name who is performing fork
 * @param assets - known assets (projects assets) - array with assetInfo {_id, name}
 */
const quickAndDirtyFix = (objToFix, oldOwner, newOwner, assets) => {
  // is it safe to iterate Arrays this way???
  for (let i in objToFix) {
    if (i === '_ids') {
      delete objToFix[i]
      continue
    }
    const type = typeof objToFix[i]
    if (type === 'string') {
      const tmp = doFix(objToFix[i], oldOwner, newOwner, assets)
      if (objToFix[i] != tmp) {
        console.log(`FIXED: ${i} ${objToFix[i]} => ${tmp}`)
        objToFix[i] = tmp
      }
    } else if (type == 'object') quickAndDirtyFix(objToFix[i], oldOwner, newOwner, assets)
  }
}

/**
 * This function will try to fix asset references in the code
 * @param c2 - asset.content2
 * @param oldOwner - original asset owner
 * @param newOwner - user's name who is performing fork
 * @param assets - known assets (projects assets) - array with assetInfo {_id, name}
 */
/*

 a) fix case where asset is referenced only by name, but project doesn't contain asset - e.g. import css from '/libs.CSSLoader'
 1) look for [import * from '/assetName'] => [import '/assetName']
 2) if assetName ***IS NOT*** in the assets list - replace '/assetName' with '/oldOwner:assetName'

 b) similar to quickAndDirtyFix - make sure we are using new user project sources instead of oldOwner
 1) look for import * from '/oldOwner:assetName'
 2) if assetName ***IS*** in the assets list - replace with 'newOwner:assetName'


 */
const fixCodeAsset = (c2, oldOwner, newOwner, assets) => {
  c2.src = c2.src.replace(/(.*import .*\/)(.*)/g, (m, p1, p2) => {
    const trimmed = p2.trim()
    // remove last quote
    const importName = trimmed.substring(0, trimmed.length - 1)

    // B: owner:name
    if (importName.indexOf(':') > -1) {
      const parts = importName.split(':')
      if (parts[0] === oldOwner) {
        // NOTICE: real asset name is in the parts[1]
        if (_.find(assets, a => a.name === parts[1])) {
          // trimmed.substring(importName.length) - will contain correct closing quote
          return p1 + newOwner + ':' + parts[1] + trimmed.substring(importName.length)
        }
      }

      return p1 + p2
    }
    // A:
    if (!_.find(assets, a => a.name === importName)) {
      return p1 + oldOwner + ':' + p2
    }

    return p1 + p2
    // else edit code will pick up correct asset
  })
}

/**
 doFixupAssetReferences - Fixes asset references
 @param asset - reference to asset to be fixed
 @param oldOwner - original asset owner
 @param newOwner - user's name who is performing fork
 @param projectAssets - array with assetInfo {_id, name}
 */
export const doFixupAssetReferences = (asset, oldOwner, newOwner, projectAssets) => {
  switch (asset.kind) {
    case 'graphic':
    case 'tutorial':
    case 'sound':
    case 'music':
      break // These have no references to other assets
    case 'actor':
    case 'actormap':
    case 'map':
      quickAndDirtyFix(asset.content2, oldOwner, newOwner, projectAssets)
      break
    case 'game':
      quickAndDirtyFix(asset.metadata, oldOwner, newOwner, projectAssets)
      break
    case 'code':
      // TODO: what happens with bundle ????
      if (asset.content2 && asset.content2.src) {
        fixCodeAsset(asset.content2, oldOwner, newOwner, projectAssets)
      }
      break
  }
}
