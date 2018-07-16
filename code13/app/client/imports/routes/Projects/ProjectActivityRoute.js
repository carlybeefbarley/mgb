import React from 'react'
import { utilPushTo } from '/client/imports/routes/QLink'
import { Container, Header, Segment, List } from 'semantic-ui-react'
import ActivityItem from '/client/imports/components/Activities/ActivityItem'

const ACTIVITY_LIMIT = 30
class ProjectActivityRoute extends React.Component {
  state = {
      activities: [],
    }

  componentDidMount() {
    Meteor.call(
      'Activity.getActivitiesByProjectName',
      this.props.params.projectName,
      ACTIVITY_LIMIT,
      (error, activities) => {
        if (error) console.warn(error)
        else {
          this.setState({ activities })
        }
      },
    )
  }

  componentWillMount() {
    if (!this.props.currUser) utilPushTo(null, '/')
  }

  render() {
    return (
      <Container>
        <Segment padded basic>
          <Header as="h2">Project Activity</Header>
          <Segment padded>
            <List>
              {_.map(this.state.activities, activity => (
                <ActivityItem key={activity._id} activity={activity} />
              ))}
            </List>
          </Segment>
        </Segment>
      </Container>
    )
  }

}

export default ProjectActivityRoute
