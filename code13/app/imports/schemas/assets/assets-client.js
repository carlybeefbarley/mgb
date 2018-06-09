// Some client-side only utils for handling assets

/**
 * Simple helper to duplicate some nav-related info about an Asset.
 * The primary use case for this is how some pages that have an asset focus
 * (e.g. asset editors, play Game etc) will pass this info up to App.js so it
 * can be used to provide nav context in Breadcrumb bars, etc
 * 
 * Good god this is buried deep. This winds up being the ultimate source of truth of handleSetCurrentlyEditingAssetInfo
 *
 * @param {object} asset
 * @param {string} assetVerb.. e.g 'View', 'Edit', 'Play' etc
 */
export const makeAssetInfoFromAsset = (asset, assetVerb) => {
  console.log('THIS IS SO WEIRD AND BROKEN: ', asset)
  return {
    kind: asset.kind,
    name: asset.name,
    assetVerb,
    isDeleted: asset.isDeleted,
    isLocked: asset.isCompleted,
    projectNames: asset.projectNames || [],
    ownerName: asset.dn_ownerName,
    ownerId: asset.ownerId,
  }
}
