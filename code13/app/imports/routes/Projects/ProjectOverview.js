import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Link, browserHistory} from 'react-router';
import {Projects} from '../../schemas';
import ProjectCard from '../../components/Projects/ProjectCard';
import ProjectMembersGET from '../../components/Projects/ProjectMembersGET';
import Spinner from '../../components/Nav/Spinner';
import Helmet from 'react-helmet';
import UserListRoute from '../Users/List'

import {logActivity} from '../../schemas/activity';
import {snapshotActivity} from '../../schemas/activitySnapshots.js';

// NOTE: UI mockups for this page are at https://v2.mygamebuilder.com/assetEdit/HGhkyyHtrwPxLTyfZ 


export default ProjectOverview = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // Contains params.projectId and params.id
    user:   PropTypes.object,       // App.js gave us this from params.id
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
        
        <div className="one wide column"></div>

        <div className="six wide column" style={{minWidth: "250px"}}>
          <ProjectCard project={project} owner={this.props.user}/>
            <Link to={"/user/" + project.ownerId + "/assets?project="+project.name} className="ui fluid button" >
              View Project Assets
            </Link>
            <br></br>
            <Link to={"/user/" + project.ownerId} className="ui fluid button" >
              View Project Owner
            </Link>
            { this.renderRenameDeleteProject() } 
        </div>
        
        <div className="eight wide column">
          <h3 className="ui header">Project Members</h3>
          <div className="ui basic segment">
            Project Members may create, edit or delete assets in this project        
            <p className="ui tiny orange label">! Access Control Not Yet Implemented !</p>  
            <ProjectMembersGET 
                project={this.data.project} 
                enableRemoveButton={canEdit} 
                handleRemove={this.handleRemoveMemberFromProject}
            />
          </div>
          { this.renderAddPeople() } 
        </div>
        
        <div className="one wide column"></div>        
        
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
  
  // TODO - Activity - filter for project / user.  Maybe Have an Activity Page
  
  renderRenameDeleteProject: function()
  {
    const canEdit = this.canEdit()
    if (!canEdit)
      return null
    
    return  <div className="ui secondary segment">
              <div  className="ui fluid labeled icon button"
                    onClick={ () => { alert("Not Yet Implemented")}} >
                <i className="trash icon"></i>
                <span className="text">Rename</span>        
              </div>
              <br></br>
              <div  className="ui fluid red labeled icon button"
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
    
    return  <div className="ui secondary segment">
              <div  className={"ui fluid green labeled icon button" + (active ? " active" : "")}
                    onClick={ () => { this.setState({showAddUserSearch: !active})}} >
                <i className="add user icon"></i>
                <span className="text">Add Members</span>        
              </div>
              { showSearch }              
            </div>
  },  
  
  // TODO: Use this!
  handleProjectNameChangeInteractive: function() {
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
