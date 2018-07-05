import _ from 'lodash'
import { List } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import React from 'react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Spinner from '/client/imports/components/Nav/Spinner'
import { Projects } from '/imports/schemas'
import QLink from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'

// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

// Contains list of projects with assignmentIds for the student
// Ordered by due dates and workStates
const AssignmentProjectListGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    userId: PropTypes.string.isRequired,
    assignmentAssetIds: PropTypes.array.isRequired, // Array of assignmentIds for the classroom
  },

  contextTypes: {
    urlLocation: PropTypes.object,
  },

  getMeteorData() {
    const { userId, assignmentAssetIds } = this.props
    const handleForProject = Meteor.subscribe('projects.byUserId')

    return {
      projects: Projects.find({ assignmentId: { $in: assignmentAssetIds }, ownerId: userId }).fetch(),
      loading: !handleForProject.ready(),
    }
  },

  render() {
    return (
      <List>
        {!this.data.projects ? (
          <Spinner />
        ) : this.data.projects.length === 0 ? (
          <List.Item>
            <List.Content>
              <List.Header>You do not currently have any assignments.</List.Header>
            </List.Content>
          </List.Item>
        ) : (
          _.map(this.data.projects, project => {
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
  },
})

export default AssignmentProjectListGET
