import _ from 'lodash'
import React, { PropTypes } from 'react'
import { showToast } from '/client/imports/routes/App'
import reactMixin from 'react-mixin'
import QLink from '../QLink'
import { Projects } from '/imports/schemas'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import ProjectMembersGET from '/client/imports/components/Projects/ProjectMembersGET'
import GamesAvailableGET from '/client/imports/components/Assets/GameAsset/GamesAvailableGET'
import Spinner from '/client/imports/components/Nav/Spinner'
import Helmet from 'react-helmet'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import UserListRoute from '../Users/UserListRoute'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

import { logActivity } from '/imports/schemas/activity'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import { Grid, Segment, Checkbox, Message, Icon, Header, Button, Popup } from 'semantic-ui-react'

export default ProjectOverview = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // Contains params.projectId
    user:   PropTypes.object,       // App.js gave us this from params.id OR params.username
    currUser: PropTypes.object
  },
  
  getInitialState: () => ({ 
    showAddUserSearch: false,       // True if user search box is to be shown
    isForkPending:     false,       // True if a fork operation is pending
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
    
    const buttonSty = { width: '220px', marginTop: '2px', marginBottom: '2px'}
    return (
      <Grid padded>
        <Helmet
          title={`Project Overview: ${project.name}`}
          meta={[
              {"name": `Project Overview: ${project.name}`, "content": "Projects"}
          ]}
        />

        <Grid.Column width={6} style={{minWidth: "250px", maxWidth: "250px"}}>
          <ProjectCard 
              project={project} 
              owner={this.props.user}
              canEdit={canEdit}
              handleFieldChanged={this.handleFieldChanged} />
          <QLink to={"/u/" + project.ownerName + "/assets"} style={buttonSty} query={{project:project.name}} className="ui small button" >
            Project Assets
          </QLink>
          <Popup 
            inverted wide='very' on='click'
            trigger={(
              <Button 
                disabled={!this.data.project.allowForks} 
                style={buttonSty} 
                size='small' 
                content={this.state.isForkPending ? 'Forking project...' : 'Fork Project'}/>)}
            >
            { this.state.isForkPending ? ( <div>Forking...please wait..</div> ) : (
              <div>
                <Header as='h4' content="Name for new Forked project"/>
                <div className="ui small fluid action input" style={{minWidth: '300px'}}>
                  <input  type="text"
                          id="mgbjr-fork-project-name-input"
                          placeholder="New Project name" 
                          defaultValue={this.data.project.name + ' (fork)'} 
                          ref="forkNameInput"
                          size="22"></input>
                  <Button icon='fork' ref="forkGoButton" onClick={this.handleForkGo}/>
                </div>
              </div>
              ) 
            }
          </Popup>
                
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
  
  handleForkGo()
  {
    const newProjName = this.refs.forkNameInput.value
    showToast(`Forking project '${this.data.project.name}' to '${newProjName}..`, 'info')
    this.setState( { isForkPending: true } )
    const forkCallParams = {
      sourceProjectName: this.data.project.name,
      sourceProjectOwnerId: this.data.project.ownerId,
      newProjectName: newProjName
    }
    Meteor.call("Project.Azzets.fork", forkCallParams, (err, result) => {
      if (err)
        showToast(`Could not fork project: ${err}`, 'error')
      else
      {
        const msg = `Forked project '${this.data.project.name}' to '${newProjName}, creating ${result} new Assets`
        logActivity("project.fork",  msg)
        showToast(msg)
      }
      this.setState( { isForkPending: false } )
    })
  },

  // TODO - override 'Search Users" header level in UserListRoute
  // TODO - some better UI for Add People.
  handleClickUser: function(userId, userName)
  {
    if (this.state.isDeletePending)
    {
      showToast("Delete is still pending. Please wait..", 'warning')
      return
    }

    var project = this.data.project
    var newData = { memberIds: _.union(project.memberIds, [userId])}   
    Meteor.call('Projects.update', project._id, newData, (error, result) => {
      if (error)
        showToast(`Could not add member ${userName} to project ${project.name}`, 'error')
      else
        logActivity("project.addMember",  `Add Member ${userName} to project ${project.name}`)
    })
  },
  
  handleRemoveMemberFromProject: function (userId, userName) {
    if (this.state.isDeletePending)
    {
      showToast("Delete is still pending. Please wait..", 'warning')
      return
    }

    var project = this.data.project
    var newData = { memberIds: _.without(project.memberIds, userId)}   

    Meteor.call('Projects.update', project._id, newData, (error, result) => {
      if (error) 
        showToast(`Could not remove member ${userName} from project ${project.name}`, error)
      else 
        logActivity("project.removeMember",  `Removed Member ${userName} from project ${project.name}`);
    })
  },
    
  /**
   *   @param changeObj contains { field: value } settings.. e.g "profile.title": "New Title"
   */
  handleFieldChanged: function(changeObj)
  {
    const { project } = this.data

    Meteor.call('Projects.update', project._id, changeObj, (error) => {
      if (error) 
        showToast(`Could not update project: ${error.reason}`, error)
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
        showToast(`Could not delete Project '${name}: ${error.reason}`, 'error')
        this.setState( { isDeletePending: false } )
      }
      else
      {
        logActivity("project.destroy",  `Destroyed empty project ${name}`)
        this.setState( { isDeletePending: false, isDeleteComplete: true } )
      }
    })
  },
  
  // TODO - Activity - filter for project / user.  Maybe have a Project-related Activity Page
  
  renderRenameDeleteProject: function()
  {
    const { isDeleteComplete, isDeletePending } = this.state
    const canEdit = this.canEdit()
    const canFork = (
      <Checkbox 
          style={{ marginTop: '6px' }}
          disabled={!canEdit}
          checked={!!this.data.project.allowForks} 
          onChange={ () => this.handleFieldChanged( { allowForks: !this.data.project.allowForks } ) }
          label='Allow users to fork' 
          title="Allow other users to fork your project and it\'s assets"/>
    )
    if (!canEdit) 
      return <div>{canFork}</div>
    
    return (
      <Segment secondary compact style={{width: '220px'}}>
        <Header>Manage Project</Header>
        <div style={{padding: '2px'}}>
          <Button 
            fluid
            icon="edit" 
            size='small'
            content="Rename" 
            disabled={isDeleteComplete || isDeletePending} 
            onClick={ () => { showToast("Rename Project has not yet been implemented.. ", 'warning')}} />
        </div>
        <div style={{padding: '2px'}}>
          <Button 
            fluid
            icon={<Icon color='red' name='trash'/>}
            size='small'
            disabled={isDeleteComplete || isDeletePending} 
            content="Delete" 
            onClick={ () => { this.handleDeleteProject() } } />
        </div>

        <div style={{padding: '2px'}}>
          {canFork}
        </div>

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
    if (!this.canEdit()) 
      return null
      
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
                renderVertical={true} />
         }              
      </Segment>
    )
  }
})