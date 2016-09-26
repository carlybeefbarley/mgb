import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import reactMixin from 'react-mixin'
import Spinner from '/client/imports/components/Nav/Spinner'

import { Projects } from '/imports/schemas'
import { projectMakeSelector } from '/imports/schemas/projects'
import { logActivity } from '/imports/schemas/activity'

import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import CreateProjectLinkButton from '/client/imports/components/Projects/NewProject/CreateProjectLinkButton'
import { Segment, Header, Divider } from 'stardust'

export default UserProjectList = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,             // params.id is the USER id  OR  params.username is the username
    user: PropTypes.object,               // This is the related user record. We list the projects for this user
    currUser: PropTypes.object            // Currently Logged in user. Can be null
  },
  
  getMeteorData: function() {
    const userId = this.props.user._id
    const handleForProjects = Meteor.subscribe("projects.byUserId", userId)
    const projectSelector = projectMakeSelector(userId)

    return {
      projects: Projects.find(projectSelector).fetch(),
      loading: !handleForProjects.ready()
    }
  },

  /** Return true if logged on user._id is currUser._id and the projects have been loaded */
  canEdit: function() {
    return !this.data.loading &&
           this.props.currUser && 
           this.props.user._id === this.props.currUser._id &&
           this.data.projects
  },
  
  render: function() {
    let projects = this.data.projects
    if (this.data.loading) return <Spinner />

    const ownerName = this.props.user.profile.name

    return (
      <Segment basic>

        <Helmet
          title="User Project List"
          meta={[
              {"name": "description", "content": "Projects"}
          ]}
        />        

        <Header as='h2'>Projects owned by {ownerName}</Header>          
        <CreateProjectLinkButton currUser={this.props.currUser} />
        <p />
        { this.renderProjectsAsCards(projects, true) }
        <br />
        <Divider />
        <Header as='h2'>Projects {ownerName} is a member of</Header>                  
        { this.renderProjectsAsCards(projects, false) }

      </Segment>
    )
  },
  
  renderProjectsAsCards(projects, ownedFlag)
  {
    const Empty = <p>No projects for this user</p>
    var count = 0
    if (!projects || projects.length === 0)
      return Empty
      
    const retval = (
      <div className="ui link cards">
        { projects.map( (project) => {
          const isOwner = (project.ownerId === this.props.user._id)
          if (isOwner === ownedFlag) 
          {
            count++
            return <ProjectCard 
                      project={project} 
                      owner={ownedFlag ? this.props.user : project.ownerName}
                      key={project._id} />
          }
        } ) }
      </div>
    )

    return count > 0 ? retval : Empty
  }
})