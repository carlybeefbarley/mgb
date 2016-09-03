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
  canEdit:      PropTypes.bool.isRequired,      // True if this shoudl be able to accept changes via Drag
  handleChange: PropTypes.func.isRequired       // Function callback - takes (newUrlString, assetIdString) as params
}

export default class ImageShowOrChange extends React.Component {

  render() {
    const { className, imageSrc, canEdit } = this.props
    const avatarAssetId = _getAssetIdFromUrl(imageSrc)
    const href = avatarAssetId ? `/assetEdit/${avatarAssetId}` : imageSrc
    return (
      <QLink to={href}
        title={ canEdit && "Drag an Image asset here to change the chosen image" }
        className={className}           
        onDragOver={(e) => this.prepareForDrag(e) }
        onDrop={(e) => this.importFromDrop(e) } >
        <img className="ui fluid image mgb-pixelated" src={imageSrc} />
      </QLink>
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