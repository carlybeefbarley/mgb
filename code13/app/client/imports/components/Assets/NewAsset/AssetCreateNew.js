import React, { PropTypes } from 'react'
import { Segment, Header, Button } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import { AssetKinds } from '/imports/schemas/assets'
import AssetCreateSelectKind from './AssetCreateSelectKind'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import validate from '/imports/schemas/validate'

export default AssetCreateNew = React.createClass({
  propTypes: {
    placeholderName:        PropTypes.string.isRequired,      // Note that a default is provided below 
    handleCreateAssetClick: PropTypes.func.isRequired,        // Callback function to create the asset, and is expected to navigate to the new page. Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    currUser:               PropTypes.object,                 // currently logged in user (if any)
    currUserProjects:       PropTypes.array                   // Projects list for currently logged in user
  },

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.inputAssetName).focus()
  },

  getDefaultProps: function () {
    return { placeholderName: 'name for new asset..' }
  },

  getInitialState: function () {
    return {
      selectedProject: null,          // Project Object or Null
      buttonActionPending: false,     // True after the button has been pushed. so it doesn't get pushed twice
      selectedKind: "",               // "" or one of AssetKindKeys[]
      newAssetName: ""                // "" or a valid assetName string
    }
  },

  handleChangeSelectedProjectName: function (selectedProjName, selectedProj) {
    this.setState( { selectedProject: selectedProj } )
  },

  render: function() {
    const { newAssetName, selectedKind } = this.state
    const { currUser, currUserProjects, placeholderName } = this.props
    const isAssetNameValid = validate.assetName(newAssetName) && newAssetName && newAssetName !== ''
    const isKindChosen = selectedKind !== ''
    const isAssetReadyToCreate = isKindChosen && isAssetNameValid
    const chosenKindStr = isKindChosen ? AssetKinds[selectedKind].name : "Asset"
    const chosenNameStr = isAssetNameValid ? `"${newAssetName}"` : ""
    const isButtonDisabled = this.state.buttonActionPending || !isAssetReadyToCreate
    const createButtonTooltip = isAssetReadyToCreate ? "Click here to create your new Asset" : "You must choose a valid name and 'kind' for your new asset. You can rename it later if you wish, but you cannot change it's 'kind' later"
    
    return (
      <div>
        <Segment basic>
          <Header as='h4' content='1. Enter Asset Name' />
          <div className="ui items">
            <div className={"ui fluid input" + (isAssetNameValid ? "" : " error")}>
              <input className="fluid" type="text" value={newAssetName} onChange={(e) => this.setState({ newAssetName: e.target.value})} placeholder={placeholderName} 
                ref="inputAssetName"
              ></input>
            </div>
          </div>
        </Segment>

        <Segment basic>
          <Header as='h4' content='2. Choose an Asset Kind'/>        
          <AssetCreateSelectKind 
            currUser={currUser} 
            selectedKind={selectedKind} 
            handleSelectAsset={this.handleSelectAssetKindClick} />
        </Segment>

        <Segment basic>
          <Header as='h4' content='3. (Optional) place the new Asset into a Project' />
          <ProjectSelector
              canEdit={false}
              isUseCaseCreate={true}
              user={currUser}
              handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
              availableProjects={currUserProjects}
              ProjectListLinkUrl={currUser && `/u/${currUser.profile.name}/projects`}
              showProjectsUserIsMemberOf={true}
              chosenProjectObj={this.state.selectedProject} />
        </Segment>

        <Button 
            title={createButtonTooltip}
            primary
            disabled={isButtonDisabled}
            id="mgbjr-create-asset-button" 
            onClick={this.handleCreateAssetClick}
            content={`4. Create ${chosenKindStr} ${chosenNameStr}`} />
      </div>
    )
  },

  handleSelectAssetKindClick: function(assetKindKey)
  {
    this.setState( { selectedKind: assetKindKey} )
    // this.blurInput()
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
    // this.blurInput()
  },

  blurInput: function(){
    // for ipad hide keyboard
    document.activeElement.blur()
    $('input').blur()
    ReactDOM.findDOMNode(this.refs.inputAssetName).blur()

    //  ref={inp => (inp && inp.focus())}   // previous input ref
  },

})