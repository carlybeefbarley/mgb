import pako from 'pako'
import xml2js from 'xml2js'


// The Actual ACTORS importer
// This should only be in server code

//  See definition of rva (retValAccumulator) in the
//    'job.import.mgb1.project' Meteor RPC defined in mgb1Importer.js

//  All rva.importParams have been pre-validated

//  Ignores excludeActors flag (caller should have checked)

//  Avoid throwing Meteor.Error()

export const doImportActor = (content, rva, fullS3Name, assetName ) => {
  const { mgb2ExistingProjectName, mgb2assetNamePrefix, isDryRun } = rva.importParams
  const { Body, Metadata, LastModified } = content   // Body is of type Buffer

  // At this point, the required data should be in content.Body and content.Metadata

  // content.Body needs a lot of processing from the strange MGBv1 formats (Adobe Flex made me do it...)
  var byteArray = new Uint8Array(Body)
  var data2 = pako.inflate(byteArray)
  var data3 = new Uint16Array(data2)
  var strData = String.fromCharCode.apply(null, data3)
  while (strData[0] !== "{" && strData.length > 0)
    strData = strData.substring(1);
  strData = strData.replace(/{{{/g, "<").replace(/}}}/g, ">");

  var jsonData
  xml2js.parseString(
    strData, 
    { explicitArray: false, async: false}, 
    function (e, r) { 
      var animT = r.actor.animationTable
      r.actor.animationTable = animT.split("#")
      r.actor.animationTable = _.map(r.actor.animationTable, function (x) { var a= x.split("|"); return {action: a[0], tileName: a[1], effect: a[2]} })
      jsonData = r    // since we requested with async:false we know that this callback completes before we get to then next line of the outer scope
    }
  )

  _prefixAllAssetNames(jsonData, mgb2assetNamePrefix)

  const newAsset = {
    createdAt:      LastModified ? new Date(LastModified) : undefined,
    projectNames:   [ mgb2ExistingProjectName ],
    name:           mgb2assetNamePrefix + assetName,
    kind:           'actor',
    text:           `Imported from MGB1 (${fullS3Name}) ${Metadata.comment}`,
    thumbnail:      null, //pngAsDataUri,
    content2:       jsonData.actor,
    isCompleted:    false,     // This supports the 'is stable' flag
    isDeleted:      false,     // This is a soft 'marked-as-deleted' indicator
    isPrivate:      false
  }

  console.log('------ ' + assetName + ' ------')
  console.log(jsonData.actor.databag)

  if (!isDryRun)
    Meteor.call('Azzets.create', newAsset)
}


const _prefixAllAssetNames = (jsonData, mgb2assetNamePrefix) => {
  console.log(jsonData)
  const { actor } = jsonData
  const { databag, animationTable } = actor

  // if not "", then actor/tile references need a mgb2assetNamePrefix prefix

  const _fixup = ( bagName, paramsList ) => {
    const paramsArray = paramsList.split(',')
    const bag = databag[bagName]
    _.each(paramsArray, p => {
      if (bag && bag[p] && bag[p] !== '')
        bag[p] = mgb2assetNamePrefix + bag[p]
    })
  }

  _fixup('allchar',   'shotActor')
  _fixup('item',      'equippedNewShotActor,equippedNewActorGraphics')
  _fixup('npc',       'takesObjectOnChoice1,dropsObjectOnChoice1')
  _fixup('npc',       'takesObjectOnChoice2,dropsObjectOnChoice2')
  _fixup('npc',       'takesObjectOnChoice2,dropsObjectOnChoice3')
  _fixup('itemOrNPC', 'dropsObjectWhenKilledName,dropsObjectWhenKilledName2')
  _fixup('itemOrNPC', 'dropsObjectRandomlyName,conditionsActor')
  _fixup('item',      'keyForThisDoor')
  //_fixup('playercharacter', '') - no work for this one


  // If not "", then the following tile references need a mgb2assetNamePrefix prefix
  _.each(animationTable, anim => {
    if (anim && anim.tileName && anim.tileName !== '')
      anim.tileName = mgb2assetNamePrefix + anim.tileName
  })

  const _fixSound = ( bagName, paramsList ) => {
    const paramsArray = paramsList.split(',')
    const bag = databag[bagName]
    _.each(paramsArray, p => {
      if (bag && bag[p] && bag[p] !== '')
        bag[p] = '[builtin]:' + bag[p]
    })
  }

  _fixSound('all',      'soundWhenHarmed,soundWhenHealed,soundWhenKilled')
  _fixSound('allchar',  'soundWhenShooting,soundWhenMelee')
  _fixSound('item',     'equippedNewShotSound,equippedNewMeleeSound')
}