import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import QLink from '../QLink'
import { Projects } from '/imports/schemas'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import ProjectMembersGET from '/client/imports/components/Projects/ProjectMembersGET'
import Spinner from '/client/imports/components/Nav/Spinner'
import Helmet from 'react-helmet'
import UserListRoute from '../Users/List'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

import { logActivity } from '/imports/schemas/activity'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import { Grid, Segment, Header, Button } from 'stardust'

export default ProjectOverview = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // Contains params.projectId
    user:   PropTypes.object,       // App.js gave us this from params.id OR params.username
    currUser: PropTypes.object
  },
  
  getInitialState: () => ({ showAddUserSearch: false }),   // True if user search box is to be shown
  
  getMeteorData: function() {
    let projectId = this.props.params.projectId
    let handleForProject = Meteor.subscribe("projects.forProjectId", projectId)

    return {
      project: Projects.findOne(projectId),
      loading: !handleForProject.ready()
    }
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
      return <ThingNotFound type="Project" />
    
    return (
      <Grid padded>
        <Helmet
          title={`Project Overview: ${project.name}`}
          meta={[
              {"name": `Project Overview: ${project.name}`, "content": "Projects"}
          ]}
        />

        <Grid.Column width={6} style={{minWidth: "250px"}}>
          <ProjectCard 
              project={project} 
              owner={this.props.user}
              canEdit={canEdit}
              handleFieldChanged={this.handleFieldChanged} />
            <QLink to={"/u/" + project.ownerName + "/assets"} query={{project:project.name}} className="ui button" >
              Project Assets
            </QLink>
            { this.renderRenameDeleteProject() } 
        </Grid.Column>
        
        <Grid.Column width={8}>
          <Header as="h3" >Project Members</Header>
          <Segment basic>
            Project Members may create, edit or delete assets in this project &nbsp;        
            <ProjectMembersGET 
                project={this.data.project} 
                enableRemoveButton={canEdit} 
                handleRemove={this.handleRemoveMemberFromProject}
            />
          </Segment>
          { this.renderAddPeople() }
        </Grid.Column>
                
      </Grid>
    )
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
    if (!this.canEdit()) return null
    
    return (
      <Segment secondary compact>
        <Header>Manage Project</Header>
        <Button icon="edit" content="Rename" onClick={ () => { alert("Not Yet Implemented")}} />
        <Button icon="red trash" content="Destroy" onClick={ () => { alert("Not Yet Implemented")}} />
      </Segment>
    )
  },

  renderAddPeople: function()
  {
    if (!this.canEdit()) return null
      
    const project = this.data.project
    const relevantUserIds = [ project.ownerId, ...project.memberIds]   
    const active = this.state.showAddUserSearch 
    
    return (
      <Segment secondary compact={!active} >
        <Button color="green" icon="add user" content="Add Members" active={active}
              onClick={ () => { this.setState({showAddUserSearch: !active})}} />
        { !active ? null : 
            <UserListRoute  
                handleClickUser={this.handleClickUser}
                initialLimit={20}
                excludeUserIdsArray={relevantUserIds}
                renderVertical={true} 
                hideTitle={true}/>
         }              
      </Segment>
    )
  }
  
})