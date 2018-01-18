import PropTypes from 'prop-types'
import React from 'react'
import { Header, Segment, List } from 'semantic-ui-react'
import QLink from '../QLink'
import ActivityItem from '/client/imports/components/Activities/ActivityItem'

const ProjectHistoryRoute = React.createClass({
  propTypes: {
    activities: PropTypes.array,
    project: PropTypes.func,
  },

  render() {
    if (this.props.activities.length <= 0) return null

    const project = this.props.project

    return (
      <div>
        <QLink id="mgbjr-project-activity" to={`/u/${project.ownerName}/projects/${project.name}/activity`}>
          <Header as="h3">Activity</Header>
        </QLink>
        <Segment padded>
          <List>
            {_.map(this.props.activities, activity => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </List>
        </Segment>
      </div>
    )
  },
})

export default ProjectHistoryRoute
