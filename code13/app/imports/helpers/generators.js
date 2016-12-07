export const genetag = (asset) => {
  if(!asset){
    return "000-000"
  }
  return asset._id + asset.updatedAt.getTime().toString(36)
}

export const genAPIreturn = (api, val, asset = val) => {
  const etag = genetag(asset)
  api.response.removeHeader("pragma")
  if(api.request.headers["if-none-match"] == etag){
    api.response.writeHead(304, {
      "cache-control": "must-revalidate"
    })
    api.response.end()
    api.done()
    console.log("NOT modified")
    return
  }
  console.log("IS MODIFIED!")
  return {
    headers: {
      etag: etag,
      "cache-control": "must-revalidate"
    },
    body: val || {}
  }
}
