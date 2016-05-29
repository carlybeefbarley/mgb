// UI Component to render asset types

import React from 'react';
import ReactDOM from 'react-dom';
import {AssetKinds, AssetKindKeys, safeAssetKindStringSepChar} from '../../schemas/assets';




export default class AssetKindsSelector extends React.Component {
  // propTypes:{
  //   kindsActive: React.PropTypes.string,              // String with safeAssetKindStringSepChar- separated list of AssetKindKeys strings which are active. 
  //   handleToggleKindCallback: React.PropTypes.func    // We will call this back with a string indicating which Kind to toggle
  //   }

  constructor(props) {
    super(props);
  }

  // React Callback: componentDidMount()
  componentDidMount() {
    this.activateToolPopups();
  }

  activateToolPopups() {
    // See http://semantic-ui.com/modules/popup.html#/usage
    let $a = $(ReactDOM.findDOMNode(this))
    $a.find('.hazPopup').popup()
  }

  render() {
    // Split kinds string into array for convenience
    const kindsArray = this.props.kindsActive.split(safeAssetKindStringSepChar)
    
    // Build the list of 'Create New Asset' Menu choices
    const choices = AssetKindKeys.map((k) => {
      // if k is in this.props.kindsActive then it is shown as active
      const active = _.includes(kindsArray, k)
      const sty = active ? {} : { color: "#ccc"}
      const icon = active ? <i className="ui checkmark box icon"></i> : <i className="ui square outline icon"></i>
      return (
        <a  className={"ui hazPopup " + (active ? "active item" : "item")} 
            data-value={k} 
            key={k} 
            style={sty}
            onClick={this.handleToggleKindClick.bind(this,k)}
           data-position="right center"
           data-title={AssetKinds[k].name}
           data-content={`Click to ${active ? "hide" : "show"} ${AssetKinds[k].name} assets. Alt-click to only show ${AssetKinds[k].name} assets`}>
            <i className={AssetKinds[k].icon + " icon"}></i><span>{icon} {AssetKinds[k].name}</span>
          </a>
      ) 
    });

    return (
          <div className="ui small secondary vertical menu">            
            {choices}
          </div>
    );
  }

  handleToggleKindClick(assetKindKey, event)
  {
    if (this.props.handleToggleKindCallback)
      this.props.handleToggleKindCallback(assetKindKey, event.altKey);
  }
}
