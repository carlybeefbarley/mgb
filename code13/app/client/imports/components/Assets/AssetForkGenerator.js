import React, { PropTypes } from 'react'

const  AssetForkGenerator = ( { asset, isForkPending, showBordered, doForkAsset } ) => (
  <div className='ui simple dropdown item'>
    <i className={`${isForkPending ? 'orange ' : '' }  ${showBordered ? 'bordered' : '' } fork icon`} />
    <div className="menu">
      <div className="header item" title="Create a new Asset based on (forked from) this Asset">
          Fork: Create a new Asset from this one
      </div>
      <a className="item" onClick={doForkAsset}>
        { isForkPending && <small>(In process) </small> }
        Fork '{asset.name}'
      </a>
    </div>
  </div>
)

AssetForkGenerator.propTypes = {
  asset:              PropTypes.object.isRequired,
  isForkPending:      PropTypes.bool,
  showBordered:       PropTypes.bool,
  doForkAsset:        PropTypes.func.isRequired       // Meteor.call callback style (error, result). Result is new doc Id
}

export default AssetForkGenerator