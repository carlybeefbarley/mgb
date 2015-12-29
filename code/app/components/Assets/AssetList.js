import React, { PropTypes } from 'react';
import AssetCard from './AssetCard.js';

export default class AssetList extends React.Component {
  static propTypes = {
    assets: PropTypes.array.isRequired
  }

  render() {
    let assets = this.props.assets.map((asset) => {
      return (
        <div key={asset._id} className={this.props.cardStyle} >
          <AssetCard
            asset={asset}
            canEdit={this.props.canEdit}
            showToast={this.props.showToast} />
        </div>
      );
    })

    return (
      <div>
        {assets}
      </div>
    );
  }
}
