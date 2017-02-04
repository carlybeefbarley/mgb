

export const doFixupAssetReferences = asset => 
{
  switch (asset.kind) {
  case 'graphic':
  case 'tutorial':
  case 'sound':
  case 'music':
    break  // These have no references to other assets 
  case 'actor':
    //TODO: Change the asset in-place
    break

  // TODO.. the rest
  }
}