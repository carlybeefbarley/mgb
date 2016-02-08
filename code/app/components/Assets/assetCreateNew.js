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

  constructor(props) {
    super(props);
  }

  render() {
    // Build the list of 'Create New Asset' Menu choices
    let choices = AssetKindKeys.map((k) => {
      return  (typeof(AssetKinds[k]) === 'function') ?
         null
        :
        (
          <a className="item" data-value={k} key={k} onClick={this.handleCreateAssetClick.bind(this,k)}>
            <i className={AssetKinds[k].icon + " icon"}></i>
            {AssetKinds[k].name}
          </a>
        );
    });

    // Create the       | Create Asset v | ---- |    UI
    return (
      <div className="ui compact right floated inverted menu">
        <div className="ui simple dropdown item">
          New Asset
          <i className="dropdown icon"></i>
          <div className="menu">
            <div className="item">
              <div className="ui transparent input">
                <input className="fluid" ref="chosenNewAssetName" type="text" placeholder={this.props.defaultName}></input>
              </div>
            </div>
            {choices}
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
