import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Icon } from 'semantic-ui-react'

const DeletedState = ({ isDeleted, canEdit, handleChange, operationPending }) => (
  <Popup
    size="small"
    position="bottom right"
    mouseEnterDelay={500}
    trigger={
      <Icon
        bordered
        color={operationPending ? 'orange' : isDeleted ? 'red' : null}
        inverted={isDeleted}
        name={isDeleted ? 'trash' : 'trash outline'}
        onClick={() => {
          canEdit && handleChange && !operationPending && handleChange(!isDeleted)
        }}
      />
    }
    header={isDeleted ? 'Undelete Asset' : 'Delete Asset'}
    content={
      isDeleted ? (
        "This asset has been deleted, but hasn't yet been purged. Click to Undelete it now"
      ) : (
        "Click to delete this asset. It's ok, you will have a few days to undelete it if you need it again."
      )
    }
  />
)

DeletedState.propTypes = {
  isDeleted: PropTypes.bool.isRequired, // Current deleted state of the asset
  operationPending: PropTypes.bool.isRequired, // Disabled delete temporarily
  handleChange: PropTypes.func, // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit: PropTypes.bool, // If false, then don't allow popup/change
}
export default DeletedState
