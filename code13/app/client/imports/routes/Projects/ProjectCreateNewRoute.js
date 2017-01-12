import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { showToast } from '/client/imports/routes/App'

import ProjectCreateNew from '/client/imports/components/Projects/NewProject/ProjectCreateNew'
import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'


export default ProjectCreateNewRoute = React.createClass({

  propTypes: {
    user:             PropTypes.object,         // Maybe absent if route is /assets
    currUser:         PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array,          // Projects list for currently logged in user
    ownsProfile:      PropTypes.bool
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
            currUserProjects={this.props.currUserProjects}
            />
      </div>
    )
  },

  handleCreateProjectClickFromComponent: function(pName)
  {
    if (!pName || pName.length < 1)
    {
      showToast("TODO: Project name too short", 'warning')
      return
    }

    let newProj = {
      name: pName,
      description: "" 
    }

    Meteor.call('Projects.create', newProj, (error, result) => {
      if (error) {
        showToast("Could not create project", 'error')
      } else {
        logActivity("project.create",  `Create project ${pName}`)
        utilPushTo(this.context.urlLocation.query, `/u/${this.props.currUser.profile.name}/project/${result}`)
      }
    })
  }

})