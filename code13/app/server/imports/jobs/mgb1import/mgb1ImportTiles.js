import validate from '/imports/schemas/validate'

// The Actual TILE importer
// This should only be in server code

//  See definition of rva (retValAccumulator) in the
//    'job.import.mgb1.project' Meteor RPC defined in mgb1Importer.js

//  All rva.importParams have been pre-validated

//  Ignores excludeTiles flag (caller should have checked)

//  Avoid throwing Meteor.Error()

export const doImportTile = (content, rva, fullS3Name, assetName) => {
  const { mgb2NewProjectName, mgb2assetNamePrefix, isDryRun } = rva.importParams
  const { Body, Metadata, LastModified } = content // Body is of type Buffer
  const pngAsDataUri = 'data:image/png;base64,' + Body.toString('base64')
  // check content.Metadata exists

  const c2 = {
    width: parseInt(Metadata.width, 10),
    height: parseInt(Metadata.height, 10),
    fps: 10,
    layerParams: [{ name: 'Layer 1', isHidden: false, isLocked: false }],
    frameNames: ['Frame 1'],
    frameData: [[pngAsDataUri]],
    spriteData: [pngAsDataUri],
    animations: [],

    // Tileset info
    tileset: pngAsDataUri,
    cols: 1,
    rows: 1,
  }

  const newAsset = {
    createdAt: LastModified ? new Date(LastModified) : undefined,
    projectNames: [mgb2NewProjectName],
    name: mgb2assetNamePrefix + assetName,
    kind: 'graphic',
    text: `Imported from MGB1 (${fullS3Name}) ${Metadata.comment}`,
    thumbnail: pngAsDataUri,
    content2: c2,
    workState: 'working',
    assetLicense: 'CC-BY-NC-4.0',
    isCompleted: false, // This supports the 'is stable' flag
    isDeleted: false, // This is a soft 'marked-as-deleted' indicator
    isPrivate: false,
  }

  //console.log(newAsset)

  if (!validate.assetName(newAsset.name)) {
    newAsset.text.replace(/[#:?]/g, '')
    newAsset.text = newAsset.text.length > 64 ? newAsset.text.slice(0, 63) : newAsset.text
  }

  if (!validate.assetDescription(newAsset.text)) {
    newAsset.text = newAsset.text.slice(0, 116) + '...'
  }

  let newTileAssetId = null
  if (!isDryRun) newTileAssetId = Meteor.call('Azzets.create', newAsset)

  return newTileAssetId
}
