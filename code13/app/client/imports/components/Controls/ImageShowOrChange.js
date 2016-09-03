import _ from 'lodash'
import React, { PropTypes } from 'react'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import QLink from '/client/imports/routes/QLink'


function _getAssetIdFromUrl(url) {
  return url.startsWith("/api/asset/png") ? _.last(url.split("/")) : null
}

const _propTypes = {
  className:    PropTypes.string.isRequired,    // Classname for the outer div
  imageSrc:     PropTypes.string.isRequired,    // A string which will be passed to img.src
  canEdit:      PropTypes.bool.isRequired,      // True if this should be able to accept changes via Drag
  canLinkToSrc: PropTypes.bool.isRequired,      // True if this should be a QLink to the image (or image editor)
  handleChange: PropTypes.func.isRequired       // Function callback - takes (newUrlString, assetIdString) as params
}

export default class ImageShowOrChange extends React.Component {

  render() {
    const { className, imageSrc, canEdit, canLinkToSrc } = this.props
    const avatarAssetId = _getAssetIdFromUrl(imageSrc)
    const href = avatarAssetId ? `/assetEdit/${avatarAssetId}` : imageSrc
    const img =  <img className="ui fluid image mgb-pixelated" src={imageSrc} />
    const title = canEdit && "Drag an Image asset here to change the chosen image"
    if (canLinkToSrc)
      return (
        <QLink to={ href }
          title={ title }
          className={className}           
          onDragOver={(e) => this.prepareForDrag(e) }
          onDrop={(e) => this.importFromDrop(e) } >
         { img }
        </QLink>
      )
    else 
      return (
        <div 
          title={ title }
          className={className}           
          onDragOver={(e) => this.prepareForDrag(e) }
          onDrop={(e) => this.importFromDrop(e) } >
          { img }
        </div>
      )    
  }

  prepareForDrag(e) {
    if (!this.props.canEdit)
      return

    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'copy'
  }

  importFromDrop(e) {
    if (!this.props.canEdit)
      return

    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (asset && asset.kind === 'graphic') {
      const imgUrl = `/api/asset/png/${asset._id}`
      this.props.handleChange(imgUrl, asset._id)
    }
  }
}

ImageShowOrChange._propTypes = _propTypes