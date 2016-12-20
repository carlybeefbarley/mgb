import React, { PropTypes } from 'react'
import { badgeList } from '/imports/schemas/badges'


const Badge = props => 
{
  const { name, forceSize } = props
  const badge = badgeList[name] || ["Unknown.png", `Badge "${name} not recognised`]
  const imgUrl = "/images/badges/" + badge[0]
  const title = badge[1]
  const size = forceSize ? ({ width: `${forceSize}px`, height: `${forceSize}px`}) : ({})
  return <img style={{ maxWidth: '64px', maxHeight: '64px' }} className='image' src={imgUrl} title={title} {...size} />
}

Badge.propTypes = {
  name:       PropTypes.string.isRequired,
  forceSize:  PropTypes.number              // Width to force badge image to (in pixels)
}

export default Badge