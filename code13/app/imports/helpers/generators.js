// this will create etag in format: asset._id + ixqmbvi1
export const genetag = (asset) => {
  if(!asset){
    return "000-000"
  }
  return asset._id + asset.updatedAt.getTime().toString(36)
}

// this will return only not-modified header if browser already has resource in the cache (based on etag)
// it's good idea to pass body as function so heavy value calculations can be omitted if asset is not changed
// e.g. transforming musing byteArray to base64 string
export const genAPIreturn = (api, asset, body = asset, headers = {}) => {
  // default 404
  if(!body){
    return {
      statusCode: 404,
      body: {}
    }
  }

  // some fallback mechanism
  if(!asset){
    return {
      headers:  headers,
      body: typeof body == "function" ? body() : body
    }
  }

  const etag = genetag(asset)
  // pragma: no-store header will force cloudfront to skip cache totally
  // so remove it
  api.response.removeHeader("pragma")

  // check if client already have cached resource
  if(api.request.headers["if-none-match"] == etag){
    api.response.writeHead(304, {
      etag: etag,
      "cache-control": "must-revalidate"
    })
    api.response.end()
    api.done()
    return
  }

  // return full response with etag
  return {
    headers: Object.assign({
      etag: etag,
      "cache-control": "must-revalidate"
    }, headers),
    body: typeof body == "function" ? body() : body
  }
}
