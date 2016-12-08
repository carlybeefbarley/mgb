export const genetag = (asset) => {
  if(!asset){
    return "000-000"
  }
  return asset._id + asset.updatedAt.getTime().toString(36)
}

export const genAPIreturn = (api, asset, val = asset, headers = {}) => {
  // default 404
  if(!val){
    return {
      statusCode: 404,
      body: {}
    }
  }

  // some fallback mechanism
  if(!asset){
    return {
      headers:  headers,
      body: val
    }
  }

  const etag = genetag(asset)
  api.response.removeHeader("pragma")
  if(api.request.headers["if-none-match"] == etag){
    api.response.writeHead(304, {
      "cache-control": "must-revalidate"
    })
    api.response.end()
    api.done()
    return
  }

  return {
    headers: Object.assign({
      etag: etag,
      "cache-control": "must-revalidate"
    }, headers),
    body: val
  }
}
