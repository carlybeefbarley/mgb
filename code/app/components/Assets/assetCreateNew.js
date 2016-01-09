import React from 'react';
import {Link} from 'react-router';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';


export default class AssetCreateNew extends React.Component {
  propTypes:{
    defaultName: React.PropTypes.string,
    handleCreateAssetClick: React.PropTypes.func
    }

  static defaultProps = {
    defaultName: 'New Asset Name...',
  };

  constructor() {
    super();
  }



  render() {


    // Build the list of 'Create New Asset' Menu choices
    let choices = AssetKindKeys.map((k) => {
      return (
        <div className="item" data-value={k} key={k} onClick={this.handleCreateAssetClick.bind(this,k)}>
        <i className={AssetKinds[k].icon + " icon"}></i>
        {AssetKinds[k].name}
      </div>
      );
    });

    // Create the       | Create Asset v | ---- |    UI
    return (
      <div className="ui menu">
        <div className="ui simple dropdown item">
          Create Asset
          <i className="dropdown icon"></i>
          <div className="menu">
            {choices}
          </div>
        </div>
        <div className="right menu">
          <div className="item">
            <div className="ui transparent icon input">
              <input ref="chosenNewAssetName" type="text" placeholder={this.props.defaultName}></input>
                <i className="cube icon"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleCreateAssetClick(assetKindKey)
  {
    if (this.handleCreateAssetClick)
      this.props.handleCreateAssetClick(assetKindKey, this.refs.chosenNewAssetName.value);
  }
}