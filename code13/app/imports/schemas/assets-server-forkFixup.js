
// replaces owner:name with newUserName
// TODO: check if referenced asset is in a project - this can break things if refenced asset is not in the project
const doFix = (str, oldOwner, newOwner) => {
  // DropArea import: owner:assetName
  if(str.startsWith(`${oldOwner}:`))
    return newOwner + str.substring(oldOwner.length)
  // map references: /api/asset/png/stauzs/simple.sample.graphics
  if(str.startsWith(`/api/asset/png/${oldOwner}/`))
    return  `/api/asset/png/${newOwner}/` + str.substring((`/api/asset/png/${oldOwner}/`).length)
  return str
}

// iterates objToFix props and changes oldOwner:xxxx to newOwner:xxxx
const quickAndDirtyC2Fix = (objToFix, oldOwner, newOwner) => {
  // is it safe to iterate Arrays this way???
  for (let i in objToFix) {
    const type = typeof objToFix[i]
    if (type === 'string')
      objToFix[i] = doFix(objToFix[i])
    else if(type == 'object')
      quickAndDirtyC2Fix(objToFix[i], oldOwner, newOwner)
  }
}

/*
TODO: correct JS docs format
@fn doFixupAssetReferences - Fixes asset references
@param asset - reference to asset to be fixed
@param oldOwner - original asset owner
@param newOwner - user's name who is performing fork
 */
export const doFixupAssetReferences = (asset, oldOwner, newOwner) =>
{
  switch (asset.kind) {
  case 'graphic':
  case 'tutorial':
  case 'sound':
  case 'music':
    break  // These have no references to other assets
  case 'actor':
  case 'actormap':
  case 'game':
    //TODO: Change the asset in-place
    quickAndDirtyC2Fix(asset.content2, oldOwner, newOwner)
    break
  case 'code':
    //TODO: DISCUSS - is it good replace strings from '/oldOwner:moduleName' => from '/newOwner:moduleName' ????
    break
  // TODO.. the rest
  }
}
