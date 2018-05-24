import PropTypes from 'prop-types'
import React from 'react'
import { badgeList } from '/imports/schemas/badges'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import { Popup } from 'semantic-ui-react'
import { getFriendlyName } from '/imports/schemas/badges'

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
      position="top center"
      trigger={
        <img
          style={{ maxWidth: '64px', maxHeight: '64px', margin: '4px' }}
          className="image"
          src={imgUrl}
          {...size}
        />
      }
      content={title}
      header={getFriendlyName(badge)}
    />
  )
}

Badge.propTypes = {
  name: PropTypes.string.isRequired,
  forceSize: PropTypes.number, // Width to force badge image to (in pixels)
}

export default Badge
