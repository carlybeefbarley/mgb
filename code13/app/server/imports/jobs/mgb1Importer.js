import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { doImportTile } from './mgb1import/mgb1ImportTiles'
import { doImportActor } from './mgb1import/mgb1ImportActors'
import { doImportMap } from './mgb1import/mgb1ImportMaps'

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
    //  Client browser.. JS console..  
    //  > Meteor.call('job.import.mgb1.project', 42)
    //

///* for import of Two Cities project
    if (importParams === 42)
    {
      console.log('The meaning of life!)')
      importParams = {
        mgb1Username:           'azurehaze',
        mgb1Projectname:        'importTest',              //   'mechanics demos',
        mgb2Username:           'bouhm',
        mgb2ExistingProjectName:'importTest',              //'Game Mechanics demo',
        mgb2assetNamePrefix:    'it.',
        excludeTiles:           false,
        excludeActors:          false,
        excludeMaps:            false,
        isDryRun:               false
      }
    }
    thisUser = { profile: { name: 'bouhm' } }
      
//*/      
      //   importParams = {
      //     mgb1Username:           'azurehaze',
      //     mgb1Projectname:        'Galactic Combat',    //   'mechanics demos',
      //     mgb2Username:           'dgolds',
      //     mgb2ExistingProjectName:'Galactic Combat',    //   'Game Mechanics demo',
      //     mgb2assetNamePrefix:    'galco.',
      //     excludeTiles:           false,
      //     excludeActors:          false,
      //     excludeMaps:            false,
      //     isDryRun:               false
      //   }
      //   thisUser = { profile: { name: 'dgolds' } }
      // }
    //// END HACK /////

    // Param validations - these must throw Meteor.Error on failures
    _checkAllParams(importParams, thisUser)

    // Ok, not completely crazy, so unblock other requests for this client since it may take a while.. 
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

    const doImport = (mgb1Kind, importFunction) => {
      const kp = `${importParams.mgb1Username}/${importParams.mgb1Projectname}/${mgb1Kind}/`
      const assetNames = _getAssetNames(s3, kp)
      console.log(`Preparing to ${importParams.isDryRun ? 'DRYRUN' : ''} import ${assetNames.length} MGB1 ${mgb1Kind}s into MGB2`)
      _.each(assetNames, aName => {
        const fullS3Name = (kp+aName).replace(/\+/g, ' ')
console.log(fullS3Name)
        const assetName = aName.replace(/\+/g, ' ')
        const content = getContent(s3, fullS3Name)
        content.Metadata._tileDataUri = ''
        if (mgb1Kind === 'actor')
        {
          const tileS3KeyPrefix = `${importParams.mgb1Username}/${importParams.mgb1Projectname}/tile/`
          let tileResponse = getContent(s3, tileS3KeyPrefix+content.Metadata.tilename)
          if (tileResponse && tileResponse.Body)
          {
            const pngAsDataUri = 'data:image/png;base64,' + tileResponse.Body.toString('base64')
            content.Metadata._tileDataUri = pngAsDataUri
          }
        }
          
        importFunction(content, retValAccumulator, fullS3Name, assetName)
        //TODO-> update retValAccumulator 
      })
    }

    if (!importParams.excludeTiles)
      doImport( 'tile', doImportTile)

    if (!importParams.excludeActors)
      doImport( 'actor', doImportActor)

    if (!importParams.excludeMaps)
      doImport( 'map', doImportMap)
    
    return retValAccumulator
  }
})


// get an S3 object. expects any + characters to have been replaced with +
const getContent = (s3, s3Key) => {
  const getObjectSync = Meteor.wrapAsync(s3.getObject, s3)

  var response = {}, savedError = {}
  try {
    response = getObjectSync({Bucket: 'JGI_test1', Key: s3Key})
  }
  catch (err)
  {
    savedError = err
    console.log(`MGB1 getContent( ${s3Key} ) error: `, err)
  }
  return response
}


// Asset key lister. Note that spaces in names are returned as '+'. 
// Stupid S3

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
console.log("a")
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
