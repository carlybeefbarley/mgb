import _ from 'lodash'
import React, { PropTypes } from 'react'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import QLink from '/client/imports/routes/QLink'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import { Popup } from 'semantic-ui-react'

const _getAssetIdFromUrl = url => (url && url.startsWith("/api/asset/png")) ? _.last(url.split("/")).split('?').shift() : null

const _importFromDrop = (event, handleChange) => {
  const asset = DragNDropHelper.getAssetFromEvent(event)
  if (asset && asset.kind === 'graphic') {
    const imgUrl = `/api/asset/png/${asset._id}?hash=${Date.now()}`
    handleChange(imgUrl, asset._id)
  }
}

const ImageShowOrChange = ( { className, imageSrc, canEdit, canLinkToSrc, handleChange, header } ) => {
  const avatarAssetId = _getAssetIdFromUrl(imageSrc)
  const imageSrcToUse = makeCDNLink(imageSrc, makeExpireTimestamp(60)) || makeCDNLink('/images/wireframe/image.png')

  const propsImgContainer = {
    className: className,
    onDragOver: e => ( canEdit && DragNDropHelper.preventDefault(e) ),
    onDrop: e => ( (handleChange && canEdit) && _importFromDrop(e, handleChange) )
  }

  if (canLinkToSrc)
    propsImgContainer.to = avatarAssetId ? `/assetEdit/${avatarAssetId}` : imageSrcToUse

  const innerImg = (
    <img
      style={{backgroundColor: '#ffffff', minHeight:"155px", maxHeight:"155px", maxWidth:"230px", width:"auto"}}
      className="ui centered image mgb-pixelated"
      src={imageSrcToUse} />
  )
  
  const imgPopup = (
    <Popup 
      on='hover'
      size='small'
      inverted
      mouseEnterDelay={500}
      positioning='bottom left'
      trigger={innerImg} >
      <Popup.Header>
        { header }
      </Popup.Header>
      <Popup.Content>
        { canEdit ? 
          <span>Drag an MGB Graphic Asset here to change the chosen image. </span> 
          :
          <span>You do not have permission to change this. </span>
        }
        { (canLinkToSrc && avatarAssetId) && 
          <span>You can click the Image to view/edit the Graphic Asset</span> 
        }
      </Popup.Content>
    </Popup>
  )

  return React.createElement((canLinkToSrc && avatarAssetId) ? QLink : 'div', propsImgContainer, handleChange ? imgPopup : innerImg)
}

ImageShowOrChange.propTypes = {
  className:    PropTypes.string.isRequired,    // Classname for the outer div
  header:       PropTypes.string.isRequired,    // e.g "Project Avatar"
  imageSrc:     PropTypes.string,               // A string which will be passed to img.src. Can be null
  canEdit:      PropTypes.bool.isRequired,      // True if this should be able to accept changes via Drag
  canLinkToSrc: PropTypes.bool.isRequired,      // True if this should be a QLink to the image (or image editor)
  handleChange: PropTypes.func                  // Function callback - takes (newUrlString, assetIdString) as params
}

export default ImageShowOrChange
