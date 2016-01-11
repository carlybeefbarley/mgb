import React, { PropTypes } from 'react';
import AssetCard from './AssetCard.js';

export default class AssetList extends React.Component {
  static propTypes = {
    assets: PropTypes.array.isRequired
  }

  render() {
    let assets = this.props.assets.map((asset) => {
      return (
          <AssetCard
            asset={asset}
            key={asset._id}
            canEdit={this.props.canEdit}
            showToast={this.props.showToast} />
      );
    })

    return (
      <div className="ui grid cards">
        {assets}
      </div>
    );
  }
}
