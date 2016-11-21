import _ from 'lodash'
import React, { PropTypes } from 'react'
import { AssetKinds, AssetKindKeys, safeAssetKindStringSepChar } from '/imports/schemas/assets'

// UI Component to render menus to allow asset types to be selected

export default AssetKindsSelector =  React.createClass({
  PropTypes: {
    kindsActive:              PropTypes.string, // String with safeAssetKindStringSepChar- separated list of AssetKindKeys strings which are active.
    handleToggleKindCallback: PropTypes.func,   // We will call this back with a string indicating which Kind to toggle. Special value "__all" means enable all
    showCompact:              PropTypes.bool    // If true, show very compact
  },

  // React Callback: componentDidMount()
  componentDidMount: function() {
    $('.hazAkPopup').popup()
  },

  componentWillUnmount: function() {
    $('.hazAkPopup').popup('destroy')
  },

  render: function() {
    const { showCompact, kindsActive } = this.props
    const popPosition = showCompact ? 'bottom right' : 'right center'
    const baseSty = showCompact ? { padding: '3px 4px 3px 5px'} : {}

    // Split kinds string into array for convenience
    const kindsArray = kindsActive.split(safeAssetKindStringSepChar)

    // Build the list of 'Create New Asset' Menu choices
    const choices = AssetKindKeys.map((k) => {
      // if k is in kindsActive then it is shown as active
      const active = _.includes(kindsArray, k)
      const sty = active ? {} : { color: "#ccc"}
      const icon = active ? <i className="ui checkmark box icon"></i> : <i className="ui square outline icon"></i>
      return (
        <a  className={"ui hazAkPopup " + (active ? "active item" : "item")}
            data-value={k}
            key={k}
            style={ _.merge(sty, baseSty) }
            onClick={this.handleToggleKindClick.bind(this,k)}
            data-position={popPosition}
            data-title={AssetKinds[k].name}
            data-content={`Click to show only ${AssetKinds[k].name} assets. Alt-click to multi-select ${AssetKinds[k].name} which asset kinds to show`}>
          <i className={AssetKinds[k].icon + " icon"} />
          { !showCompact && <span>{icon} {AssetKinds[k].name}</span> }
        </a>
      )
    })

    return (
      <div className={`ui small ${showCompact ? 'compact' : 'secondary vertical'} menu`}>
        {choices}
      </div>
    )
  },

  handleToggleKindClick(assetKindKey, event)
  {
    if (this.props.handleToggleKindCallback)
      this.props.handleToggleKindCallback(assetKindKey, event.altKey)
  }
})