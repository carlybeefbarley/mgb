// This helper is related to asset caching.
// This genetag method will generate an ETAG in the format: 
// asset._id + ixqmbvi1
//    where the suffix is dependent on the updatedAt field of the asset as defined in assets.js

export const genetag = (asset) => ( asset ? (asset._id + asset.updatedAt.getTime().toString(36)) : "000-000")