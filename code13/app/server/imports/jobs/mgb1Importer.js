import _ from 'lodash'
import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { doImportTile } from './mgb1import/mgb1ImportTiles'
import { doImportActor } from './mgb1import/mgb1ImportActors'
import { doImportMap } from './mgb1import/mgb1ImportMaps'
import { Projects } from '/imports/schemas'

// This should only be in server code

import AWS from 'aws-sdk'
const aws_s3_region = 'us-east-1' // US-East-1 is the 'global' site for S3
AWS.config.update({
  accessKeyId: '104QCDA4V07YPPSVBKG2',
  secretAccessKey: 'QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn',
})

const _importParamsSchema = {
  mgb1Username: String, // Must exist
  mgb1Projectname: String, // Must exist
  mgb2Username: String, // Must exist and be current user for RPC
  mgb2NewProjectName: String, // Must NOT exist as a project of user for RPC
  mgb2assetNamePrefix: String, // Cannot be ''. Recommended to use '.' as a separator and terminator
  excludeTiles: Boolean, // if true, do not consider tiles
  excludeActors: Boolean, // if true, do not consider actors
  excludeMaps: Boolean, // if true, do not consider maps
  isDryRun: Boolean, // if true, do nothing, just return ids/stats
}

Meteor.methods({
  // retrieve array of MGB1 project names under the named MGB1 account
  'mgb1.getProjectNames'(mgb1Username) {
    // if (!this.userId)
    //   throw new Meteor.Error(500, "Not logged in")

    let s3 = new AWS.S3({ region: aws_s3_region, maxRetries: 3 })
    return { projectNames: _getS3ProjectNames(s3, mgb1Username) }
  },
})

Meteor.methods({
  'job.import.mgb1.project'(importParams) {
    if (!this.userId) throw new Meteor.Error(401, 'Must be logged in to request import')

    let thisUser = Meteor.user()
    //
    // Param validations - these must throw Meteor.Error() on failures
    _checkAllParams(importParams, thisUser)

    // Check mgb1 project exists
    let s3 = new AWS.S3({ region: aws_s3_region, maxRetries: 3 })
    const projectNames = _getS3ProjectNames(s3, importParams.mgb1Username)
    if (!_.includes(projectNames, importParams.mgb1Projectname))
      throw new Meteor.Error(
        404,
        `MGB1 project ${importParams.mgb1Username}/${importParams.mgb1Projectname} Not found`,
      )

    // TODO: Check that project is in a validated MGB1 account for this users
    // TODO: basically confirm that _.includes(_.split(Meteor.user().profile.mgb1namesVerified), importParams.mgb1Projectname)

    // Attempt to create MGB2 project
    const newProjData = {
      name: importParams.mgb2NewProjectName,
      description: `Imported from MGB1 user '${importParams.mgb1Username}/${importParams.mgb1Projectname}`,
      mgb1: {
        mgb1username: importParams.mgb1Username,
        mgb1ProjectName: importParams.mgb1Projectname,
        mgb2assetNamePrefix: importParams.mgb2assetNamePrefix,
        importInitiator: Meteor.user().userName,
        importProgress: 'started', // I can use 'scheduled' later as a queue :)
      },
    }
    const newProjectId = Meteor.call('Projects.create', newProjData) // This will throw on failure

    // Nothing threw? Cool... not a completely crazy request,
    // so unblock to allow other Meteor.call() requests for this client
    // since it may take a while..
    this.unblock()

    // The following data will be used for the return value info
    const retValAccumulator = {
      importParams,
      newProjectId,
      assetIdsAdded: [], // Mgb2 Asset ids - those where the prior asset name did not exist (including isDeleted=true and isDeleted=false)
      assetIdsUpdated: [], // Mgb2 Asset ids - those where the prior asset name did exist (including isDeleted=true and isDeleted=false)
      mgb1AssetsFailedToConvert: [], // Array of { name: string, reason: string}.. For name, use Mgb1 Asset names - [type]/name.. eg. 'map/my map 1'
    }

    // From now on AVOID THROWING. Instead use retValAccumulator.mgb1AssetsFailedToConvert so we get nice bulk results for user

    const doImport = (mgb1Kind, importFunction) => {
      const kp = `${importParams.mgb1Username}/${importParams.mgb1Projectname}/${mgb1Kind}/`
      _updateMgb1ImportProgressTxt(newProjectId, `Counting ${mgb1Kind}s`)
      const assetNames = _getAssetNames(s3, kp)
      _updateMgb1ImportProgressTxt(newProjectId, `Importing ${assetNames.length} ${mgb1Kind}s`)

      console.log(
        `Preparing to ${importParams.isDryRun
          ? 'DRYRUN'
          : ''} import ${assetNames.length} MGB1 ${mgb1Kind}s into MGB2`,
      )
      _.each(assetNames, aName => {
        const fullS3Name = (kp + aName).replace(/\+/g, ' ')
        console.log(`Getting asset '${aName}' from S3: `, fullS3Name)
        const assetName = aName.replace(/\+/g, ' ')
        const content = getContent(s3, fullS3Name)
        content.Metadata._tileDataUri = ''
        if (mgb1Kind === 'actor') {
          const tileS3KeyPrefix = `${importParams.mgb1Username}/${importParams.mgb1Projectname}/tile/`
          let tileResponse = getContent(s3, tileS3KeyPrefix + content.Metadata.tilename)
          if (tileResponse && tileResponse.Body) {
            const pngAsDataUri = 'data:image/png;base64,' + tileResponse.Body.toString('base64')
            content.Metadata._tileDataUri = pngAsDataUri
          }
        }

        importFunction(content, retValAccumulator, fullS3Name, assetName)
        //TODO-> update retValAccumulator
      })
    }

    if (!importParams.excludeTiles) doImport('tile', doImportTile)

    if (!importParams.excludeActors) doImport('actor', doImportActor)

    if (!importParams.excludeMaps) doImport('map', doImportMap)

    const resultMsg =
      'Completed. ' +
      (retValAccumulator.assetIdsAdded.length > 0
        ? `Added ${retValAccumulator.assetIdsAdded.length} assets. `
        : '') +
      (retValAccumulator.assetIdsUpdated.length > 0
        ? `Updated ${retValAccumulator.assetIdsUpdated.length} assets. `
        : '') +
      (retValAccumulator.mgb1AssetsFailedToConvert.length > 0
        ? `Could not convert: ${retValAccumulator.mgb1AssetsFailedToConvert.length} assets. `
        : '')
    _updateMgb1ImportProgressTxt(newProjectId, resultMsg)

    return retValAccumulator
  },
})

