import React, { PropTypes } from 'react';
import AssetCard from './AssetCard.js';

export default class AssetList extends React.Component {
  // static propTypes = {
  //   assets: PropTypes.array.isRequired,
  //   currUser: PropTypes.object
  // }

  render() {
    let assetCards = this.props.assets.map((asset) => {
      return (
          <AssetCard
            canEdit={this.props.currUser && asset.ownerId === this.props.currUser._id}
            asset={asset}
            key={asset._id}
            showEditButton={this.props.currUser && this.props.currUser._id === asset.ownerId}
            showToast={this.props.showToast} />
      );
    })

    return (
      <div className="ui four doubling cards">
        {assetCards}
      </div>
    );
  }
}
