import React, { PropTypes} from 'react'
import QLink from '/client/imports/routes/QLink'


const AssetCreateLink = ( { projectName } ) => (
  <QLink 
        className='ui compact green button' 
        to='/assets/create' 
        query={ (projectName && projectName.length > 1) ? { projectName: projectName } : null}
        id="mgbjr-create-new-asset">
    Create New Asset
  </QLink>
)

AssetCreateLink.PropTypes = {
  projectName: PropTypes.string
}

export default AssetCreateLink