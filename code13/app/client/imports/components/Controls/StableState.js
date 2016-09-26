import React, { PropTypes } from 'react'
import { Icon } from 'stardust'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

const _propTypes = {
  isStable:       PropTypes.bool.isRequired,  // Current isStable state of the asset
  handleChange:   PropTypes.func,             // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool              // If false, then don't allow popup/change
}

const StableState = (props) => {
  const { isStable, canEdit, handleChange } = props

  return (
    <Icon
        title={isStable ? 'This Asset has been marked \'Done\' and is protected against edits. Click to allow edits again' : 'Click to marked this asset as \'Done\' so it is protected against accidetal edits. It\'s ok, you can clear the \'Done\' marker later if you need to'}
        onClick={() => { canEdit && handleChange && handleChange(!isStable) }} 
        name={isStable ? 'inverted bordered blue checkmark' : 'bordered checkmark'} />
  )
}

StableState.propTypes = _propTypes
export default StableState