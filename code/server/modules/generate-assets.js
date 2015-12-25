let generate = () => {
  let assetCount = 1500,
    assetExist = _checkIfAssetExist( assetCount );

  if ( !assetExist ) {
    _createAssets( _generateAsset( assetCount ) );
  }
};

let _checkIfAssetExist = ( count ) => {
  let asset = AssetsCollection.find().count();
  return asset < count ? false : true;
};

let _createAssets = ( assets ) => {
  for ( let i = 0; i < assets.length; i++ ) {
    let asset = assets[ i ];
    _createAsset( asset );
  }
};

let _createAsset = ( asset ) => {
  AssetsCollection.insert( asset );
};

let _generateAsset = ( count ) => {
  let assetArray = [];
  let assetKindKeys = Object.keys(AssetKinds);

  for ( let i = 0; i < count; i++ ) {
    assetArray.push({
      name: "Asset #" + i.toString(),
      kind: assetKindKeys[i % assetKindKeys.length],
      content: "Content #" + i.toString()
    });
  }

  return assetArray;
};

Modules.server.generateAssets = generate;
