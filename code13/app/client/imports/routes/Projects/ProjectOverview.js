import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import QLink from '../QLink';
import {Projects} from '/imports/schemas';
import ProjectCard from '/client/imports/components/Projects/ProjectCard';
import ProjectMembersGET from '/client/imports/components/Projects/ProjectMembersGET';
import Spinner from '/client/imports/components/Nav/Spinner';
import Helmet from 'react-helmet';
import UserListRoute from '../Users/List'

import {logActivity} from '/imports/schemas/activity';
import {snapshotActivity} from '/imports/schemas/activitySnapshots.js';

// NOTE: UI mockups for this page are at https://v2.mygamebuilder.com/assetEdit/HGhkyyHtrwPxLTyfZ 


export default ProjectOverview = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // Contains params.projectId
    user:   PropTypes.object,       // App.js gave us this from params.id OR params.username
    currUser: PropTypes.object
  },
  
  getInitialState: function() {
    return {
      showAddUserSearch: false      // True if user search box is to be shown
    }
  },
  
  getMeteorData: function() {
    let projectId = this.props.params.projectId
    let handleForProject = Meteor.subscribe("projects.forProjectId", projectId);

    return {
      project: Projects.findOne(projectId),
      loading: !handleForProject.ready()
    };
  },


  canEdit: function() {
    return !this.data.loading &&
           this.data.project &&
           this.props.currUser && 
           this.data.project.ownerId === this.props.currUser._id
  },
  

  render: function() {
    if (this.data.loading)
      return <Spinner />
          
    const project = this.data.project     // One Project provided via getMeteorData()
    const canEdit = this.canEdit()

    if (!project)
      return  <div className="ui container">
                <br></br>
                <div className="ui negative message">
                  <div clasNames="header">
                    No such project
                  </div>
                  <p>There is no project with this Id ({this.props.params.projectId})
                  </p>
                </div>
              </div>

    const canEd = this.canEdit();
    
    return (
      <div className="ui padded grid">
        <Helmet
          title="Project Overview"
          meta={[
              {"name": "description", "content": "Projects"}
          ]}
        />        

        <div className="six wide column" style={{minWidth: "250px"}}>
          <ProjectCard 
            project={project} 
            owner={this.props.user}
            canEdit={canEd}
            handleFieldChanged={this.handleFieldChanged}
            />
            <QLink to={"/u/" + project.ownerName + "/assets"} query={{project:project.name}} className="ui button" >
              Project Assets
            </QLink>
            { this.renderRenameDeleteProject() } 
        </div>
        
        <div className="eight wide column">
          <h3 className="ui header">Project Members</h3>
          <div className="ui basic segment">
            Project Members may create, edit or delete assets in this project &nbsp;        
            <p className="ui tiny orange label">&nbsp; ! Access Control Not Yet Implemented !</p>  
            <ProjectMembersGET 
                project={this.data.project} 
                enableRemoveButton={canEdit} 
                handleRemove={this.handleRemoveMemberFromProject}
            />
          </div>
          { this.renderAddPeople() } 
        </div>
                
      </div>
    );
  },  
  
  
  // TODO - override 'Search Users" header level in UserListRoute
  // TODO - some better UI for Add People.
  handleClickUser: function(userId, userName)
  {
    var project = this.data.project
    var newData = { memberIds: _.union(project.memberIds, [userId])}   
    Meteor.call('Projects.update', project._id, this.canEdit(), newData, (error, result) => {
      if (error) {
         console.log(`Could not add member ${userName} to project ${project.name}`)
      } else {
        logActivity("project.addMember",  `Add Member ${userName} to project ${project.name}`);
      }
    })
  },
  
  handleRemoveMemberFromProject: function (userId, userName) {
    var project = this.data.project
    var newData = { memberIds: _.without(project.memberIds, userId)}   

    Meteor.call('Projects.update', project._id, this.canEdit(), newData, (error, result) => {
      if (error) {
         console.log(`Could not remove member ${userName} from project ${project.name}`)
      } else {
        logActivity("project.removeMember",  `Removed Member ${userName} from project ${project.name}`);
      }
    })
  },
    
  /**
   *   @param changeObj contains { field: value } settings.. e.g "profile.title": "New Title"
   */
  handleFieldChanged: function(changeObj)
  {
    var project = this.data.project

    Meteor.call('Projects.update', project._id, this.canEdit(), changeObj, (error) => {
      if (error) 
        console.log("Could not update project: ", error.reason)      
    });
  },
  
  
  // TODO - Activity - filter for project / user.  Maybe have a Project-related Activity Page
  
  renderRenameDeleteProject: function()
  {
    const canEdit = this.canEdit()
    if (!canEdit)
      return null
    
    return  <div className="ui secondary compact segment">
              <div className="ui header">Manage Project</div>
                <div  className="ui labeled icon button"
                      onClick={ () => { alert("Not Yet Implemented")}} >
                  <i className="edit icon"></i>
                  <span className="text">Rename</span>        
                </div>
                <div  className="ui red labeled icon button"
                      onClick={ () => { alert("Not Yet Implemented")}} >
                  <i className="trash icon"></i>
                  <span className="text">Destroy</span>        
                </div>
            </div>
  },
    
  renderAddPeople: function()
  {
    const canEdit = this.canEdit()
    if (!canEdit)
      return null
      
    const project = this.data.project;
    const relevantUserIds = [ project.ownerId, ...project.memberIds]   
    const active = this.state.showAddUserSearch 
    const showSearch = !active ? null : 
      <UserListRoute  
                  handleClickUser={this.handleClickUser}
                  initialLimit={20}
                  excludeUserIdsArray={relevantUserIds}
                  renderVertical={true} 
                  hideTitle={true}/>
    
    return  <div className={`ui secondary ${active ? "" : "compact"} segment`}>
              <div  className={"ui green labeled icon button" + (active ? " active" : "")}
                    onClick={ () => { this.setState({showAddUserSearch: !active})}} >
                <i className="add user icon"></i>
                <span className="text">Add Members</span>        
              </div>
              { showSearch }              
            </div>
  },  
  
  
  // TODO: Use this!
  DORMANT__handleProjectNameChangeInteractive: function() {
    let newName = this.refs.projectNameInput.value;

    if (newName !== this.data.project.name) {
      Meteor.call('Azzets.update', this.data.project._id, this.canEdit(), {name: newName}, (err, res) => {
        if (err) {
          this.props.showToast(err.reason, 'error')
        }
      });
      
      logActivity("project.rename",  `Rename to "${newName}" from `, null, this.data.project); 
    }
  }
})
