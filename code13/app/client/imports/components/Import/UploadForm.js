import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Select } from 'semantic-ui-react'

import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import AssetLicense from '/client/imports/components/Controls/AssetLicense'
import { defaultAssetLicense } from '/imports/Enums/assetLicenses'
import WorkState from '/client/imports/components/Controls/WorkState'
import { defaultWorkStateName } from '/imports/Enums/workStates'
import StableState from '/client/imports/components/Controls/StableState'

// import { Segment, Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'

// import sty from  './import.css'

export default class UploadForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedProject: null,
      assetLicense: defaultAssetLicense,
      workState: defaultWorkStateName,
      prefix: '',
      isCompleted: false,
      assetType: 'graphic',
    }
  }

  onDragOver = e => {
    this.props.onDragOver(e)
  }
  onDragLeave = e => {
    this.props.onDragLeave(e)
  }
  onDrop = e => {
    this.props.onDrop(
      e,
      this.state.assetType,
      this.state.prefix,
      this.state.selectedProject,
      this.state.assetLicense,
      this.state.workState,
      this.state.isCompleted,
    )
  }

  handleChangeSelectedProjectName = (selectedProjName, selectedProj) => {
    this.setState({ selectedProject: selectedProj })
  }

  handleLicenseChange = newLicense => {
    if (newLicense != this.state.assetLicense) this.setState({ assetLicense: newLicense })
  }

  handleWorkStateChange = newWorkState => {
    if (newWorkState != this.state.workState) this.setState({ workState: newWorkState })
  }

  handlePrefixChange = e => {
    if (e.target.value != this.state.prefix) {
      this.setState({ prefix: e.target.value })
    }
  }

  handleStableStateChange = e => {
    this.setState({ isCompleted: !this.state.isCompleted })
  }

  handleAssetTypeChange = (e, param) => {
    this.setState({ assetType: param.value })
  }

  render() {
    const isWebkit = 'WebkitAppearance' in document.documentElement.style

    return (
      <div className={this.props.isHidden ? 'mgb-hidden' : ''}>
        <div className={'ui big negative message ' + (isWebkit ? 'hidden' : '')}>
          <i className="close icon" />
          <div className="header">Your browser doesn't support bulk import!</div>
          <p>Please use webkit browsers like Chrome, Safari or Opera</p>
        </div>

        <div className={isWebkit ? '' : 'mgb-hidden'}>
          <div className="row" style={{ padding: '10px 30px' }}>
            <Select
              onChange={this.handleAssetTypeChange.bind(this)}
              defaultValue={this.state.assetType}
              options={[
                { key: 'graphic', value: 'graphic', text: 'graphic' },
                { key: 'code', value: 'code', text: 'code' },
              ]}
            />
            <div className="ui input mini focus">
              Prefix &nbsp;
              <input
                style={{ padding: '2px 5px' }}
                type="text"
                value={this.state.prefix}
                onChange={this.handlePrefixChange.bind(this)}
              />
            </div>
            &nbsp;&nbsp;
            <ProjectSelector
              canEdit={false}
              user={this.props.currUser}
              isUseCaseCreate
              handleChangeSelectedProjectName={this.handleChangeSelectedProjectName.bind(this)}
              availableProjects={this.props.currUserProjects}
              ProjectListLinkUrl={this.props.currUser && `/u/${this.props.currUser.profile.name}/projects`}
              showProjectsUserIsMemberOf
              chosenProjectObj={this.state.selectedProject}
            />
            &nbsp;&nbsp;
            <StableState
              isStable={this.state.isCompleted}
              showMicro
              canEdit
              handleChange={this.handleStableStateChange.bind(this)}
            />
            &nbsp;&nbsp;
            <AssetLicense
              license={this.state.assetLicense}
              canEdit
              handleChange={this.handleLicenseChange.bind(this)}
            />
            &nbsp;&nbsp;
            <WorkState
              workState={this.state.workState}
              popupPosition="bottom center"
              canEdit
              handleChange={this.handleWorkStateChange.bind(this)}
            />
          </div>

          {/* TODO inputs: projects, prefix, license, status */}
          <div
            className={'importUploadForm ' + (this.props.isDragOver ? 'draggedOver' : '')}
            onDragOver={this.onDragOver.bind(this)}
            onDragLeave={this.onDragLeave.bind(this)}
            onDrop={this.onDrop.bind(this)}
          >
            <br />
            <br />
            <br />
            <br />
            <br />
            <h2>Drop folder here!</h2>
            <p>You can drop folder with graphic assets like .jpg, .png</p>
            <br />
            <br />
            <br />
            <br />
            <br />
          </div>
        </div>
      </div>
    )
  }
}
