import React, { PropTypes } from 'react'
import { Icon } from 'stardust'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

const _propTypes = {
  isDeleted:      PropTypes.bool.isRequired,  // Current deleted state of the asset
  handleChange:   PropTypes.func,             // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool              // If false, then don't allow popup/change
}

const DeletedState = (props) => {
  const { isDeleted, canEdit, handleChange } = props

  return (
    <Icon
        title={isDeleted ? 'This asset has been deleted. Click to Undelete it' : 'Click to delete this asset. It\'s ok, you can undelete it again if you need to'}
        onClick={() => { canEdit && handleChange && handleChange(!isDeleted) }} 
        name={isDeleted ? 'inverted bordered red trash' : 'bordered trash outline'} />
  )
}

DeletedState.propTypes = _propTypes
export default DeletedState