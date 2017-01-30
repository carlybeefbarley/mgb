import React, { PropTypes } from 'react'
import { Popup, Button } from 'semantic-ui-react'

const AssetShowStableSelector = ( { showStableFlag, handleChangeFlag } ) => {
  const active = showStableFlag === "1"
  const button = (
    <Button 
        icon='lock'
        color={ active ? 'blue' : null }
        onClick={ () => handleChangeFlag( active ? "0" : "1" ) } />
  )

  return (
    <Popup 
        size='small'
        trigger={button}
        on='hover'
        positioning='bottom center'
        header='Show/hide completed Assets'      
        content={ active ? 
                    "Currently showing ONLY 'Completed' Assets. Click here to ALSO show 'Incomplete' Assets" 
                  : "Currently showing 'Completed' AND 'Incomplete' Assets. Click here to ONLY show 'Completed' Assets"} 
    />
  )
}

AssetShowStableSelector.propTypes = {
  showStableFlag:   PropTypes.string,         // "1" or "0". If "1", show only stable assets
  handleChangeFlag: PropTypes.func            // params = newShowStableFlag.. should be "1" or "0"
}

export default AssetShowStableSelector