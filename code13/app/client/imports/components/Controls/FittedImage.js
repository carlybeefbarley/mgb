import PropTypes from 'prop-types'
import React from 'react'

const FittedImage = ({ src, height = '140px', width, ...rest }) => (
  // This is <span> instead of <img> so that it won't have the border that chrome puts on if src has no content
  <span
    className="mgb-pixelated"
    {...rest}
    style={{
      display: 'block',
      background: `url("${src}") no-repeat center / contain`,
      height,
      width,
      ...rest.style,
    }}
  />
)

FittedImage.PropTypes = {
  src: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default FittedImage
