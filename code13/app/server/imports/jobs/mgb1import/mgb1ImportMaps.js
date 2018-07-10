import pako from 'pako'
import validate from '/imports/schemas/validate'

// The Actual ACTORS importer
// This should only be in server code

//  See definition of rva (retValAccumulator) in the
//    'job.import.mgb1.project' Meteor RPC defined in mgb1Importer.js

//  All rva.importParams have been pre-validated

//  Ignores excludeActors flag (caller should have checked)

//  Avoid throwing Meteor.Error()

export const doImportMap = (content, rva, fullS3Name, assetName) => {
  const { mgb2NewProjectName, mgb2assetNamePrefix, isDryRun } = rva.importParams
  const { Body, Metadata, LastModified } = content // Body is of type Buffer

  // content.Body needs a LOT of processing from the strange MGBv1 formats (Adobe Flex made me do it, honest...)
  var jsonData = {} // This is where we will put the result.. it will become asset.content2
  var byteArray = new Uint8Array(Body)
  var data2 = pako.inflate(byteArray)
  var b = new Buffer(data2)
  var offset = 0
  var maxLayers = b.readUInt32BE(offset)
  offset += 4
  jsonData.maxLayers = maxLayers
  jsonData.mapLayer = []
  for (let layer = 0; layer < maxLayers; layer++) {
    jsonData.mapLayer[layer] = []
    var layerLen = b.readInt32BE(offset)
    offset += 4

    for (let i = 0; i < layerLen; i++) {
      var strLen = b.readInt16BE(offset)
      offset += 2
      if (strLen > 0) {
        var str = b.toString('utf8', offset, offset + strLen)
        offset += strLen
        jsonData.mapLayer[layer].push(str)
      } else jsonData.mapLayer[layer].push('')
    }
  }

  jsonData.metadata = {
    width: parseInt(Metadata.width, 10),
    height: parseInt(Metadata.height, 10),
  }

  const newAsset = {
    createdAt: LastModified ? new Date(LastModified) : undefined,
    projectNames: [mgb2NewProjectName],
    name: mgb2assetNamePrefix + assetName,
    kind: 'actormap',
    text: `Imported from MGB1 (${fullS3Name}) ${Metadata.comment}`,
    thumbnail: null,
    content2: jsonData,
    workState: 'working',
    assetLicense: 'CC-BY-NC-4.0',
    isCompleted: false, // This supports the 'is stable' flag
    isDeleted: false, // This is a soft 'marked-as-deleted' indicator
    isPrivate: false,
  }

  // fixup Layers 0,1,2 which are just asset references
  for (let i = 0; i < 3; i++) {
    const ml = newAsset.content2.mapLayer[i]
    _.each(ml, (aName, idx) => {
      ml[idx] = !aName || aName === '' ? '' : mgb2assetNamePrefix + aName
    })
  }

  // fixup Layer[3] which is an eventLayer with a few kinds of thing
  //   See https://github.com/dgolds/MGB-Flex-source-code/search?utf8=%E2%9C%93&q=CommandEngine.encode
  const eventLayer = newAsset.content2.mapLayer[3]

  _.each(eventLayer, (cmdStr, idx) => {
    if (cmdStr) {
      const [cmd, params] = cmdStr.split(': ')
      const p2 = params.split(',').sort()
      switch (cmd) {
        case 'jump':
          // example: "jump: mapname=XXXXXXXXX,y=N,x=N"
          var [cmdMapname, mapname] = p2[0].trim().split('=')
          p2[0] = cmdMapname + '=' + mgb2assetNamePrefix + mapname
          break
        case 'music':
          // example: "music: source=SONGNAME,loops=NNNNNN"
          var [cmdSongname, songname] = p2[1].trim().split('=')
          p2[1] = cmdSongname + '=' + '[builtin]:' + songname
          break
      }
      eventLayer[idx] = cmd + ': ' + p2.join(',')
    }
  })

  console.log('------ ' + assetName + ' ------')
  console.log(newAsset)
  console.log(newAsset.content2.mapLayer[3].join('≈'))

  if (!validate.assetName(newAsset.name)) {
    newAsset.text.replace(/[#:?]/g, '')
    newAsset.text = newAsset.text.length > 64 ? newAsset.text.slice(0, 63) : newAsset.text
  }

  if (!validate.assetDescription(newAsset.text)) {
    newAsset.text = newAsset.text.slice(0, 116) + '...'
  }

  if (!isDryRun) Meteor.call('Azzets.create', newAsset)
}
