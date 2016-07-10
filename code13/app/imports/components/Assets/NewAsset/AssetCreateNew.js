import React from 'react';
import { AssetKinds, AssetKindKeys } from '/imports/schemas/assets';
import { doesUserHaveRole } from '/imports/schemas/roles'


export default AssetCreateNew = React.createClass({
  propTypes:{
    handleCreateAssetClick: React.PropTypes.func.isRequired,        // Callback function to create the asset, and is expected to navigate to the new page. Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    placeholderName:        React.PropTypes.string,
    currUser:               React.PropTypes.object                  // currently logged in user (if any)
  },


  getDefaultProps: function () {
    return { placeholderName: 'name for new asset..' }
  },


  getInitialState: function () {
    return { 
      selectedKind: "",     // "" or one of AssetKindKeys[]
      newAssetName: ""      // "" or a valid assetName string
    }
  },


  render: function() {
    const isAssetNameValid = (this.state.newAssetName !== "")   // TODO - some checks for crazy characters
    const isKindChosen = (this.state.selectedKind !== "")
    const isAssetReadyToCreate = isKindChosen && isAssetNameValid
    const chosenKindStr = isKindChosen ? AssetKinds[this.state.selectedKind].name : "Asset"
    const chosenNameStr = isAssetNameValid ? `"${this.state.newAssetName}"` : ""
    const createButtonClassName = "ui primary" + (isAssetReadyToCreate ? " " : " disabled ") + "button"
    const createButtonTooltip = isAssetReadyToCreate ? "Click here to create your new Asset" : "You must choose a valid name and 'kind' for your new asset. You can rename it later if you wish, but you cannot change it's 'kind' later"

    return (
      <div>
        <div title={createButtonTooltip}>
          <div className={createButtonClassName} onClick={this.handleCreateAssetClick} >
            Create {chosenKindStr} {chosenNameStr}
            <i className="right chevron icon"></i>
          </div>
        </div>

        <div className="ui padded segment">
          <h4 className="ui header">Enter Asset Name</h4>
          <div className="ui items">
            <div className={"ui fluid input" + (isAssetNameValid ? "" : " error")}>
              <input className="fluid" type="text" value={this.state.newAssetName} onChange={(e) => this.setState({ newAssetName: e.target.value})} placeholder={this.props.placeholderName} ref={inp => (inp && inp.focus())}></input>
            </div>
          </div>
        </div>
        <div className="ui padded segment">
          <h4 className="ui header">Choose an Asset Kind</h4>        
          <div className="ui items">
            { this.renderAssetKindChoices() }
          </div>
        </div>
      </div>
    )
  },


  renderAssetKindChoices: function() {
    return AssetKindKeys.map((k) => {
      const ak = AssetKinds[k]
      const isActive = (k === this.state.selectedKind)

      let sty = { 
        backgroundColor: (isActive ? "rgba(0,255,0,0.15)" : "rgba(0,0,0,0.04)"),        
        marginLeft: "6px", 
        marginRight: "6px", 
        marginTop: "6px", 
        marginBottom:"6px", 
        padding: "8px 8px 8px 8px"
      }
      if (ak.requiresUserRole)
      {
        if (!doesUserHaveRole(this.props.currUser, ak.requiresUserRole))
          return null // Don't show
        if (!isActive)
          sty.backgroundColor = "rgba(0,0,255,0.04)"    // Blue for the special ones 
      }

      return (
        <div className={"ui link item"} key={k} style={sty} onClick={this.handleSelectAssetKindClick.bind(this,k)}>
          <div className="ui mini image">
            <div className="center">
              <i className={"huge " + ak.icon + " icon"}></i>
            </div>
          </div>
          <div className="content" >
            <div className="header">{ak.name}</div>
            <div className="description">
              { ak.description }
              { ak.requiresUserRole && ` (Only available to ${ak.requiresUserRole} users)`}
              </div>
          </div>
        </div>
      )
    });
  },


  handleSelectAssetKindClick: function(assetKindKey)
  {
    this.setState( { selectedKind: assetKindKey})
  },


  handleCreateAssetClick: function()
  {
    this.props.handleCreateAssetClick(this.state.selectedKind, this.state.newAssetName)
  }

})