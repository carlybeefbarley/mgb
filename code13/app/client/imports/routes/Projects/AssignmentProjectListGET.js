import _ from 'lodash'
import { Grid, Header, Segment, List } from 'semantic-ui-react'
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
    const handleForProject = Meteor.subscribe('projects.byAssignmentId')
    return {
      projects: Projects.find({ assignmentId: project.assignmentId }).fetch(),
      loading: !handleForProject.ready(),
    }
  },

  getProjectLists() {
    const lists = { completed: [], incomplete: [] }
    _.map(this.data.projects, project => {
      if (project.workState === 'polished') lists.completed.push(project)
      else lists.incomplete.push(project)
    })
    return lists
  },

  renderList(list) {
    return (
      <Segment
        style={{
          clear: 'left',
          overflowY: 'auto',
          height: '20em',
        }}
      >
        <List relaxed divided style={{ paddingBottom: '1em !important' }}>
          {_.map(list, (proj, i) => {
            return (
              <List.Item
                key={i}
                as="a"
                onClick={() =>
                  utilPushTo(this.context.urlLocation.query, `/u/${proj.ownerName}/projects/${proj.name}`)}
              >
                {proj.ownerName}
              </List.Item>
            )
          })}
        </List>
      </Segment>
    )
  },

  render() {
    const { project } = this.props
    if (this.data.loading || !project) return <Spinner />

    const lists = this.getProjectLists()
    const containerSty = {
      flex: 1,
      margin: '0.5em',
    }

    return (
      <div style={{ clear: 'left', display: 'flex', flexFlow: 'row' }}>
        <Segment style={containerSty} padded raised>
          <Header as="h3" floated="left">
            Completed
          </Header>

          {this.renderList(lists.completed)}
        </Segment>
        <Segment style={containerSty} padded raised>
          <Header as="h3" floated="left">
            Incomplete
          </Header>

          {this.renderList(lists.incomplete)}
        </Segment>
      </div>
    )
  },
})

export default AssignmentProjectListGET
