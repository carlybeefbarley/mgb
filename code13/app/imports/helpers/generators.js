// this will create etag in format: asset._id + ixqmbvi1
export const genetag = (asset) => {
  if(!asset){
    return "000-000"
  }
  return asset._id + asset.updatedAt.getTime().toString(36)
}
