import React, { PropTypes } from 'react'
import { badgeList } from '/imports/schemas/badges'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import { Popup } from 'semantic-ui-react'

const Badge = ({ name, forceSize }) => {
  const badge = badgeList[name] || ['Unknown.png', `Badge "${name}" not recognised`]
  const imgUrl = makeCDNLink(badge.img)
  const title = badge.descr
  const size = forceSize ? { width: `${forceSize}px`, height: `${forceSize}px` } : {}
  return (
    <Popup
      on="hover"
      size="mini"
      inverted
      position="bottom center"
      trigger={
        <img
          style={{ maxWidth: '64px', maxHeight: '64px', margin: '4px' }}
          className="image"
          src={imgUrl}
          {...size}
        />
      }
      content={title}
    />
  )
}

Badge.propTypes = {
  name: PropTypes.string.isRequired,
  forceSize: PropTypes.number, // Width to force badge image to (in pixels)
}

export default Badge
