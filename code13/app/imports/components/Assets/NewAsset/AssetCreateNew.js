import React, { PropTypes } from 'react';
import { AssetKinds, AssetKindKeys } from '/imports/schemas/assets';
import AssetCreateSelectKind from './AssetCreateSelectKind';


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
      buttonActionPending: false,     // True after the button has been pushed. so it doesn't get pushed twice
      selectedKind: "",               // "" or one of AssetKindKeys[]
      newAssetName: ""                // "" or a valid assetName string
    }
  },


  render: function() {
    const { currUser } = this.props
    const isAssetNameValid = (this.state.newAssetName !== "")   // TODO - some checks for crazy characters
    const isKindChosen = (this.state.selectedKind !== "")
    const isAssetReadyToCreate = isKindChosen && isAssetNameValid
    const chosenKindStr = isKindChosen ? AssetKinds[this.state.selectedKind].name : "Asset"
    const chosenNameStr = isAssetNameValid ? `"${this.state.newAssetName}"` : ""
    const isButtonDisabled = this.state.buttonActionPending || !isAssetReadyToCreate
    const createButtonClassName = "ui primary" + (isButtonDisabled ? " disabled " : " ") + "button"
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
          <AssetCreateSelectKind 
            currUser={currUser} 
            selectedKind={this.state.selectedKind} 
            handleSelectAsset={this.handleSelectAssetKindClick} />
        </div>
      </div>
    )
  },


  handleSelectAssetKindClick: function(assetKindKey)
  {
    this.setState( { selectedKind: assetKindKey})
  },


  handleCreateAssetClick: function()
  {
    this.setState( { buttonActionPending: true})
    this.props.handleCreateAssetClick(this.state.selectedKind, this.state.newAssetName)
  }

})