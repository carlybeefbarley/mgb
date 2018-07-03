import _ from 'lodash'
import { Button, Segment, List } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import React from 'react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Spinner from '/client/imports/components/Nav/Spinner'
import { Projects } from '/imports/schemas'
import { utilPushTo } from '/client/imports/routes/QLink'

// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

const AssignmentProjectListGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    project: PropTypes.object.isRequired, // A assignment record from the DB. See assignments.js
  },

  contextTypes: {
    urlLocation: PropTypes.object,
  },

  getMeteorData() {
    const project = this.props.project
    const handleForProject = Meteor.subscribe('projects.byAssignmentId', project.assignmentId)

    return {
      projects: Projects.findOne(project._id).forkChildren,
      loading: !handleForProject.ready(),
    }
  },

  getProjectLists() {
    const lists = { completed: [], incompleted: [] }
    _.map(this.data.projects, project => {
      if (project.workState === 'complete') lists.completed.push(project)
      else lists.incompleted.push(project)
    })
    return lists
  },

  render() {
    if (this.data.loading || !this.props.project) return <Spinner />
    const lists = this.getProjectLists()

    return (
      <Segment>
        <List relaxed divided style={{ paddingBottom: '1em !important' }}>
          {_.map(lists.completed, proj => {
            return (
              <List.Item
                key={proj.projectId}
                as="a"
                onClick={() =>
                  utilPushTo(
                    this.context.urlLocation.query,
                    `/u/${proj.forkedByUserName}/projects/${this.props.project.name}`,
                  )}
              >
                {proj.forkedByUserName}
              </List.Item>
            )
          })}
        </List>
        <List relaxed divided style={{ paddingBottom: '1em !important' }}>
          {_.map(lists.incompleted, proj => {
            return (
              <List.Item
                key={proj.projectId}
                as="a"
                onClick={() =>
                  utilPushTo(
                    this.context.urlLocation.query,
                    `/u/${proj.forkedByUserName}/projects/${this.props.project.name}`,
                  )}
              >
                {proj.forkedByUserName}
              </List.Item>
            )
          })}
        </List>
      </Segment>
    )
  },
})

export default AssignmentProjectListGET
