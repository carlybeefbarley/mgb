import PropTypes from 'prop-types'
import React from 'react'
import QLink from '/client/imports/routes/QLink'

const _makeQuery = (assetKind, projectName, assetName) => {
  const retval = {}

  if (assetKind) retval.assetKind = assetKind

  if (projectName && projectName.length > 1) retval.projectName = projectName

  if (assetName && assetName.length > 0) retval.assetName = assetName

  return retval
}

const AssetCreateLink = ({ assetKind, projectName, assetName, label, classNames }) => (
  <QLink
    className={`ui compact ${classNames || ' '} green button`}
    to="/assets/create"
    query={_makeQuery(assetKind, projectName, assetName)}
    id="mgbjr-create-new-asset"
  >
    {label || 'Create New Asset'}
  </QLink>
)

AssetCreateLink.PropTypes = {
  assetKind: PropTypes.string,
  projectName: PropTypes.string,
  assetName: PropTypes.string,
  label: PropTypes.string,
  classNames: PropTypes.string,
}

export default AssetCreateLink
