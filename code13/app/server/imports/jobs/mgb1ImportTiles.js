// The Actual TILE importer
// This should only be in server code

//  See definition of rva (retValAccumulator) in the
//    'job.import.mgb1.project' Meteor RPC defined in mgb1Importer.js

//  All rva.importParams have been pre-validated

//  Ignores excludeTiles flag (caller should have checked)

//  Avoid throwing Meteor.Error()

const BUCKET = 'JGI_test1'

const _getAssetNames = (s3, mgb1Username, mgb1Projectname, kindStr) => {

  // This will use 
  //   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property

  const opParams = {
    Bucket: BUCKET,
    //ContinuationToken: 'STRING_VALUE',
    EncodingType: 'url',
    MaxKeys: 100,   // 1000 is the S3 max per batch
    Prefix: `${mgb1Username}/${mgb1Projectname}/${kindStr}/`
  }

  const prefixLen = opParams.Prefix.length
  var listObjectsV2Sync = Meteor.wrapAsync(s3.listObjectsV2, s3)
  var response = {}
  var assetKeys = []

  do
  {
    try {
      response = listObjectsV2Sync( opParams )
    }
    catch (err)
    {
      console.dir('MGB1 _getAssetNames  error: ', err)
      return null
    }
    assetKeys = assetKeys.concat(_.map(response.Contents, c => c.Key.slice(prefixLen)))
    if (response.IsTruncated)
    {
      opParams.ContinuationToken = response.NextContinuationToken
      console.log(`Getting more S3key batches for ${opParams.Prefix}.. ${assetKeys.length} so far`)
    }
  } while (response && response.IsTruncated)

  return assetKeys
}


export const doImportTiles = (s3, rva) => {
  const params = rva.importParams
  const tilePaths = _getAssetNames(s3, params.mgb1Username, params.mgb1Projectname, 'tile')

  console.log(`${tilePaths.length} results...`)
  console.dir(tilePaths)
}
