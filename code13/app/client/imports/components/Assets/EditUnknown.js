import PropTypes from 'prop-types'
import React from 'react'

const EditUnknown = props => (
  <div className="ui segment inverted">
    <h3>
      Edit {props.asset.kind} '{props.asset.name}'
    </h3>
    <p>
      <a className="ui red label">Editor for Asset type '{props.asset.kind}' is not yet implemented.</a>
    </p>
    <p>If you are seeing this, there's probably some cool new Asset type being tested by the devs! Oooh!</p>
  </div>
)

EditUnknown.propTypes = {
  asset: PropTypes.object,
}

export default EditUnknown
