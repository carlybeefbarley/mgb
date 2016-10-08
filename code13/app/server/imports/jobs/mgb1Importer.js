import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { doImportTiles } from './mgb1ImportTiles'
import { doImportActors } from './mgb1ImportActors'
import { doImportMaps } from './mgb1ImportMaps'

// This should only be in server code

import AWS from 'aws-sdk'
const aws_s3_region = 'us-east-1'       // US-East-1 is the 'global' site for S3
AWS.config.update({accessKeyId: '104QCDA4V07YPPSVBKG2', secretAccessKey: 'QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn'});


const _importParamsSchema = {

  mgb1Username:           String,     // Must exist
  mgb1Projectname:        String,     // Must exist
  mgb2Username:           String,     // Must exist and be current user for RPC
  mgb2ExistingProjectName:String,     // Must exist and be project of user for RPC
  mgb2assetNamePrefix:    String,     // Cannot be ''. Recommended to use '.' as a separator and terminator
  excludeTiles:           Boolean,    // if true, do not consider tiles
  excludeActors:          Boolean,    // if true, do not consider actors
  excludeMaps:            Boolean,    // if true, do not consider maps
  isDryRun:               Boolean     // if true, do nothing, just return ids/stats
}

Meteor.methods({
  'job.import.mgb1.project': function( importParams ) {
    let thisUser = this.user && this.user()

    // MAGIC TEST HACK   ##insecure##
    //  meteor shell  
    //  > Meteor.call('job.import.mgb1.project', 42)    
    //
    if (importParams === 42)
    {
      importParams = {
        mgb1Username:           'foo',
        mgb1Projectname:        'project1',
        mgb2Username:           'dgolds',
        mgb2ExistingProjectName:'Junk',
        mgb2assetNamePrefix:    'junk.',
        excludeTiles:           false,
        excludeActors:          true,
        excludeMaps:            true,
        isDryRun:               true
      }
      thisUser = { profile: { name: 'dgolds' } }
    }
    //// END HACK /////

    // Param validations - these must throw Meteor.Error on failures
    _checkAllParams(importParams, thisUser)

    // Ok, not completely crazy, so unblock other equests for this client since it may take a while.. 
    this.unblock()

    // The following data will be used for the return value info
    const retValAccumulator = {
      importParams:               importParams,
      assetIdsAdded:              [],   // Mgb2 Asset ids - those where the prior asset name did not exist (including isDeleted=true and isDeleted=false)
      assetIdsUpdated:            [],   // Mgb2 Asset ids - those where the prior asset name did exist (including isDeleted=true and isDeleted=false)
      mgb1AssetsFailedToConvert:  []    // Array of { name: string, reason: string}.. For name, use Mgb1 Asset names - [type]/name.. eg. 'map/my map 1'
    }

    let s3 = new AWS.S3({region: aws_s3_region, maxRetries: 3})

    // From now on AVOID THROWING. Instead use retValAccumulator.mgb1AssetsFailedToConvert

    const getS3KeyPrefix = kind => `${importParams.mgb1Username}/${importParams.mgb1Projectname}/${kind}/`

    if (!importParams.excludeTiles)
    {
      const kp = getS3KeyPrefix('tile')
      doImportTiles(s3, retValAccumulator, _getAssetNames(s3, kp), kp)
    }

    // if (!importParams.excludeActors)
    //   doImportActors(s3, retValAccumulator, getAssetNamesForKind('tile'))   

    // if (!importParams.excludeMaps)
    //   doImportMaps(s3, retValAccumulator, getAssetNamesForKind('map')) 
    
    return retValAccumulator
  }
})


// Asset key lister

const _getAssetNames = (s3, keyPrefix) => {

  // This will use 
  //   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property

  const opParams = {
    Bucket: 'JGI_test1',
    //ContinuationToken: 'STRING_VALUE',
    EncodingType: 'url',
    MaxKeys: 100,   // 1000 is the S3 max per batch. Chose 100 so fast, but still tests looping/continuation
    Prefix: keyPrefix
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


// Validations - TRUST NO ONE

const _checkAllParams = (importParams, thisUser) =>
{
  check(importParams, _importParamsSchema)
  checkAssetNamePrefix(importParams)
  _checkUserRights(importParams, thisUser)
  _checkMgb1ProjectExists(importParams)
  _checkMgb2ProjectExists(importParams)
  _checkImportingAtLeastOneAssetType(importParams)
}


const _checkUserRights = (params, thisUser) =>
{
  if (!thisUser)
    throw new Meteor.Error(401, "Login required")
  if (thisUser.profile.name !== params.mgb2Username) 
    throw new Meteor.Error(401, "Only Project Owners can perform bulk imports")  
}

const _checkMgb1ProjectExists = params => { 
  // TODO. Throw on failure
}

const _checkMgb2ProjectExists = params => { 
  // TODO. Throw on failure
}

const _checkImportingAtLeastOneAssetType = params => {
  if (params.excludeTiles && params.excludeActors && params.excludeMaps)
    throw new Meteor.Error(401, "Login required")
}

const checkAssetNamePrefix = params => {
  if (params.mgb2assetNamePrefix.length < 1)
    throw new Meteor.Error(500, "mgb2assetNamePrefix required")
}
