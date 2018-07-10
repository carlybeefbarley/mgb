import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Icon } from 'semantic-ui-react'

const _makeTitle = (isStable, canEdit) => {
  if (isStable && canEdit)
    return "Your Asset has been marked 'Locked' and is protected against edits. Click to allow edits again"
  if (isStable) return "This Asset has been marked 'Locked' by it's owner"
  if (canEdit)
    return "Click to mark your asset as 'Locked' so it can be protected against accidental edits. It's ok, you can unlock it later if you change your mind"
  return 'This asset is Unlocked. The Asset owner may choose to Lock it to prevent any edits'
}

const StableState = ({ isStable, canEdit, handleChange }) => (
  <Popup
    size="small"
    position="bottom right"
    mouseEnterDelay={500}
    trigger={
      <Icon
        bordered
        color={isStable ? 'blue' : null}
        inverted={isStable}
        name={isStable ? 'lock' : 'unlock'}
        onClick={() => {
          canEdit && handleChange && handleChange(!isStable)
        }}
      />
    }
    header={isStable ? 'Unlock Asset' : 'Lock Asset'}
    content={_makeTitle(isStable, canEdit)}
  />
)

StableState.propTypes = {
  isStable: PropTypes.bool.isRequired, // Current isStable state of the asset
  handleChange: PropTypes.func, // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit: PropTypes.bool, // If false, then don't allow popup/change
}

export default StableState
