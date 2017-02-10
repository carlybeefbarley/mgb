import _ from 'lodash'
import React, { PropTypes } from 'react'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import QLink from '/client/imports/routes/QLink'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'

const _getAssetIdFromUrl = url => (url && url.startsWith("/api/asset/png")) ? _.last(url.split("/")).split('?').shift() : null

const _importFromDrop = (event, handleChange) => {
  const asset = DragNDropHelper.getAssetFromEvent(event)
  if (asset && asset.kind === 'graphic') {
    const imgUrl = `/api/asset/png/${asset._id}?hash=${Date.now()}`
    handleChange(imgUrl, asset._id)
  }
}

const ImageShowOrChange = props => {
  const { className, imageSrc, canEdit, canLinkToSrc, handleChange } = props
  const avatarAssetId = _getAssetIdFromUrl(imageSrc)
  const imageSrcToUse = makeCDNLink(imageSrc, makeExpireTimestamp(60)) || makeCDNLink('/images/wireframe/image.png')

  const propsImgContainer = {
    title: canEdit ?  'Drag an Image asset here to change the chosen image' : '',
    className: className,
    onDragOver: e => ( canEdit && DragNDropHelper.preventDefault(e) ),
    onDrop: e => ( canEdit && _importFromDrop(e, handleChange) )
  }

  if (canLinkToSrc)
    propsImgContainer.to = avatarAssetId ? `/assetEdit/${avatarAssetId}` : imageSrcToUse

  const img = (
    <img
      style={{backgroundColor: '#ffffff', minHeight:"150px", maxHeight:"150px", maxWidth:"220px", width:"auto"}}
      className="ui centered image mgb-pixelated"
      src={imageSrcToUse} />
  )

  return React.createElement((canLinkToSrc && avatarAssetId) ? QLink : 'div', propsImgContainer, img)
}

ImageShowOrChange.propTypes = {
  className:    PropTypes.string.isRequired,    // Classname for the outer div
  imageSrc:     PropTypes.string,               // A string which will be passed to img.src. Can be null
  canEdit:      PropTypes.bool.isRequired,      // True if this should be able to accept changes via Drag
  canLinkToSrc: PropTypes.bool.isRequired,      // True if this should be a QLink to the image (or image editor)
  handleChange: PropTypes.func.isRequired       // Function callback - takes (newUrlString, assetIdString) as params
}

export default ImageShowOrChange
