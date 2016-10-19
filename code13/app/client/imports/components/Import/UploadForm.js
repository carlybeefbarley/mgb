import _ from 'lodash'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'

import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import AssetLicense from '/client/imports/components/Controls/AssetLicense'
import { defaultAssetLicense } from '/imports/Enums/assetLicenses'
import WorkState from '/client/imports/components/Controls/WorkState'
import { defaultWorkStateName } from '/imports/Enums/workStates'


// import { Segment, Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'

// import sty from  './import.css'

export default class UploadForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      projectCompoundName: null,
      selectedProject: null,
      assetLicense: defaultAssetLicense,
      workState: defaultWorkStateName,
      prefix: "",
    }
  } 

  onDragOver(e){ this.props.onDragOver(e) }
  onDragLeave(e){ this.props.onDragLeave(e) }
  onDrop(e){ 
    this.props.onDrop(e, this.state.prefix, this.state.selectedProject, this.state.assetLicense, this.state.workState) 
  }

  handleChangeSelectedProjectName (selectedProjName, selectedProj, selectedCompoundName) {
    this.setState( { projectCompoundName: selectedCompoundName, selectedProject: selectedProj } )
    // console.log(selectedProjName, selectedProj, selectedCompoundName)
  }

  handleLicenseChange(newLicense) {
    if(newLicense != this.state.assetLicense){
      this.setState({ assetLicense: newLicense})
    }
  }

  handleWorkStateChange(newWorkState){
    if(newWorkState != this.state.workState){
      this.setState({ workState: newWorkState })
    }
  }

  handlePrefixChange(e){
    if(e.target.value != this.state.prefix){
      this.setState({ prefix: e.target.value })
    }
  }

  render (){
    return (
      <div className={this.props.isHidden ? "hidden" : ""}> 
        
      
        <div className="ui form">
          <div className="field">
            <label>Prefix</label>
            <input 
              type="text"
              value={this.state.prefix} 
              onChange={this.handlePrefixChange.bind(this)} 
            />
          </div>
        </div>
      
        
        <ProjectSelector
          canEdit={false}
          user={this.props.currUser}
          handleChangeSelectedProjectName={this.handleChangeSelectedProjectName.bind(this)}
          availableProjects={this.props.currUserProjects}
          ProjectListLinkUrl={this.props.currUser && `/u/${this.props.currUser.profile.name}/projects`}
          showProjectsUserIsMemberOf={true}
          chosenProjectName={this.state.projectCompoundName} 
        />

        <AssetLicense 
          license={this.state.assetLicense} 
          showMicro={true}
          canEdit={true}
          handleChange={this.handleLicenseChange.bind(this)}
        />

        <WorkState 
          workState={this.state.workState} 
          popupPosition="bottom center"
          showMicro={true}
          canEdit={true}
          handleChange={this.handleWorkStateChange.bind(this)}
        />

        {/* TODO inputs: projects, prefix, license, status */}
        <div className={"importUploadForm " + (this.props.isDragOver ? "draggedOver" : "")}
          onDragOver={this.onDragOver.bind(this)}
          onDragLeave={this.onDragLeave.bind(this)}
          onDrop={this.onDrop.bind(this)}>
            <br/><br/><br/><br/><br/>
            <h2>Drop folder here!</h2>
            <p>You can drop folder with graphic assets like .jpg, .png</p>
            <br/><br/><br/><br/><br/>
        </div>
      </div>
    )
  }
}