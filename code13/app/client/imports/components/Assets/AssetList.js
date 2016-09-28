import React, { PropTypes } from 'react'
import AssetCard from './AssetCard.js'

export default AssetList = props => (
  <div className="ui cards">
    {
      props.assets.map((asset) => (
        <AssetCard
          canEdit={props.currUser && asset.ownerId === props.currUser._id}
          currUser={props.currUser}
          asset={asset}
          ownersProjects={props.ownersProjects}
          key={asset._id}
          showEditButton={true}
          showToast={props.showToast}
          renderView={props.renderView}
          allowDrag={props.allowDrag} />
      ))
    }
  </div>
)

AssetList.propTypes = {
  assets: PropTypes.array.isRequired,
  ownersProjects: PropTypes.array,        // Project array for Asset Owner - only makes sense if the assets all belong to same user (and should only be set by caller in this case). If provided, pass to AssetCard
  currUser: PropTypes.object,             // currently Logged In user (not always provided)
  canEdit: PropTypes.bool,                // Can be false
  renderView: PropTypes.string,           // One of null/undefined  OR  one of the keys of AssetCard.assetViewChoices
  allowDrag: PropTypes.bool.isRequired    // True if drag is allowed
}