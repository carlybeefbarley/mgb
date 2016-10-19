import _ from 'lodash'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'

import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'

// import { Segment, Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'

// import sty from  './import.css'

export default class UploadForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      projectCompoundName: null,
      selectedProject: null,
    }

  } 

  onDragOver(e){ this.props.onDragOver(e) }
  onDragLeave(e){ this.props.onDragLeave(e) }
  onDrop(e){ this.props.onDrop(e, this.state.selectedProject) }

  handleChangeSelectedProjectName (selectedProjName, selectedProj, selectedCompoundName) {
    this.setState( { projectCompoundName: selectedCompoundName, selectedProject: selectedProj } )
    // console.log(selectedProjName, selectedProj, selectedCompoundName)
  }

  render (){
    return (
      <div className={this.props.isHidden ? "hidden" : ""}>
        Prefix <input type="text" />
        
        <ProjectSelector
          canEdit={false}
          user={this.props.currUser}
          handleChangeSelectedProjectName={this.handleChangeSelectedProjectName.bind(this)}
          availableProjects={this.props.currUserProjects}
          ProjectListLinkUrl={this.props.currUser && `/u/${this.props.currUser.profile.name}/projects`}
          showProjectsUserIsMemberOf={true}
          chosenProjectName={this.state.projectCompoundName} 
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