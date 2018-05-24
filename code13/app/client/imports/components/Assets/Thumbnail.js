import PropTypes from 'prop-types'
import React from 'react'
import { makeExpireThumbnailLink, makeGraphicAPILink } from '/client/imports/helpers/assetFetchers'
import FittedImage from '/client/imports/components/Controls/FittedImage'

import SpecialGlobals from '/imports/SpecialGlobals.js'

// This will use display:block formatting; it can not work inline
const Thumbnail = ({
  constrainHeight = '155',
  title = '',
  expires = SpecialGlobals.thumbnail.defaultExpiresDuration,
  asset,
  assetId,
}) => (
  <FittedImage
    src={Thumbnail.getLink(asset || assetId, expires)}
    title={`${title} (CacheExpire = ${expires} seconds)`}
    height={constrainHeight}
  />
)

Thumbnail.propTypes = {
  constrainHeight: PropTypes.string, // in a css format, preferably with px or em, e.g. '150px'.
  // Default is '155px'. The image will be this height, and fill available width
  // while retaining aspect Ratio.
  asset: PropTypes.object, // if known - we can create proper hash based on etag - and invalidate right on time
  assetId: PropTypes.string, // If props.asset is not supplied (null or undefined) then this is the
  //      the AssetID (uuid) of an Asset
  //   OR a string of the format kind/username/assetName (which matches non-deleted assets)
  expires: PropTypes.number, // expire time seconds. Optional. If not provided, value will be _DEFAULT_EXPIRES_DURATION_S
  title: PropTypes.string, // Used as the normal title=prop for the image, but we will append a note about the cache time for convenience
}

Thumbnail.getLink = makeExpireThumbnailLink
Thumbnail.makeGraphicAPILink = makeGraphicAPILink

export default Thumbnail
