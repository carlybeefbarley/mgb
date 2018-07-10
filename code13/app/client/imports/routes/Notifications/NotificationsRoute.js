import React from 'react'
import { utilPushTo } from '/client/imports/routes/QLink'
import { Container, Header, Segment, List, Message } from 'semantic-ui-react'
import ActivityItem from '/client/imports/components/Activities/ActivityItem'

const NotificationsRoute = React.createClass({
  getInitialState() {
    return {
      notifications: [],
    }
  },

  componentDidMount() {
    Meteor.call('Activity.getNotifications', (error, notifications) => {
      if (error) console.warn(error)
      else {
        this.setState({ notifications })
      }
    })
  },

  componentWillMount() {
    if (!this.props.currUser) utilPushTo(null, '/')
  },

  render() {
    if (this.state.notifications.length == 0)
      return (
        <Segment padded basic>
          <Message>
            <Message.Header>Notifications</Message.Header>
            <p>You don't have any notifications yet!</p>
          </Message>
        </Segment>
      )
    return (
      <Container>
        <Segment padded basic>
          <Header as="h2">Notifications</Header>
          <Segment padded>
            <List>
              {_.map(this.state.notifications, activity => (
                <ActivityItem key={activity._id} activity={activity} />
              ))}
            </List>
          </Segment>
        </Segment>
      </Container>
    )
  },
})

export default NotificationsRoute
