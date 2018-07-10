import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Button } from 'semantic-ui-react'

const AssetShowDeletedSelector = ({ showDeletedFlag, handleChangeFlag }) => {
  const active = showDeletedFlag === '1'
  const button = (
    <Button icon="trash" color={active ? 'red' : null} onClick={() => handleChangeFlag(active ? '0' : '1')} />
  )
  return (
    <Popup
      size="small"
      trigger={button}
      on="hover"
      position="bottom center"
      header="Show/hide deleted assets"
      content="Click here to show/hide assets that have been deleted"
    />
  )
}

AssetShowDeletedSelector.propTypes = {
  showDeletedFlag: PropTypes.string, // "1" or "0". If "1", show only deleted assets
  handleChangeFlag: PropTypes.func, // params = newShowDeletedFlag.. should be "1" or "0"
}

export default AssetShowDeletedSelector
