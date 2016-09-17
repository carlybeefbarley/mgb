import React, { PropTypes } from 'react'
import { AssetKinds } from '/imports/schemas/assets'
import AssetCreateSelectKind from './AssetCreateSelectKind'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import validate from '/imports/schemas/validate'

export default AssetCreateNew = React.createClass({
  propTypes: {
    placeholderName:        PropTypes.string.isRequired,      // Note that a default is provided below 
    handleCreateAssetClick: PropTypes.func.isRequired,        // Callback function to create the asset, and is expected to navigate to the new page. Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    currUser:               PropTypes.object,                 // currently logged in user (if any)
    currUserProjects:       PropTypes.array
  },

  getDefaultProps: function () {
    return { placeholderName: 'name for new asset..' }
  },

  getInitialState: function () {
    return {
      projectCompoundName: "",
      selectedProject: null,          // 
      buttonActionPending: false,     // True after the button has been pushed. so it doesn't get pushed twice
      selectedKind: "",               // "" or one of AssetKindKeys[]
      newAssetName: ""                // "" or a valid assetName string
    }
  },

  handleChangeSelectedProjectName: function (selectedProjName, selectedProj, selectedCompoundName) {
    this.setState( { projectCompoundName: selectedCompoundName, selectedProject: selectedProj } )
  },

  render: function() {
    const { currUser, currUserProjects } = this.props
    const isAssetNameValid = validate.assetName(this.state.newAssetName)   // TODO - some checks for crazy characters
    const isKindChosen = (this.state.selectedKind !== "")
    const isAssetReadyToCreate = isKindChosen && isAssetNameValid
    const chosenKindStr = isKindChosen ? AssetKinds[this.state.selectedKind].name : "Asset"
    const chosenNameStr = isAssetNameValid ? `"${this.state.newAssetName}"` : ""
    const isButtonDisabled = this.state.buttonActionPending || !isAssetReadyToCreate
    const createButtonClassName = "ui primary " + (isButtonDisabled ? " disabled " : " ") + "button"
    const createButtonTooltip = isAssetReadyToCreate ? "Click here to create your new Asset" : "You must choose a valid name and 'kind' for your new asset. You can rename it later if you wish, but you cannot change it's 'kind' later"
    
    return (
      <div>
        <div className="ui fluid small ordered evenly divided steps">
          <div className={(isAssetNameValid ? "completed " : "active ") + "step"}>
            <div className="content">
              <div className="title">Name</div>
              <div className="description">Name your<br />new asset</div>
            </div>
          </div>
          <div className={(isKindChosen ? "completed " : "active ") + "step"}>
            <div className="content">
              <div className="title">Kind</div>
              <div className="description">Choose which<br />kind to create</div>
            </div>
          </div>
          <div className={ (this.state.buttonActionPending ? "completed ": (isAssetReadyToCreate ? "active " : "")) + "step" }>
            <div className="content">
              <div className="title">Choose Project</div>
              <div className="description">Optionally place<br />Asset in a Project</div>
            </div>
          </div>
          <div className={ (this.state.buttonActionPending ? "completed ": (isAssetReadyToCreate ? "active " : "")) + "step" }>
            <div className="content">
              <div className="title">Confirm Create</div>
              <div className="description">Create it!<br />&nbsp;</div>
            </div>
          </div>
        </div>
        
        <div className="ui padded segment">
          <h4 className="ui header">1. Enter Asset Name</h4>
          <div className="ui items">
            <div className={"ui fluid input" + (isAssetNameValid ? "" : " error")}>
              <input className="fluid" type="text" value={this.state.newAssetName} onChange={(e) => this.setState({ newAssetName: e.target.value})} placeholder={this.props.placeholderName} ref={inp => (inp && inp.focus())}></input>
            </div>
          </div>
        </div>

        <div className="ui padded segment">
          <h4 className="ui header">2. Choose an Asset Kind</h4>        
          <AssetCreateSelectKind 
            currUser={currUser} 
            selectedKind={this.state.selectedKind} 
            handleSelectAsset={this.handleSelectAssetKindClick} />
        </div>

        <div className="ui padded segment">
          <h4 className="ui header">3. Optionally - place the new asset within a project</h4>        
          <ProjectSelector
              canEdit={false}
              user={currUser}
              handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
              availableProjects={currUserProjects}
              ProjectListLinkUrl={currUser && "/u/" + currUser.profile.name + "/projects"}
              showProjectsUserIsMemberOf={true}
              chosenProjectName={this.state.projectCompoundName} />
        </div>

        <div title={createButtonTooltip}>
          <div className={createButtonClassName} onClick={this.handleCreateAssetClick} >
            4. Create {chosenKindStr} {chosenNameStr}
            <i className="right chevron icon"></i>
          </div>
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
    const { selectedKind, newAssetName, selectedProject } = this.state
    this.setState( { buttonActionPending: true } )
    this.props.handleCreateAssetClick(
      selectedKind, 
      newAssetName, 
      selectedProject ? selectedProject.name : null,
      selectedProject ? selectedProject.ownerId : null,
      selectedProject ? selectedProject.ownerName : null)
  }
})