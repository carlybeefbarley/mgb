import React from 'react'
import { Grid, Header, Segment, List } from 'semantic-ui-react'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'
import { createContainer } from 'meteor/react-meteor-data'
import UpcomingClassAssignmentsList from '/client/imports/components/Education/UpcomingClassAssignmentsList'
import { Classrooms, Users } from '/imports/schemas'

class ClassroomDashboard extends React.Component {
  render() {
    const { currUser, classroom } = this.props
    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = currUser.profile

    const titleStyle = {
      fontSize: '2em',
      textAlign: 'center',
    }

    const infoStyle = {
      fontSize: '1.3em',
      textAlign: 'center',
    }

    return (
      <div style={containerStyle}>
        <Grid columns={2} padded stretched>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <Header style={titleStyle} as="h1" content={classroom.name} />

                {/* Change avatar for classroom later  */}
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={false}
                />
                <List style={infoStyle}>
                  <List.Item>
                    <List.Content>Teacher Name</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content>
                      <List.Icon name="chat" color="blue" />Class Chat
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column width={11}>
              <Segment raised color="blue">
                <Header as="h3" content="About this Class" />
                <Segment>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.
                  </p>

                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.
                  </p>
                </Segment>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns={2} padded stackable>
          <Grid.Row>
            <Grid.Column width={8}>
              <Segment raised color="yellow">
                <Header as="h2" content="Upcoming Assignments" />
                <UpcomingClassAssignmentsList />
              </Segment>
            </Grid.Column>

            <Grid.Column width={8}>
              <Segment raised color="yellow">
                <Header as="h2" content="Past Assignments" />
                {/* <PastClassAssignmentsList /> */}
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid columns={1} padded stackable>
          <Grid.Column width={16}>
            <Grid.Row>
              <Segment raised color="purple">
                <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
              </Segment>
            </Grid.Row>
          </Grid.Column>
        </Grid>
        <Grid columns={1} padded stackable>
          <Grid.Column width={16}>
            <Grid.Row>
              <Segment raised color="teal">
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Segment>
            </Grid.Row>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default createContainer(props => {
  const handleForClassroom = Meteor.subscribe('classrooms.oneClassroom', props.params.classroomId)
  // const handleForUsers = Users
  const classroomCursor = Classrooms.find(props.params.classroomId)
  const classroom = classroomCursor.fetch()[0]

  const returnProps = { ...props, classroom }
  return returnProps
}, ClassroomDashboard)
