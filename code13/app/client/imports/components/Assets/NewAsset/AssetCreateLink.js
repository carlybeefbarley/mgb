import React, { PropTypes} from 'react'
import QLink from '/client/imports/routes/QLink'


export default AssetCreateLink = () => (
  <QLink className='ui compact green button' to='/assets/create' id="mgbjr-create-new-asset">
    Create New Asset
  </QLink>
)