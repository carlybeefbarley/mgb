import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import QLink from '/client/imports/routes/QLink'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import { Popup } from 'semantic-ui-react'
import FittedImage from '/client/imports/components/Controls/FittedImage'
import SpecialGlobals from '/imports/SpecialGlobals.js'

const _getAssetIdFromUrl = url =>
  /api\/asset\/(cached-thumbnail\/)?png/.test(url)
    ? _.last(url.split('/'))
        .split('?')
        .shift()
    : null

const _importFromDrop = (event, handleChange) => {
  const asset = DragNDropHelper.getAssetFromEvent(event)
  if (asset && asset.kind === 'graphic') {
    const imgUrl = `/api/asset/png/${asset._id}`
    handleChange(imgUrl, asset._id)
  }
}

const ImageShowOrChange = ({
  imageSrc,
  canEdit,
  canLinkToSrc,
  handleChange,
  header,
  maxHeight = '155px',
  maxWidth = '230px',
}) => {
  const avatarAssetId = _getAssetIdFromUrl(imageSrc)
  const imageSrcToUse =
    makeCDNLink(imageSrc, makeExpireTimestamp(SpecialGlobals.avatar.validFor)) ||
    makeCDNLink('/images/wireframe/image.png')

  const propsImgContainer = {
    onDragOver: e => canEdit && DragNDropHelper.preventDefault(e),
    onDrop: e => handleChange && canEdit && _importFromDrop(e, handleChange),
  }

  if (canLinkToSrc) propsImgContainer.to = avatarAssetId ? `/assetEdit/${avatarAssetId}` : imageSrcToUse

  const innerImg = <FittedImage src={imageSrcToUse} height={maxHeight} />

  const imgPopup = (
    <Popup on="hover" size="small" inverted mouseEnterDelay={500} position="bottom center" trigger={innerImg}>
      <Popup.Header>{header}</Popup.Header>
      <Popup.Content>
        {canEdit ? (
          <span>
            You can set this image by dragging an MGB Graphic Asset from the 'Assets panel' to here.{' '}
          </span>
        ) : (
          <span>You do not have permission to change this. </span>
        )}
        {canLinkToSrc && avatarAssetId && <span>You can click the Image to view/edit the Graphic Asset</span>}
      </Popup.Content>
    </Popup>
  )

  return React.createElement(
    canLinkToSrc && avatarAssetId ? QLink : 'span',
    propsImgContainer,
    handleChange ? imgPopup : innerImg,
  )
}

ImageShowOrChange.propTypes = {
  header: PropTypes.string, // e.g "Project Avatar"
  imageSrc: PropTypes.string, // A string which will be passed to img.src. Can be null
  canEdit: PropTypes.bool, // True if this should be able to accept changes via Drag LR--not required anymore b/c causes console spew w/ logged out user
  canLinkToSrc: PropTypes.bool.isRequired, // True if this should be a QLink to the image (or image editor)
  handleChange: PropTypes.func, // Function callback - takes (newUrlString, assetIdString) as params
  maxWidth: PropTypes.string, // for example "120px"
  maxHeight: PropTypes.string, // for ex "120px"
}

export default ImageShowOrChange
