import React from 'react'
export default class PositionInfo extends React.Component {

  render () {
    return (
      <div>
        {this.props.getInfo()}
      </div>
    )
  }
}

PositionInfo.propTypes = {
  getInfo: React.PropTypes.func.isRequired // callback which returns some sort of information
}
