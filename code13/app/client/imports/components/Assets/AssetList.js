import React, { PropTypes } from 'react'
import AssetCard from './AssetCard.js'

export default  AssetList = React.createClass({
  propTypes: {
    assets: PropTypes.array.isRequired,
    ownersProjects: PropTypes.array,        // Project array for Asset Owner - only makes sense if the assets all belong to same user (and should only be set by caller in this case). If provided, pass to AssetCard
    currUser: PropTypes.object,             // currently Logged In user (not always provided)
    canEdit: PropTypes.bool,                // Can be false
    renderType: PropTypes.string,           // One of null/undefined  OR  "short"
    allowDrag: PropTypes.bool.isRequired        // True if drag is allowed

  },

  render: function() {
    let assetCards = this.props.assets.map((asset) => {
      return (
        <AssetCard
          canEdit={this.props.currUser && asset.ownerId === this.props.currUser._id}
          currUser={this.props.currUser}
          asset={asset}
          ownersProjects={this.props.ownersProjects}
          key={asset._id}
          showEditButton={true}
          showToast={this.props.showToast} 
          renderType={this.props.renderType}
          allowDrag={this.props.allowDrag}
          />
      )
    })

    return (
      <div className="ui cards">
        {assetCards}
      </div>
    )
  }
})
