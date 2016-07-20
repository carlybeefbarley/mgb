import React from 'react';
import {AssetKinds, AssetKindKeys, safeAssetKindStringSepChar} from '/imports/schemas/assets';

// UI Component to render menus to allow asset types to be selected

export default AssetKindsSelector =  React.createClass({
  PropTypes: {
    kindsActive: React.PropTypes.string,              // String with safeAssetKindStringSepChar- separated list of AssetKindKeys strings which are active. 
    handleToggleKindCallback: React.PropTypes.func    // We will call this back with a string indicating which Kind to toggle. Special value "__all" means enable all  
  },

  // React Callback: componentDidMount()
  componentDidMount: function() {
    $('.hazAkPopup').popup()
  },
  
  componentWillUnmount: function() {
    $('.hazAkPopup').popup('destroy')
  },

  render: function() {
    // Split kinds string into array for convenience
    const kindsArray = this.props.kindsActive.split(safeAssetKindStringSepChar)
    var countActive = 0
    // Build the list of 'Create New Asset' Menu choices
    const choices = AssetKindKeys.map((k) => {
      // if k is in this.props.kindsActive then it is shown as active
      const active = _.includes(kindsArray, k)
      if (active) countActive++
      const sty = active ? {} : { color: "#ccc"}
      const icon = active ? <i className="ui checkmark box icon"></i> : <i className="ui square outline icon"></i>
      return (
        <a  className={"ui hazAkPopup " + (active ? "active item" : "item")} 
            data-value={k} 
            key={k} 
            style={sty}
            onClick={this.handleToggleKindClick.bind(this,k)}
           data-position="right center"
           data-title={AssetKinds[k].name}
           data-content={`Click to show only ${AssetKinds[k].name} assets. Alt-click to multi-select ${AssetKinds[k].name} which asset kinds to show`}>
            <i className={AssetKinds[k].icon + " icon"}></i><span>{icon} {AssetKinds[k].name}</span>
          </a>
      ) 
    });
    
    const allActive = (countActive === choices.length)
    choices.unshift(
      <a  className={"ui hazAkPopup " + (allActive ? "active item" : "item")} 
            data-value="__all" 
            key="__all"
            onClick={this.handleToggleKindClick.bind(this,"__all")}
            data-position="right center"
            data-title="All"
            data-content="Click to show all asset kinds">
            <i className="asterisk icon"></i> 
            <span>{allActive ? <i className="ui checkmark box icon"></i> : <i className="ui square outline icon"></i>} All</span>
          </a>
    )

    return (
          <div className="ui small secondary vertical menu">            
            {choices}
          </div>
    );
  },

  handleToggleKindClick(assetKindKey, event)
  {
    if (this.props.handleToggleKindCallback)
      this.props.handleToggleKindCallback(assetKindKey, event.altKey);
  }

})
