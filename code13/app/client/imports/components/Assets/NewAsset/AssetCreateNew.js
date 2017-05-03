import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Segment, Header, Button, Container, Message } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import { AssetKinds } from '/imports/schemas/assets'
import AssetCreateSelectKind from './AssetCreateSelectKind'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import validate from '/imports/schemas/validate'

export default AssetCreateNew = React.createClass({
  propTypes: {
    suggestedParams:        PropTypes.object,                 // projectName,assetName,assetKind
    placeholderName:        PropTypes.string.isRequired,      // Note that a default is provided below
    handleCreateAssetClick: PropTypes.func.isRequired,        // Callback function to create the asset, and is expected to navigate to the new page. Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    currUser:               PropTypes.object,                 // currently logged in user (if any)
    currUserProjects:       PropTypes.array                   // Projects list for currently logged in user
  },

  componentDidMount() {
    this.validateNewName = _.throttle(
      (newAssetName, newAssetKind) => this.validateNewNameQuick(newAssetName, newAssetKind),
      300, // 1000 seems a little bit too much
      {
        // leading
        // trailing
      })
    ReactDOM.findDOMNode(this.refs.inputAssetName).focus()
  },

  getDefaultProps: function () {
    return { placeholderName: 'name for new asset..' }
  },

  getInitialState: function () {
    const { currUserProjects, suggestedParams } = this.props
    const { projectName, assetName, assetKind } = suggestedParams
    const retval = {
      selectedProject: _.find(currUserProjects, { name: projectName }) || null,          // Project Object or Null
      buttonActionPending: false,     // True after the button has been pushed. so it doesn't get pushed twice
      selectedKind: AssetKinds.isValidKey(assetKind) ? assetKind : '',               // "" or one of AssetKindKeys[]
      newAssetName: assetName || '',                // "" or a valid assetName string
      validatingInProgress: false // sets to true if we are requesting server to validate assetName
    }
    return retval
  },

  handleChangeSelectedProjectName: function (selectedProjName, selectedProj) {
    this.setState( { selectedProject: selectedProj } )
  },

  handleAssetNameChange(e){
    const newAssetName = e.target.value
    if(this.state.newAssetName === newAssetName)
      return
    
    this.setState({newAssetName})
    this.validateNewName(newAssetName)
  },

  validateNewNameQuick(newAssetName = this.state.newAssetName, newAssetKind = this.state.selectedKind){
    const isAssetNameValid = newAssetName && validate.assetName(newAssetName) && newAssetName !== ''
    const assetNameErrText = (_.isString(newAssetName) && newAssetName.length > 1) ? validate.assetNameWithReason(newAssetName) : null

    this.setState({isAssetNameValid, assetNameErrText, validatingInProgress: true})

    if(isAssetNameValid && newAssetKind) {
      validate.isAssetNameUnique(newAssetName, newAssetKind, this.props.currUser.username)
        .then((isUnique) => {
          // console.log("Is asset name unique? ", isUnique)
          this.setState({
            isAssetNameValid: isUnique,
            // TODO: use instead more explaining form e.g.: You already have {kind} called {name}???
            assetNameErrText: isUnique ? null: 'Asset name is not unique',
            validatingInProgress: false
          })
        })
    }
  },

  render: function() {
    const { newAssetName, selectedKind, isAssetNameValid, assetNameErrText } = this.state
    const { currUser, currUserProjects, placeholderName } = this.props

    const isKindChosen = selectedKind !== ''
    const isAssetReadyToCreate = isKindChosen && isAssetNameValid
    const chosenKindStr = isKindChosen ? AssetKinds[selectedKind].name : "Asset"
    const chosenNameStr = isAssetNameValid ? `"${newAssetName}"` : ""
    const isButtonDisabled = this.state.buttonActionPending || !isAssetReadyToCreate || this.state.validatingInProgress
    const createButtonTooltip = isAssetReadyToCreate ? "Click here to create your new Asset" : "You must choose a valid name and 'kind' for your new asset. You can rename it later if you wish, but you cannot change it's 'kind' later"

    return (
      <Container text>
        <Segment basic>
          <Header as='h4' content='1. Name your Asset' />
          <div className="ui items">
            <div className={"ui fluid input" + (isAssetNameValid ? "" : " error")}>
              <input className="fluid" type="text" value={newAssetName}

                     onChange={(e) => this.handleAssetNameChange(e)}
                     onBlur={(e) => this.handleAssetNameChange(e)}
                     placeholder={placeholderName}
                     ref="inputAssetName"
              />
            </div>
            { assetNameErrText && <Message error content={assetNameErrText} /> }
          </div>
        </Segment>

        <Segment basic>
          <Header as='h4' content='2. Choose which Kind of Asset to create'/>
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
      </Container>
    )
  },

  handleSelectAssetKindClick: function(selectedKind)
  {
    this.setState( { selectedKind } )
    this.validateNewName(this.state.newAssetName, selectedKind)
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
