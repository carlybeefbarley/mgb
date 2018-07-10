import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Button } from 'semantic-ui-react'

const AssetShowStableSelector = ({ showStableFlag, handleChangeFlag }) => {
  const active = showStableFlag === '1'
  const button = (
    <Button icon="lock" color={active ? 'blue' : null} onClick={() => handleChangeFlag(active ? '0' : '1')} />
  )

  return (
    <Popup
      size="small"
      trigger={button}
      on="hover"
      position="bottom center"
      header="Show/hide locked Assets"
      content={
        active ? (
          "Currently showing ONLY 'Locked' Assets. Click here to ALSO show 'Unlocked' Assets"
        ) : (
          "Currently showing 'Locked' AND 'Unlocked' Assets. Click here to ONLY show 'Locked' Assets"
        )
      }
    />
  )
}

AssetShowStableSelector.propTypes = {
  showStableFlag: PropTypes.string, // "1" or "0". If "1", show only stable assets
  handleChangeFlag: PropTypes.func, // params = newShowStableFlag.. should be "1" or "0"
}

export default AssetShowStableSelector
