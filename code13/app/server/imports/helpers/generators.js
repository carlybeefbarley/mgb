// This helper is related to asset caching.
// This file will contain server specific generators.
// See also /imports/helpers/generators for the client ETAG
//          generator 'genetag' (which we also import and export from this module)
import { genetag } from '/imports/helpers/generators'
import { getCDNDomain } from '../../cloudfront/CreateCloudfront'
export { genetag }

const DEFAULT_MAX_AGE = 600 // This cache MAX_AGE config param is for dynamic requests (10 minutes) - probably we can increase this. This is not for static assets

/**
 * This function redirects from our server to CDN link -
 * so we can do some extra work, but not send data directly to client
 *
 * @param api - instance of Restivus API
 * @param asset - partial asset {_id: {String}, updatedAt: {Date}}
 * @param uri - uri on CDN
 * @returns {{statusCode: number, headers: {Location: string}, body: {}}}
 */
export const assetToCdn = (api, asset, uri) => {
  const domain = getCDNDomain()
  // we need to pass origin to CDN iframes - so we know later what is our origin
  // ATM used in the play game - game's iframe content is served from CDN - for faster page load and isolation
  // also look at: app/imports/helpers/makeCodeBundle.js where origin is used

  const origin = api.queryParams.origin ? '&origin=' + api.queryParams.origin : ''
  return {
    statusCode: 302, // FOUND (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
    headers: {
      Location: domain
        ? '//' + getCDNDomain() + uri + '?etag=' + genetag(asset) + origin
        : uri + '?etag=' + genetag(asset) + origin,
      // 'cache-control': 'max-age=30'
      // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
    },
    body: {},
  }
}

// this will return only not-modified header if browser already has resource in the cache (based on etag)
// It's good idea to pass body as function so heavy value calculations can be omitted if asset is not changed
// e.g. transforming music using byteArray to base64 string
const getBodyContent = body => {
  const retval = typeof body == 'function' ? body() : body
  // if resp body will be empty ('') - then restivus will send headers as body - seems like a bug
  if (!retval) {
    return '\n'
  }
  return retval
}

export const genAPIreturn = (api, asset, body = asset, headers = {}) => {
  // default 404
  if (body === void 0 || body == null) {
    return {
      statusCode: 404,
      body: {},
    }
  }
  if (!asset) {
    return {
      headers: headers,
      body: getBodyContent(body),
    }
  }
  // some fallback mechanism
  const maxAge = api.queryParams && api.queryParams.expires ? api.queryParams.expires : DEFAULT_MAX_AGE

  const etag = genetag(asset)
  let cacheHeader = `public, max-age=${maxAge}, s-maxage=${maxAge}`
  // pragma: no-store header will force cloudfront to skip cache totally
  // so remove it
  if (api.queryParams && api.queryParams.hash) {
    api.response.removeHeader('pragma')
    if (api.queryParams.hash !== etag) {
      cacheHeader += ' ,must-revalidate'
    }
  } else {
    cacheHeader += ' ,must-revalidate'
  }

  const newHeaders =
    api.queryParams && api.queryParams.hash
      ? Object.assign(
          {
            etag: etag,
            'cache-control': cacheHeader,
          },
          headers,
        )
      : Object.assign(
          {
            // "etag": etag,
            // if we don't have hash param -
            // we may allow cloudfront to cache, but force it to re-validate ( usually response will end up with 304 - not Modified )
            // this will allow browser to cache images - and then it won't refresh images - which is not what we want
            // "cache-control": `public, max-age=0, s-maxage=0, must-revalidate`
          },
          headers,
        )

  // check if client already have cached resource
  if (api.request.headers['if-none-match'] == etag) {
    api.response.writeHead(304, newHeaders)
    api.response.end()
    api.done()
    return
  }

  // return full response with etag
  return {
    headers: newHeaders,
    body: getBodyContent(body),
  }
}
