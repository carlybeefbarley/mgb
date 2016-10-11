import React, { Proptypes } from 'react'
import { Icon, Button } from 'semantic-ui-react'

export default AssetShowStableSelector = props => {
  const { showStableFlag, handleChangeFlag } = props
  const active = showStableFlag === "1"

  return (
    <Button 
        color={ active ? 'blue' : null } 
        onClick={() => handleChangeFlag( active ? "0" : "1" ) }
        data-delay='250'
        data-position='bottom left'
        data-tooltip={ active ? 
                          "Currently showing ONLY 'Complete' assets. Click here to ALSO show 'Incomplete' assets" 
                        : "Currently showing 'Complete' AND 'Incomplete' assets. Click here to ONLY show 'Complete' assets"}>
      <Icon name='lock' />
    </Button>
  )
}

AssetShowStableSelector.propTypes = {
  showStableFlag: React.PropTypes.string,           // "1"" or "0". If "1", show only stable assets
  handleChangeFlag: React.PropTypes.func            // params = newShowStableFlag.. should be "1" or "0"
}