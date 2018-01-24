import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Form, Header, Input, Button, Label } from 'semantic-ui-react'

import { AssetKinds } from '/imports/schemas/assets'
import AssetCreateSelectKind from './AssetCreateSelectKind'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import validate from '/imports/schemas/validate'
import { assetStore, joyrideStore } from '/client/imports/stores'
import { withStores } from '/client/imports/hocs'
import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'

const formStyle = {
  maxWidth: '40em',
  margin: 'auto',
}

class AssetCreateNew extends Component {
  static propTypes = {
    suggestedParams: PropTypes.object, // projectName,assetName,assetKind
    currUser: PropTypes.object, // currently logged in user (if any)
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
  }

  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  state = {}

  constructor(props) {
    super(props)
    const { currUserProjects, suggestedParams } = this.props
    const { projectName, assetName, assetKind } = suggestedParams

    this.state.isNamePristine = true // whether or not the form has had changes made
    this.state.selectedProject = _.find(currUserProjects, { name: projectName }) || null // Project Object or Null
    this.state.buttonActionPending = false // True after the button has been pushed. so it doesn't get pushed twice
    this.state.selectedKind = AssetKinds.isValidKey(assetKind) ? assetKind : ''
    this.state.newAssetName = assetName || '' // "" or a valid assetName string
  }

  componentDidMount() {
    this.focusNameInput()
  }

  handleInputRef = c => (this.inputRef = c)

  focusNameInput = () => _.invoke(this.inputRef, 'focus')

  handleChangeAssetKind = assetKindKey => {
    this.setState(
      {
        selectedKind: assetKindKey,
      },
      () => {
        joyrideStore.completeTag(`mgbjr-CT-create-asset-select-kind-${assetKindKey}`)
        this.focusNameInput()
      },
    )
  }

  handleChangeName = e => {
    this.setState(
      {
        isNamePristine: false,
        newAssetName: e.target.value,
      },
      () => {
        joyrideStore.completeTag(`mgbjr-CT-create-asset-name`)
      },
    )
  }

  handleChangeSelectedProjectName = (selectedProjName, selectedProject) => {
    this.setState({ selectedProject }, () => {
      joyrideStore.completeTag(`mgbjr-CT-create-asset-project`)
    })
  }

  handleCreateAssetClick = () => {
    const { currUser, assetStore } = this.props
    const { selectedKind, newAssetName, selectedProject } = this.state

    this.setState(
      {
        buttonActionPending: true,
      },
      () => {
        joyrideStore.completeTag(`mgbjr-CT-create-asset-${selectedKind}-do-create`)
      },
    )

    assetStore
      .createAsset(
        currUser,
        // assetKindKey - must be one of assetKindKey
        selectedKind,
        // assetName - string. Can be "" but that is discouraged
        newAssetName,
        // projectName - can be "" or null/undefined; those values indicate No Project
        selectedProject ? selectedProject.name : null,
        // projectOwnerId - if projectName is a nonEmpty string, should be a valid projectOwnerId
        selectedProject ? selectedProject.ownerId : null,
        // projectOwnerName - if projectName is a nonEmpty string, should be a valid projectOwnerName
        selectedProject ? selectedProject.ownerName : null,
      )
      .then(newAssetUrl => {
        this.setState({ buttonActionPending: false })

        utilPushTo(this.context.urlLocation.query, newAssetUrl)
      })
      .catch(error => {
        this.setState({ buttonActionPending: false })
      })
  }

  render() {
    const { isNamePristine, newAssetName, selectedKind } = this.state
    const { currUser, currUserProjects } = this.props
    const isAssetNameValid = validate.assetName(newAssetName)
    const assetNameErrText = validate.assetNameWithReason(newAssetName)
    const isKindValid = !!selectedKind
    const isFormValid = isKindValid && isAssetNameValid
    const chosenKindStr = isKindValid ? AssetKinds[selectedKind].name : 'Asset'
    const chosenNameStr = isAssetNameValid ? `"${newAssetName}"` : ''
    const isButtonDisabled = this.state.buttonActionPending || !isFormValid

    return (
      <Form style={formStyle}>
        <Header as="h2" content="Create New Asset" />
        <Form.Field required>
          <label>Kind</label>
          <AssetCreateSelectKind
            currUser={currUser}
            selectedKind={selectedKind}
            onChangeAsset={this.handleChangeAssetKind}
          />
        </Form.Field>

        <Form.Field required error={!isNamePristine && !!assetNameErrText}>
          <label>Name</label>
          <Input
            id="mgbjr-create-asset-name"
            ref={this.handleInputRef}
            placeholder="Asset name"
            value={newAssetName}
            onChange={this.handleChangeName}
            fluid
          />
          {!isNamePristine &&
          !!assetNameErrText && <Label basic pointing color="red" content={assetNameErrText} />}
        </Form.Field>

        <Form.Field>
          <label>Project (optional)</label>
          <ProjectSelector
            id="mgbjr-create-asset-project"
            canEdit={false}
            isUseCaseCreate
            showProjectsUserIsMemberOf
            user={currUser}
            handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
            availableProjects={currUserProjects}
            ProjectListLinkUrl={currUser && `/u/${currUser.profile.name}/projects`}
            chosenProjectObj={this.state.selectedProject}
          />
        </Form.Field>

        <Form.Field>
          <Button
            id="mgbjr-create-asset-button"
            content={`Create ${chosenKindStr} ${chosenNameStr}`}
            disabled={isButtonDisabled}
            onClick={this.handleCreateAssetClick}
            primary
            fluid
          />
        </Form.Field>
      </Form>
    )
  }
}

export default withStores({
  assetStore,
})(AssetCreateNew)
