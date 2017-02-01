import React from 'react'
export default class PositionInfo extends React.Component {

  getTilePosInfo (e) {
    const ts = this.tileset
    // image has not been loaded
    if (!ts) {
      return
    }
    const pos = new SelectedTile()
    pos.updateFromMouse(e, ts, this.spacing)
    return pos
  }

  render () {
    console.log(this.props)

    return (
      <div>
        {this.props.getInfo(posInfo)}
      </div>
    )
  }
}

PositionInfo.propTypes = {
  getInfo: React.PropTypes.func.isRequired // callback which returns some sort of information
}
