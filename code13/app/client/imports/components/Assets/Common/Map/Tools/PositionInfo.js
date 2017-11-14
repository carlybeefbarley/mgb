import PropTypes from 'prop-types'
import React from 'react'

const PositionInfo = props => <div style={props.infoStyle}>{props.getInfo()}</div>

PositionInfo.propTypes = {
  /** callback which returns some sort of information */

  getInfo: PropTypes.func.isRequired,
  /** css to place inspect info */

  infoStyle: PropTypes.object,
}

export default PositionInfo
