// This helper is related to asset caching.
// This file will contain server specific generators.
// See also /imports/helpers/generators for the client ETAG
//          generator 'genetag' (which we also import and export from this module)
import { genetag } from '/imports/helpers/generators'
import { getCDNDomain } from '../../cloudfront/CreateCloudfront'
export { genetag }

const DEFAULT_MAX_AGE = 600 // This cache MAX_AGE config param is for dynamic requests (10 minutes) - probably we can increase this. This is not for static assets


export const assetToCdn = (api, asset, uri) => {
  const domain = getCDNDomain()
  return {
    statusCode: 302,    // FOUND (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
    headers: {
      'Location': domain ? '//' + getCDNDomain() + uri + "/?etag=" + genetag(asset) : uri + "/?etag=" + genetag(asset)
      // 'cache-control': 'max-age=30'
      // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
    },
    body: {}
  }
}

// this will return only not-modified header if browser already has resource in the cache (based on etag)
// It's good idea to pass body as function so heavy value calculations can be omitted if asset is not changed
// e.g. transforming music using byteArray to base64 string
export const genAPIreturn = (api, asset, body = asset, headers = {}) => {
  // default 404
  if (!body) {
    return {
      statusCode: 404,
      body: {}
    }
  }
  if (!asset) {
    return {
      headers: headers,
      body: (typeof body == "function") ? body() : body
    }
  }
  // some fallback mechanism
  const maxAge = !api.queryParams.expires ? DEFAULT_MAX_AGE : api.queryParams.expires

  const cacheHeader = `public, max-age=${maxAge}, s-maxage=${maxAge}, must-revalidate`
  const etag = genetag(asset)
  // pragma: no-store header will force cloudfront to skip cache totally
  // so remove it
  if (api.queryParams.hash)
    api.response.removeHeader("pragma")

  const newHeaders = api.queryParams.hash
    ? Object.assign({
        "etag": etag,
        "cache-control": cacheHeader
      }, headers)
    : Object.assign({
        // "etag": etag,
        // if we don't have hash param -
        // we may allow cloudfront to cache, but force it to re-validate ( usually response will end up with 304 - not Modified )
        // this will allow browser to cache images - and then it won't refresh images - which is not what we want
        // "cache-control": `public, max-age=0, s-maxage=0, must-revalidate`
      }, headers)

  // check if client already have cached resource
  if (api.request.headers["if-none-match"] == etag) {
    api.response.writeHead(304, newHeaders)
    api.response.end()
    api.done()
    return
  }

  // return full response with etag
  return {
    headers: newHeaders,
    body: (typeof body == "function") ? body() : body
  }
}
