import React from 'react'

import UX from '/client/imports/UX'

const headerImageStyle = (mascot, style = {}) => ({
  width: '1.4em',
  height: '1.4em',
  display: 'inline-block',
  paddingRight: '1em',
  paddingLeft: '1em',
  backgroundImage: `url("${UX.makeMascotImgLink(mascot)}")`,
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
  ...style,
})

const HeaderImage = ({ name, style, ...rest }) => <div style={headerImageStyle(name, style)} {...rest} />

export default HeaderImage
