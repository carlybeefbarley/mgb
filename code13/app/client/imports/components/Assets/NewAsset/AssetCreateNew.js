import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Form, Header, Input, Button, Label } from 'semantic-ui-react'
import ReactDOM from 'react-dom'

import { AssetKinds } from '/imports/schemas/assets'
import AssetCreateSelectKind from './AssetCreateSelectKind'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import validate from '/imports/schemas/validate'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'

const formStyle = {
  maxWidth: '40em',
  margin: 'auto',
}

const AssetCreateNew = React.createClass({
  propTypes: {
    suggestedParams: PropTypes.object, // projectName,assetName,assetKind
    currUser: PropTypes.object, // currently logged in user (if any)
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
  },

  getInitialState() {
    const { currUserProjects, suggestedParams } = this.props
    const { projectName, assetName, assetKind } = suggestedParams
    return {
      isNamePristine: true, // whether or not the form has had changes made
      selectedProject: _.find(currUserProjects, { name: projectName }) || null, // Project Object or Null
      buttonActionPending: false, // True after the button has been pushed. so it doesn't get pushed twice
      selectedKind: AssetKinds.isValidKey(assetKind) ? assetKind : '',
      newAssetName: assetName || '', // "" or a valid assetName string
    }
  },

  contextTypes: {
    urlLocation: PropTypes.object,
  },

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.inputAssetName).focus()
  },

  /**
   *
   *
   * @param {string} assetKindKey - must be one of assetKindKey
   * @param {string} assetName - string. Can be "" but that is discouraged
   * @param {string} projectName - can be "" or null/undefined; those values indicate No Project
   * @param {string} projectOwnerId - if projectName is a nonEmpty string, should be a valid projectOwnerId
   * @param {string} projectOwnerName - if projectName is a nonEmpty string, should be a valid projectOwnerName
   */
  handleCreateAssetClickFromComponent(
    assetKindKey,
    assetName,
    projectName,
    projectOwnerId,
    projectOwnerName,
  ) {
    const { currUser } = this.props
    if (!currUser) {
      showToast.error('You must be logged-in to create a new Asset')
      return
    }

    let newAsset = {
      name: assetName,
      kind: assetKindKey,
      text: '',
      thumbnail: '',
      content2: {},
      dn_ownerName: currUser.username, // Will be replaced below if in another project
      ownerId: currUser._id,
      isCompleted: false,
      isDeleted: false,
      isPrivate: false,
    }
    if (projectName && projectName !== '') {
      newAsset.projectNames = [projectName]
      newAsset.dn_ownerName = projectOwnerName
      newAsset.ownerId = projectOwnerId
    }

    Meteor.call('Azzets.create', newAsset, (error, result) => {
      if (error) {
        showToast.error('Failed to create new Asset because: ' + error.reason)
        this.setState({ buttonActionPending: false })
      } else {
        newAsset._id = result // So activity log will work
        logActivity('asset.create', `Create ${assetKindKey}`, null, newAsset)
        // Now go to the new Asset
        utilPushTo(this.context.urlLocation.query, `/u/${newAsset.dn_ownerName}/asset/${result}`)
      }
    })
  },

  handleChangeAssetKind(assetKindKey) {
    this.setState(
      {
        selectedKind: assetKindKey,
      },
      () => {
        joyrideCompleteTag(`mgbjr-CT-create-asset-select-kind-${assetKindKey}`)
        if (this.refs.inputAssetName) this.refs.inputAssetName.focus()
      },
    )
  },

  handleChangeName(e) {
    this.setState(
      {
        isNamePristine: false,
        newAssetName: e.target.value,
      },
      () => {
        joyrideCompleteTag(`mgbjr-CT-create-asset-name`)
      },
    )
  },

  handleChangeSelectedProjectName(selectedProjName, selectedProject) {
    this.setState({ selectedProject }, () => {
      joyrideCompleteTag(`mgbjr-CT-create-asset-project`)
    })
  },

  handleCreateAssetClick() {
    const { selectedKind, newAssetName, selectedProject } = this.state
    this.setState(
      {
        buttonActionPending: true,
      },
      () => {
        joyrideCompleteTag(`mgbjr-CT-create-asset-${selectedKind}-do-create`)
      },
    )
    this.handleCreateAssetClickFromComponent(
      selectedKind,
      newAssetName,
      selectedProject ? selectedProject.name : null,
      selectedProject ? selectedProject.ownerId : null,
      selectedProject ? selectedProject.ownerName : null,
    )
  },

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
            ref="inputAssetName"
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
  },
})

export default AssetCreateNew
