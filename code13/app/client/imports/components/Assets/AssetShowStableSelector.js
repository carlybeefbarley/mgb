import React, { PropTypes } from 'react'
import { Button } from 'semantic-ui-react'

const AssetShowStableSelector = props => {
  const { showStableFlag, handleChangeFlag } = props
  const active = showStableFlag === "1"

  return (
    <Button 
        icon='lock'
        color={ active ? 'blue' : null }
        onClick={() => handleChangeFlag( active ? "0" : "1" ) }
        data-delay='250'
        data-position='bottom left'
        data-tooltip={ active ? 
                          "Currently showing ONLY 'Complete' assets. Click here to ALSO show 'Incomplete' assets" 
                        : "Currently showing 'Complete' AND 'Incomplete' assets. Click here to ONLY show 'Complete' assets"} 
    />
  )
}

AssetShowStableSelector.propTypes = {
  showStableFlag:   PropTypes.string,         // "1" or "0". If "1", show only stable assets
  handleChangeFlag: PropTypes.func            // params = newShowStableFlag.. should be "1" or "0"
}

export default AssetShowStableSelector