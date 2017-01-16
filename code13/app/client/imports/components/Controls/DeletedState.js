import React, { PropTypes } from 'react'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

const _propTypes = {
  isDeleted:      PropTypes.bool.isRequired,  // Current deleted state of the asset
  handleChange:   PropTypes.func,             // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool              // If false, then don't allow popup/change
}


const _makeTitle = (isDeleted, canEdit) =>
{
  if (isDeleted && canEdit)
    return 'This asset has been deleted (moved to the \'Trash\'). Click to Undelete it. Deleted Assets are automatically purged from the system after a while' 
  if (isDeleted)
    return 'This Asset has been marked \'Complete\' (moved to the \'Trash\') by it\'s owner'
  if (canEdit)
    return 'Click to delete this asset. It\'s ok, you can undelete it again if you need to'
  return null
}


const DeletedState = (props) => {
  const { isDeleted, canEdit, handleChange } = props

  if (!isDeleted && !canEdit)
    return null

  return (
    <i
        title={isDeleted ? 'This asset has been deleted. Click to Undelete it' : 'Click to delete this asset. It\'s ok, you can undelete it again if you need to'}
        onClick={() => { canEdit && handleChange && handleChange(!isDeleted) }} 
        className={isDeleted ? 'inverted bordered red trash icon' : 'bordered trash outline icon'} />
  )
}

DeletedState.propTypes = _propTypes
export default DeletedState