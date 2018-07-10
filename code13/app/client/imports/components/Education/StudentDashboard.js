import React from 'react'
import { Container, Grid, Header, Segment, TextArea } from 'semantic-ui-react'
// import PropTypes from 'prop-types'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'
import AssignmentsListGET from '/client/imports/components/Education/AssignmentsListGET'
import { createContainer } from 'meteor/react-meteor-data'
import { Classrooms, Users } from '/imports/schemas'
import { classroomsMakeSelectorForStudent } from '/imports/schemas/classrooms'
import QLink from '/client/imports/routes/QLink'
import UserBioCard from '/client/imports/components/Users/UserBioCard'

class StudentDashboard extends React.Component {
  render() {
    const { currUser, classrooms, teacherName, handleAvatarChange } = this.props,
      { avatar } = currUser.profile,
      titleStyle = {
        fontSize: '2em',
        textAlign: 'center',
      },
      containerStyle = {
        overflowY: 'auto',
      },
      infoStyle = {
        fontSize: '1em',
        textAlign: 'center',
      },
      upcomingStyle = {
        minHeight: '21.5em',
      },
      aboutMeStyle = {
        minHeight: '15em',
      },
      inputStyle = {
        minHeight: '10em',
        width: '100%',
        opacity: '0.9',
      }

    const headerStyle = {
      color: 'lightgrey',
      fontSize: '2.5em',
      textAlign: 'center',
    }

    const rowStyle = {
      minHeight: '20em',
      maxHeight: '20em',
      marginBottom: '2em',
    }

    return (
      <Grid columns={16} padded style={containerStyle}>
        <Grid.Column width={3} />
        <Grid.Column width={10}>
          <Header as="h1" content="Student Dashboard" style={headerStyle} />
          <Grid columns={16}>
            <Grid.Row>
              <Grid.Column width={6}>
                <Segment raised color="blue" style={rowStyle}>
                  <ImageShowOrChange
                    id="mgbjr-profile-avatar"
                    maxHeight="11em"
                    maxWidth="auto"
                    imageSrc={avatar}
                    header="User Avatar"
                    canEdit
                    handleChange={url => handleAvatarChange(url)}
                  />
                  <Header as="h1" content={`${currUser.username}`} textAlign="center" />
                  <div style={infoStyle}>
                    <p>
                      {classrooms &&
                      classrooms[0] && (
                        <QLink to={`/user/${currUser.username}/classroom/${classrooms[0]._id}`}>
                          {classrooms[0].name}
                        </QLink>
                      )}
                      <br />
                      {teacherName && <QLink to={`/user/${teacherName}`}>{`${teacherName}`}</QLink>}
                    </p>
                  </div>
                </Segment>
              </Grid.Column>
              <Grid.Column width={10}>
                <UserBioCard {...this.props} user={currUser} canEdit />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <Segment raised color="yellow" style={upcomingStyle}>
                  <Header as="h2" content="Upcoming Assignments" />
                  <AssignmentsListGET
                    {...this.props}
                    showUpcoming
                    showNoDueDate={false}
                    showPastDue={false}
                    showProjectCreateButtons
                  />
                </Segment>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <Segment raised color="purple">
                  <UserProfileGamesList user={currUser} currUser={currUser} />
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>

        <Grid.Column width={3} />
      </Grid>
    )
  }
}

export default createContainer(props => {
  const userId = Meteor.user()._id
  const handle = Meteor.subscribe('classrooms.byUserId', userId)
  const cursor = Classrooms.find(classroomsMakeSelectorForStudent(userId))
  const classrooms = cursor.fetch()
  let returnProps = { ...props, classrooms }
  // !!If users are able to be part of more than one class room this entire HOC will be completely useless.!!
  if (handle.ready() && classrooms && classrooms[0]) {
    let teacherId = classrooms[0].ownerId
    Meteor.subscribe('user', teacherId)
    const teacherNames = Users.find(teacherId).fetch()
    returnProps['teacherName'] = teacherNames && teacherNames[0] ? teacherNames[0].username : ''
  }

  return returnProps
}, StudentDashboard)
