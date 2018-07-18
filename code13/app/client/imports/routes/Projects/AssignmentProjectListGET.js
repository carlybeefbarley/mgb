import _ from 'lodash'
import { List } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import React from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import Spinner from '/client/imports/components/Nav/Spinner'
import { Projects } from '/imports/schemas'
import QLink from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'

// ...GET - because this is a component that GETs it's own data via withTracker() HOC

// Contains list of projects with assignmentIds for the student
// Ordered by due dates and workStates
class AssignmentProjectListGET extends React.PureComponent {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    assignmentAssetIds: PropTypes.array.isRequired, // Array of assignmentIds for the classroom
  }

  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  render() {
    const { projects } = this.props
    return (
      <List>
        {!projects ? (
          <Spinner />
        ) : projects.length === 0 ? (
          <List.Item>
            <List.Content>
              <List.Header>You do not currently have any assignments.</List.Header>
            </List.Content>
          </List.Item>
        ) : (
          _.map(projects, project => {
            return (
              <List.Item key={project.name}>
                <List.Icon>
                  <WorkState isAssignment iconOnly size="small" workState={project.workState} />
                </List.Icon>
                <List.Content style={{ width: '100%' }}>
                  <QLink to={`/u/${project.dn_ownerName}/projects/${project.name}`}>
                    <List.Header>{project.name}</List.Header>
                  </QLink>
                  <List.Description>
                    <small>{project.text}</small>
                  </List.Description>
                </List.Content>
              </List.Item>
            )
          })
        )}
      </List>
    )
  }
}

export default withTracker(props => {
  const { userId, assignmentAssetIds } = props
  const handleForProject = Meteor.subscribe('projects.byUserId')

  return {
    projects: Projects.find({ assignmentId: { $in: assignmentAssetIds }, ownerId: userId }).fetch(),
    loading: !handleForProject.ready(),
  }
})(AssignmentProjectListGET)
