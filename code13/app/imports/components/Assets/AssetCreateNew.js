import React from 'react';
import {Link} from 'react-router';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';


export default class AssetCreateNew extends React.Component {
  // propTypes:{
  //   handleCreateAssetClick: React.PropTypes.func
  //   }

  constructor(props) {
    super(props);
    this.defaultProps = {
      defaultName: 'Name...'
    };
  }

  render() {
    // Build the list of 'Create New Asset' Menu choices
    let choices = AssetKindKeys.map((k) => {
      return  (typeof(AssetKinds[k]) === 'function') ?
         null
        :
        (
          <a className={(AssetKinds[k].disable ? "disabled ": "") + "item"} 
              data-value={k} 
              title={AssetKinds[k].description}
              key={k} 
              onClick={this.handleCreateAssetClick.bind(this,k)}
              >
            <i className={AssetKinds[k].icon + " icon"}></i>
            {AssetKinds[k].name}
          </a>
        );
    });

    // Create the       | Create Asset v | ---- |    UI
    return (
      <div className="ui compact tiny right floated  inverted menu">
        <div className="ui simple dropdown item">
          New Asset
          <i className="dropdown icon"></i>
          <div className="menu">
            <div className="item">
              <div className="ui transparent input">
                <input className="fluid" ref="chosenNewAssetName" type="text" placeholder="Name..."></input>
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
