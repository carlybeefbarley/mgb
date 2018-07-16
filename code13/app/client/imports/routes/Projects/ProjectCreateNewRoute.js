import PropTypes from 'prop-types'
import React from 'react'
import _ from 'lodash'
import Helmet from 'react-helmet'
import { showToast } from '/client/imports/modules'
import { Segment, Header } from 'semantic-ui-react'
import ProjectCreateNew from '/client/imports/components/Projects/NewProject/ProjectCreateNew'
import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'
import SpecialGlobals from '/imports/SpecialGlobals.js'
import { isUserSuperAdmin } from '/imports/schemas/roles'

export default class ProjectCreateNewRoute extends React.PureComponent{
  static propTypes= {
    user: PropTypes.object, // Maybe absent if route is /assets
    currUser: PropTypes.object, // Currently Logged in user
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
    ownsProfile: PropTypes.bool,
  }

  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  handleCreateProjectClickFromComponent = (pName) => {
    if (!pName || pName.length < 1) {
      showToast.warning('TODO: Project name too short')
      return
    }

    let newProj = {
      name: pName,
      description: '',
    }

    Meteor.call('Projects.create', newProj, (error, result) => {
      if (error) showToast.error('Could not create project - ' + error.reason)
      else {
        logActivity('project.create', `Create project ${pName}`)
        utilPushTo(this.context.urlLocation.query, `/u/${this.props.currUser.profile.name}/projects/${pName}`)
      }
    })
  }

  render() {
    const numUserOwnprojects = _.filter(
      this.props.currUserProjects,
      p => p.ownerId === this.props.currUser._id,
    ).length
    const maxUserOwnProjects = isUserSuperAdmin(this.props.currUser)
      ? SpecialGlobals.quotas.SUdefaultNumOfOwnedProjectsAllowed
      : SpecialGlobals.quotas.defaultNumOfOwnedProjectsAllowed
    return (
      <Segment basic>
        <Helmet title="Create New Project" meta={[{ name: 'description', content: 'Project' }]} />
        <Header as="h2" content="Create a new Project" />
        <p style={numUserOwnprojects >= maxUserOwnProjects ? { color: 'red' } : undefined}>
          {' '}
          {`You currently own ${numUserOwnprojects} out of ${maxUserOwnProjects} projects allowed`}
        </p>
        <ProjectCreateNew
          handleCreateProjectClick={this.handleCreateProjectClickFromComponent}
          currUser={this.props.currUser}
          currUserProjects={this.props.currUserProjects}
        />
      </Segment>
    )
  }
}