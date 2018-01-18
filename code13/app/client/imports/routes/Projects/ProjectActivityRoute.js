import React from 'react'
import { utilPushTo } from '/client/imports/routes/QLink'
import { Container, Header, Segment, List } from 'semantic-ui-react'
import ActivityItem from '/client/imports/components/Activities/ActivityItem'

const ProjectActivityRoute = React.createClass({
  getInitialState() {
    return {
      activities: [],
    }
  },

  componentDidMount() {
    const activityLimit = 30
    Meteor.call(
      'Activity.getActivitiesByProjectName',
      this.props.params.projectName,
      activityLimit,
      (error, activities) => {
        if (error) console.warn(error)
        else {
          this.setState({ activities })
        }
      },
    )
  },

  componentWillMount() {
    if (!this.props.currUser) utilPushTo(null, '/')
  },

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
  },
})

export default ProjectActivityRoute
