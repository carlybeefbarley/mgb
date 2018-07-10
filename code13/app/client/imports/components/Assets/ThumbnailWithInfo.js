import React from 'react'
import Thumbnail from './Thumbnail'
import SpecialGlobals from '/imports/SpecialGlobals.js'

class ThumbnailWithInfo extends React.Component {
  state = {}
  componentDidMount() {
    if (this.props.showDimensions && !this.state.dimensions) {
      const {
        asset,
        assetId,
        owner,
        name,
        expires = SpecialGlobals.thumbnail.defaultExpiresDuration,
      } = this.props

      const img = new Image()
      img.onload = () => {
        this.setState({ dimensions: { width: img.width, height: img.height } })
      }

      img.src = Thumbnail.makeGraphicAPILink(asset || (owner && name) ? `${owner}/${name}` : assetId, expires)
    }
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <Thumbnail {...this.props} />
        {this.state.dimensions && (
          <span>
            {this.state.dimensions.width}x{this.state.dimensions.height}
          </span>
        )}
      </div>
    )
  }
}

export default ThumbnailWithInfo
