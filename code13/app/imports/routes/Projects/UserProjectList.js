import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import { Projects } from '../../schemas';
import { projectMakeSelector } from '../../schemas/projects';

import ProjectCard from '../../components/Projects/ProjectCard';
import Spinner from '../../components/Nav/Spinner';
import Helmet from 'react-helmet';

import { logActivity } from '../../schemas/activity';

// NOTE: UI mockups for this page are at https://v2.mygamebuilder.com/assetEdit/Ev2AWBDywffWTtJRc# 

export default UserProjectList = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,             // params.id is the USER id
    user: PropTypes.object,               // This is the related user record. We list the projects for this user
    currUser: PropTypes.object
  },
  
  
  getMeteorData: function() {
    const userId = this.props.params.id
    const handleForProjects = Meteor.subscribe("projects.byUserId", userId);
    const projectSelector = projectMakeSelector(userId)

    return {
      projects: Projects.find(projectSelector).fetch(),
      loading: !handleForProjects.ready()
    };
  },


  /** Return true if logged on user is props.param.id and the projects have been loaded */
  canEdit: function() {
    return !this.data.loading &&
           this.props.currUser && 
           this.props.params.id === this.props.currUser._id &&
           this.data.projects
  },
  

  render: function() {
    // Projects provided via getMeteorData()
    let projects = this.data.projects;
    if (this.data.loading)
      return <Spinner />

    const canEd = this.canEdit()
    const ownerName = this.props.user.profile.name
    
    return (
      <div className="ui basic segment">

        <Helmet
          title="User Project List"
          meta={[
              {"name": "description", "content": "Projects"}
          ]}
        />        

        <h2 className="ui header">Projects owned by {ownerName}</h2>          
        { this.renderProjectsAsCards(projects, true) }
        { canEd && this.renderCreateProject() } 

        <div className="ui divider"></div>
        <h2 className="ui header">Projects {ownerName} is a member of</h2>          
        { this.renderProjectsAsCards(projects, false) }

      </div>
    );
  },
  
  
  renderProjectsAsCards(projects, ownedFlag)
  {
    const Empty = <p>No projects for this user</p>
    var count = 0
    if (!projects || projects.length === 0)
      return Empty
      
    const retval =   
        <div className="ui link cards">
          { projects.map( (project) => {
            const isOwner = (project.ownerId === this.props.params.id)
            if (isOwner === ownedFlag) 
            {
              count++
              return <ProjectCard 
                        project={project} 
                        owner={this.props.user}
                        key={project._id} />
            }
          } ) }
        </div>

    return count > 0 ? retval : Empty
  },

  
  renderCreateProject()
  {
    return  <div className="ui action input">
              <div className="ui green button" onClick={this.handleNewProject}>Create New Project</div>
              <input type="text" ref="newProjectName" placeholder="New Project Name" />
            </div>
  },
    
    
  handleNewProject: function()
  {
    let pName = this.refs.newProjectName.value
    if (!pName || pName.length < 1)
    {
      console.log("TODO: Project name too short")
      return
    }
    let newProj = {
      name: pName,
      description: "" 
    }

    Meteor.call('Projects.create', newProj, (error, result) => {
      if (error) {
         console.log("Could not create project")
      } else {
        logActivity("project.create",  `Create project ${pName}`);
        this.refs.newProjectName.value = "";
      }
    })
  }
  
})
