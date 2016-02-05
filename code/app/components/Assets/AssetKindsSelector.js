// UI Component to render asset types

import React from 'react';
import ReactDOM from 'react-dom';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';

export default class AssetKindsSelector extends React.Component {
  propTypes:{
    kindsActive: React.PropTypes.array,                  // array of AssetKindKeys strings which are active
    handleToggleKindCallback: React.PropTypes.func       // We will call this back with a string indicating which Kind to toggle
    }

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
    // Build the list of 'Create New Asset' Menu choices
    let choices = AssetKindKeys.map((k) => {
      // if k is in this.props.kindsActive

      if (typeof(AssetKinds[k]) === 'function')
        return null; // ignore the helper functions

      let active=_.includes(this.props.kindsActive, k)

      return (      // TODO - add   {AssetKinds[k].name in popup
        <a className={"ui hazPopup " + (active ? "green button" : "button")} data-value={k} key={k} onClick={this.handleToggleKindClick.bind(this,k)}
           data-position="bottom center"
           data-title={AssetKinds[k].name}
           data-content={`Click to ${active ? "hide" : "show"} ${AssetKinds[k].name} assets`}>
            <i className={AssetKinds[k].icon + " icon"}></i>
          </a>
      )
    });

      return (

         <div className="ui item">
           <div className="ui icon buttons">
             {choices}
           </div>
         </div>
    );
  }

  handleToggleKindClick(assetKindKey)
  {
    if (this.props.handleToggleKindCallback)
      this.props.handleToggleKindCallback(assetKindKey);
  }
}
