import React, { PropTypes } from 'react'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

const _propTypes = {
  isStable:       PropTypes.bool.isRequired,  // Current isStable state of the asset
  handleChange:   PropTypes.func,             // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool              // If false, then don't allow popup/change
}

const _makeTitle = (isStable, canEdit) =>
{
  if (isStable && canEdit)
    return 'This Asset has been marked \'Complete\' and is protected against edits. Click to allow edits again'
  if (isStable)
    return 'This Asset has been marked \'Complete\' by it\'s owner'
  if (canEdit)
    return 'Click to mark this asset as \'Complete\' so it can be protected against accidental edits. It\'s ok, you can clear the \'Complete\' marker later if you change your mind'
  return null
}

const StableState = (props) => {
  const { isStable, canEdit, handleChange } = props

  if (!isStable && !canEdit)
    return null

  return (
    <i
        title={ _makeTitle(isStable, canEdit) }
        onClick={() => { canEdit && handleChange && handleChange(!isStable) }} 
        className={isStable ? 'inverted bordered blue lock icon' : 'bordered unlock icon'} />
  )
}

StableState.propTypes = _propTypes
export default StableState