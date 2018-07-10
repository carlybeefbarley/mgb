// This helper is related to asset caching.
/**
 * @typedef {{_id: String, updatedAt: Date}} AssetEtagPart
 */
/**
 * generates an ETAG in the format: asset._id + hashed_timestamp
 * where the suffix is dependent on the updatedAt field of the asset as defined in assets.js
 * @param asset {{_id: String, updatedAt: (Date|String)}} - partial asset
 * @returns {String}
 */
export const genetag = asset => {
  if (!asset) return '000-000'
  const time = typeof asset.updatedAt === 'string' ? new Date(asset.updatedAt) : asset.updatedAt
  return asset._id + time.getTime().toString(36)
}
