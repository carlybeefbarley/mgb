import React, { PropTypes } from 'react'
import { badgeList } from '/imports/schemas/badges'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import { Popup } from 'semantic-ui-react'

const Badge = ( { name, forceSize } ) => 
{
  const badge = badgeList[name] || ["Unknown.png", `Badge "${name} not recognised`]
  const imgUrl = makeCDNLink("/images/badges/" + badge[0])
  const title = badge[1]
  const size = forceSize ? ({ width: `${forceSize}px`, height: `${forceSize}px`}) : ({})
  return (
    <Popup
      on='hover'
      size='small'
      inverted
      positioning='bottom left'
      trigger={(
        <img 
          style={{ maxWidth: '64px', maxHeight: '64px', margin: '4px' }} 
          className='image' 
          src={imgUrl} 
          {...size} 
          />
      )}
      header={title}
      />
  )
}

Badge.propTypes = {
  name:       PropTypes.string.isRequired,
  forceSize:  PropTypes.number              // Width to force badge image to (in pixels)
}

export default Badge
