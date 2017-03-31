import React, { PropTypes } from "react";

export default FittedImage = (
  { src, height = "140px", ...rest }
) => // This is <div> instead of <img> so that it won't have the border that chrome puts on if src has no content
(
  <div
    className="mgb-pixelated"
    style={{
      background: `url(${src}) no-repeat center`,
      height: height,
      backgroundSize: "contain"
    }}
    {...rest}
  />
);
