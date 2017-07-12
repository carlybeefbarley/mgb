// This helper is related to asset caching.
// This genetag method will generate an ETAG in the format:
// asset._id + ixqmbvi1
//    where the suffix is dependent on the updatedAt field of the asset as defined in assets.js
/**
 *
 * @param asset - partial asset {_id: {String}, updatedAt: {Date}}
 * @returns {String}
 */
export const genetag = asset => {
  if (!asset) return '000-000'
  const time = typeof asset.updatedAt === 'string' ? new Date(asset.updatedAt) : asset.updatedAt
  return asset._id + time.getTime().toString(36)
}
