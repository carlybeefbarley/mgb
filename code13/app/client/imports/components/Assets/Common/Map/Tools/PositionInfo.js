import React from 'react'
export default class PositionInfo extends React.Component {
  render() {
    return (
      <div style={this.props.infoStyle}>
        {this.props.getInfo()}
      </div>
    )
  }
}

PositionInfo.propTypes = {
  getInfo: React.PropTypes.func.isRequired, // callback which returns some sort of information
  infoStyle: React.PropTypes.object, // css to place inspect info
}
