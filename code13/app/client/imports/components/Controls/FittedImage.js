import PropTypes from 'prop-types'
import React from 'react'
import { AssetKinds } from '/imports/schemas/assets'

const FittedImage = ({ src, height = '140px', width, ...rest }) => (
  // This is <div> instead of <img> so that it won't have the border that chrome puts on if src has no content
  <div
    className="mgb-pixelated"
    crossOrigin="anonymous"
    {...rest}
    style={{
      backgroundImage: `url("${src}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100%',
      height,
      width,
      ...rest.style,
    }}
  />
)

FittedImage.PropTypes = {
  color: PropTypes.object,
  src: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default FittedImage
