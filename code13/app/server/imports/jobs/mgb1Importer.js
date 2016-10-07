import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { doImportTiles } from './mgb1ImportTiles'
import { doImportActors } from './mgb1ImportActors'
import { doImportMaps } from './mgb1ImportMaps'

// This should only be in server code

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
    const thisUser = this.user()

    // Param validations - these must throw Meteor.Error on failures
    _checkAllParams(importParams, thisUser)

    // This data will be used for the return value info
    const retValAccumulator = {
      importParams:               importParams,
      assetIdsAdded:              [],   // Mgb2 Asset ids - those where the prior asset name did not exist (including isDeleted=true and isDeleted=false)
      assetIdsUpdated:            [],   // Mgb2 Asset ids - those where the prior asset name did exist (including isDeleted=true and isDeleted=false)
      mgb1AssetsFailedToConvert:  []    // Array of { name: string, reason: string}.. For name, use Mgb1 Asset names - [type]/name.. eg. 'map/my map 1'
    }

    // From now on AVOID THROWING. Instead use retValAccumulator.mgb1AssetsFailedToConvert
    if (!importParams.excludeTiles)
      doImportTiles(retValAccumulator)

    if (!importParams.excludeTiles)
      doImportActors(retValAccumulator)

    if (!importParams.excludeTiles)
      doImportMaps(retValAccumulator)
    
    return retValAccumulator
  }
})


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
