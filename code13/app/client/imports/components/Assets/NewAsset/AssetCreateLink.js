import React, { PropTypes} from 'react'
import QLink from '/client/imports/routes/QLink'


const _makeQuery = ( assetKind, projectName ) => {
  const retval = {}

  if (assetKind)
    retval.assetKind = assetKind

  if (projectName && projectName.length > 1) 
    retval.projectName = projectName

  return retval
}

const AssetCreateLink = ( { assetKind, projectName } ) => (
  <QLink 
        className='ui compact green button' 
        to='/assets/create' 
        query={ _makeQuery(assetKind, projectName) }
        id="mgbjr-create-new-asset">
    Create New Asset
  </QLink>
)

AssetCreateLink.PropTypes = {
  assetKind: PropTypes.string,
  projectName: PropTypes.string
}

export default AssetCreateLink