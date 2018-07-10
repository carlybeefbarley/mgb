import PropTypes from 'prop-types'
import React from 'react'

export default class PositionInfo extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div style={this.props.infoStyle}>{this.props.getInfo()}</div>
  }
}

PositionInfo.propTypes = {
  /** callback which returns some sort of information */
  getInfo: PropTypes.func.isRequired,
  /** css to place inspect info */
  infoStyle: PropTypes.object,
}
