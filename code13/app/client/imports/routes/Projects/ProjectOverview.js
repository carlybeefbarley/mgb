import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import QLink from '../QLink'
import { Projects } from '/imports/schemas'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import ProjectMembersGET from '/client/imports/components/Projects/ProjectMembersGET'
import GamesAvailableGET from '/client/imports/components/Assets/GameAsset/GamesAvailableGET'
import Spinner from '/client/imports/components/Nav/Spinner'
import Helmet from 'react-helmet'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import UserListRoute from '../Users/List'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

import { logActivity } from '/imports/schemas/activity'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import { Grid, Segment, Message, Icon, Header, Button } from 'semantic-ui-react'

export default ProjectOverview = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // Contains params.projectId
    user:   PropTypes.object,       // App.js gave us this from params.id OR params.username
    currUser: PropTypes.object
  },
  
  getInitialState: () => ({ 
    showAddUserSearch: false,       // True if user search box is to be shown
    isDeletePending:   false,       // True if a delete project operation is pending
    isDeleteComplete:  false        // True if a delete project operation succeeded.
  }),   
  
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
          
    const { currUser } = this.props
    const project = this.data.project     // One Project provided via getMeteorData()
    const canEdit = this.canEdit()

    if (!project && this.state.isDeleteComplete)
      return (
        <Segment basic padded>
          <Message warning>
            <Icon name='warning' />
            You successfully deleted this empty project. You monster.
            { currUser && 
              <p>
                <QLink to={"/u/" + currUser.profile.name + "/projects"}>
                  Go to your Projects List..
                </QLink>
              </p>
            }
          </Message>
        </Segment>
      )

    if (project && this.state.isDeleteComplete)
      return <p>What the heck? It's still here? Err, refresh page maybe!?</p>

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
          <Header as="h3" >Games in this Project</Header>
          <Segment basic>
            <GamesAvailableGET 
                scopeToUserId={project.ownerId}
                scopeToProjectName={project.name}
                />
          </Segment>
          
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
    if (this.state.isDeletePending)
    {
      alert("Delete is still pending...")
      return
    }

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
    if (this.state.isDeletePending)
    {
      alert("Delete is still pending...")
      return
    }

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
      else 
      {
       // Go through all the keys, log completion tags for each
        _.each(_.keys(changeObj), k => joyrideCompleteTag(`mgbjr-CT-project-set-field-${k}`))     
      }
    })
  },

  handleDeleteProject: function()
  {
    var { name, _id } = this.data.project
    this.setState( { isDeletePending: true } )

    Meteor.call('Projects.deleteProjectId', _id, this.canEdit(), (error, result ) => {

      if (error)
      {
        alert(`Could not delete Project '${name}: ${error.reason}`)
        this.setState( { isDeletePending: false } )
      }
      else
      {
        // alert(`Deleted ${result} Project: '${name}'`)  We have a nice UI for this instead now using state & activityLog...
        logActivity("project.destroy",  `Destroyed empty project ${name}`)
        this.setState( { isDeletePending: false, isDeleteComplete: true } )
      }
    })
  },
  
  // TODO - Activity - filter for project / user.  Maybe have a Project-related Activity Page
  
  renderRenameDeleteProject: function()
  {
    if (!this.canEdit()) return null
    const { isDeleteComplete, isDeletePending } = this.state

    return (
      <Segment secondary compact>
        <Header>Manage Project</Header>
        <Button 
            icon="edit" 
            content="Rename" 
            disabled={isDeleteComplete || isDeletePending} 
            onClick={ () => { alert("Not Yet Implemented")}} />
        <Button 
            icon="red trash" 
            disabled={isDeleteComplete || isDeletePending} 
            content="Delete" 
            onClick={ () => { this.handleDeleteProject() } } />
        { isDeletePending && 
          <Message icon>
            <Icon name='circle notched' loading />
            <Message.Content>
              <Message.Header>Deleting this project</Message.Header>
              Please wait while we make sure it's really deleted...
            </Message.Content>
          </Message>        
        }
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
        <Button 
            color="green" 
            icon="add user" 
            content="Add Members" 
            disabled={this.state.isDeletePending}
            active={active}
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