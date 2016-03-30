import React, { PropTypes } from 'react';
import AssetCard from './AssetCard.js';

export default  AssetList = React.createClass({
  propTypes: {
    assets: PropTypes.array.isRequired,
    currUser: PropTypes.object,                             // currently Logged In user (not always provided)
    canEdit: PropTypes.bool                                 // Can be false
  },

  render: function() {
    let assetCards = this.props.assets.map((asset) => {
      return (
          <AssetCard
            canEdit={this.props.currUser && asset.ownerId === this.props.currUser._id}
            currUser={this.props.currUser}
            asset={asset}
            key={asset._id}
            showEditButton={true}
            showToast={this.props.showToast} />
      );
    })

    return (
      <div className="ui four doubling cards">
        {assetCards}
      </div>
    );
  }
})