import React, { PropTypes } from 'react'


export default AssetForkGenerator = ( { asset, showBordered, forkResultCallback } ) => {
  
  return (
    <div className='ui simple dropdown item'>
      <i className={`cloud ${showBordered ? 'bordered' : '' } fork icon`} />
      <div className="menu">
        <div className="header item" title="Create a new Asset based on (forked from) this Asset">
          Fork: Create a new Asset from this one
        </div>
        <a className="item" onClick={() => Meteor.call("Azzets.fork", asset._id, forkResultCallback)}>
          Fork '{asset.name}'
        </a>
      </div>
    </div>
  )
}

AssetForkGenerator.propTypes = {
  asset:              PropTypes.object.isRequired,
  showBordered:       PropTypes.bool,
  forkResultCallback: PropTypes.func.isRequired       // Meteor.call callback style (error, result). Result is new doc Id
}