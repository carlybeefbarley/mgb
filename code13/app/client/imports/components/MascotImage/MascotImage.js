import React from 'react'

import UX from '/client/imports/UX'

const makeStyle = (mascot, style = {}) => ({
  width: '8em',
  height: '10em',
  paddingRight: '0.5em',
  marginBottom: '0',
  float: 'left',
  marginRight: '1em',
  backgroundImage: `url("${UX.makeMascotImgLink(mascot)}")`,
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
  ...style,
})

const MascotImage = ({ name, style, ...rest }) => <div style={makeStyle(name, style)} {...rest} />

export default MascotImage