// get an S3 object. expects any + characters to have been replaced with +
const getContent = (s3, s3Key) => {
  const getObjectSync = Meteor.wrapAsync(s3.getObject, s3)

  var response = {},
    savedError = {}
  try {
    response = getObjectSync({ Bucket: 'JGI_test1', Key: s3Key })
  } catch (err) {
    savedError = err
    console.log(`MGB1 getContent( ${s3Key} ) error: `, err)
  }
  return response
}

/**
 * User Project name lister
 * Uses AWS JS SDK: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property
 * In the returned array of project name strings, this function will 
 *   replace + chars with space chars (' '), 
 *   remove leading & trailing / chars
 *   remove the pseudo-project name '-' which was used for user settings.
 * An example response would be [ 'projectName 1', 'proj2' ]
 */
const _getS3ProjectNames = (s3, userName) => {
  const keyPrefix = userName + '/'
  const opParams = {
    Bucket: 'JGI_test1',
    //ContinuationToken: 'STRING_VALUE',
    Delimiter: '/',
    EncodingType: 'url',
    MaxKeys: 500, // 1000 is the S3 max per batch. Chose 500 so fast, but still tests looping/continuation
    Prefix: keyPrefix,
  }

  const prefixLen = opParams.Prefix.length
  var listObjectsV2Sync = Meteor.wrapAsync(s3.listObjectsV2, s3)
  var response = {}
  var projectNames = []

  do {
    try {
      response = listObjectsV2Sync(opParams)
    } catch (err) {
      console.dir('MGB1 _getS3ProjectNames  error: ', err)
      return null
    }
    projectNames = projectNames.concat(
      _.map(response.CommonPrefixes, c => c.Prefix.slice(prefixLen, -1).replace(/\+/g, ' ')),
    )
    if (response.IsTruncated) {
      opParams.ContinuationToken = response.NextContinuationToken
      console.log(`Getting more S3key batches for ${opParams.Prefix}.. ${projectNames.length} so far`)
    }
  } while (response && response.IsTruncated)

  return _.without(projectNames, '-') // Is a special 'folder' in MGB user accounts for settings and stuff
}

/**
 *  Asset key lister. 
 * Uses AWS JS SDK: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property
 * Note that spaces in names are returned by S3 as '+'  ...Stupid S3!
 */
const _getAssetNames = (s3, keyPrefix) => {
  const opParams = {
    Bucket: 'JGI_test1',
    //ContinuationToken: 'STRING_VALUE',
    EncodingType: 'url',
    MaxKeys: 100, // 1000 is the S3 max per batch. Chose 100 so fast, but still tests looping/continuation
    Prefix: keyPrefix,
  }

  const prefixLen = opParams.Prefix.length
  var listObjectsV2Sync = Meteor.wrapAsync(s3.listObjectsV2, s3)
  var response = {}
  var assetKeys = []

  do {
    try {
      response = listObjectsV2Sync(opParams)
    } catch (err) {
      console.dir('MGB1 _getAssetNames  error: ', err)
      return null
    }
    assetKeys = assetKeys.concat(_.map(response.Contents, c => c.Key.slice(prefixLen)))
    if (response.IsTruncated) {
      opParams.ContinuationToken = response.NextContinuationToken
      console.log(`Getting more S3key batches for ${opParams.Prefix}.. ${assetKeys.length} so far`)
    }
  } while (response && response.IsTruncated)

  return assetKeys
}

// Validations - TRUST NO ONE

const _checkAllParams = (importParams, thisUser) => {
  check(importParams, _importParamsSchema)
  checkAssetNamePrefix(importParams)
  _checkUserRights(importParams, thisUser)
  _checkImportingAtLeastOneAssetType(importParams)
}

const _checkUserRights = (params, thisUser) => {
  if (!thisUser) throw new Meteor.Error(401, 'Use login required')
  if (thisUser.profile.name !== params.mgb2Username)
    throw new Meteor.Error(401, 'Only Project Owners can perform bulk imports to a project')
}

const _checkImportingAtLeastOneAssetType = params => {
  if (params.excludeTiles && params.excludeActors && params.excludeMaps)
    throw new Meteor.Error(401, 'Must import at least one asset type')
}

const checkAssetNamePrefix = params => {
  if (params.mgb2assetNamePrefix.length < 1) throw new Meteor.Error(500, 'mgb2assetNamePrefix required')
}

const _updateMgb1ImportProgressTxt = (mgb2ProjectId, newProgressTxt) => {
  console.log('Import progress: ', newProgressTxt)
  Projects.update({ _id: mgb2ProjectId }, { $set: { 'mgb1.importProgress': newProgressTxt } })
}
