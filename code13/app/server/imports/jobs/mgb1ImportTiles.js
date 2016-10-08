// The Actual TILE importer
// This should only be in server code

//  See definition of rva (retValAccumulator) in the
//    'job.import.mgb1.project' Meteor RPC defined in mgb1Importer.js

//  All rva.importParams have been pre-validated

//  Ignores excludeTiles flag (caller should have checked)

//  Avoid throwing Meteor.Error()


const getContent = (s3, s3Key) => {
  const getObjectSync = Meteor.wrapAsync(s3.getObject, s3)

  const modKey = s3Key.replace(/\+/g, ' ')
  var response = {}, savedError = {}
  try {
    response = getObjectSync({Bucket: 'JGI_test1', Key: modKey})
  }
  catch (err)
  {
    savedError = err
    console.log(`MGB1 getContent( ${s3Key} ) error: `, err)
  }
  return response
}


export const doImportTiles = (s3, rva, tileNames, keyPrefix ) => {

  const { mgb2ExistingProjectName, mgb2assetNamePrefix  } = rva.importParams
  console.log(`Preparing to import ${tileNames.length} MGB1 tiles into MGB2`)

  _.each(tileNames, tName => {

    const content = getContent(s3, keyPrefix+tName)
    const body = content.Body   // a Buffer
    const pngAsDataUri = 'data:image/png;base64,' + body.toString('base64')
    // check content.Metadata exists

    const c2 = {
      width:        parseInt(content.Metadata.width,  10),
      height:       parseInt(content.Metadata.height, 10),
      fps:          10,
      layerParams:  [ { name: 'Layer 1', isHidden: false, isLocked: false } ],
      frameNames:   [ 'Frame 1' ],
      frameData:    [ [ pngAsDataUri ] ],
      spriteData:   [ pngAsDataUri ],
      animations:   [ ],

      // Tileset info
      tileset:      pngAsDataUri,
      cols:         1,
      rows:         1
    }

    const newGraphicAsset = {
      createdAt:      content.LastModified ? new Date(content.LastModified) : undefined,
      projectNames:   [ mgb2ExistingProjectName ],
      name:           (mgb2assetNamePrefix + tName).replace(/\+/g, ' '),
      kind:           'graphic',
      text:           `Imported from MGB1 (${(keyPrefix + tName).replace(/\+/g, ' ')}) ${content.Metadata.comment}`,
      thumbnail:      pngAsDataUri,
      content2:       c2,
      isCompleted:    false,     // This supports the 'is stable' flag
      isDeleted:      false,     // This is a soft 'marked-as-deleted' indicator
      isPrivate:      false
    }

    Meteor.call('Azzets.create', newGraphicAsset)

  })
}
