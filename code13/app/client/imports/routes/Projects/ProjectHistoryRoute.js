import PropTypes from 'prop-types'
import moment from 'moment'
import React from 'react'
import { Segment, List } from 'semantic-ui-react'
import ActivityItem from '/client/imports/components/Activities/ActivityItem'

export default class ProjectHistoryRoute extends React.PureComponent{
  static propTypes = {
    activities: PropTypes.array,
    project: PropTypes.object,
  }

  render() {
    const { activities, project } = this.props

    return (
      <Segment style={{ flex: 1, margin: 0 }}>
        <List>
          {_.isEmpty(activities) ? (
            <List.Item>
              <List.Icon name="leaf" color="green" />
              <List.Content style={{ width: '100%' }}>
                <List.Content floated="right">
                  <small style={{ color: 'lightgray' }}>{moment(project.createdAt).fromNow()}</small>
                </List.Content>
                <List.Header>{project.name}</List.Header>
                <List.Description>
                  <small>{project.ownerName} created this project</small>
                </List.Description>
              </List.Content>
            </List.Item>
          ) : (
            _.map(this.props.activities, activity => <ActivityItem key={activity._id} activity={activity} />)
          )}
        </List>
      </Segment>
    )
  }
}
