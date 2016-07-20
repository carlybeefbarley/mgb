import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import ProjectCreateNew from '/client/imports/components/Projects/NewProject/ProjectCreateNew';
import { logActivity } from '/imports/schemas/activity';
import { utilPushTo } from '/client/imports/routes/QLink';


export default ProjectCreateNewRoute = React.createClass({

  propTypes: {
    params: PropTypes.object,       // .id (LEGACY /user/:id routes), or .username (current /u/:username routes)
    user: PropTypes.object,         // Maybe absent if route is /assets
    currUser: PropTypes.object,     // Currently Logged in user
    ownsProfile: PropTypes.bool,
    location: PropTypes.object      // We get this from react-router
  },


  contextTypes: {
    urlLocation: React.PropTypes.object
  },


  render: function() {
    return (
      <div className="ui basic segment">
        <Helmet
          title="Create New Project"
          meta={[
              {"name": "description", "content": "Project"}
          ]}
        />

        <ProjectCreateNew 
          handleCreateProjectClick={this.handleCreateProjectClickFromComponent}
          currUser={this.props.currUser}
          />
      </div>
    )
  },


  handleCreateProjectClickFromComponent: function(pName)
  {
    if (!pName || pName.length < 1)
    {
      alert("TODO: Project name too short")
      return
    }

    let newProj = {
      name: pName,
      description: "" 
    }

    Meteor.call('Projects.create', newProj, (error, result) => {
      if (error) {
        alert("Could not create project")
      } else {
        logActivity("project.create",  `Create project ${pName}`)
        utilPushTo(this.context.urlLocation.query, `/u/${this.props.currUser.profile.name}/project/${result}`)
      }
    })
  }


})