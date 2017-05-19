import React, { PropTypes } from "react";

export default (FittedImage = (
  { src, height = "140px", width, ...rest }
) => (
 // This is <div> instead of <img> so that it won't have the border that chrome puts on if src has no content
  <div
    className="mgb-pixelated"
    crossOrigin="anonymous"
    style={{
      background: `url("${src}") no-repeat center 10% / contain`,
      height: height,
      width: width
    }}
    {...rest}
  />
));
