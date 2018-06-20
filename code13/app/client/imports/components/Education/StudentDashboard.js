import React from 'react'
import { Container, Grid, Header, Segment, TextArea } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'
import AssignmentsListGET from '/client/imports/components/Education/AssignmentsListGET'
import { createContainer } from 'meteor/react-meteor-data'
import { Classrooms, Users } from '/imports/schemas'
import { classroomsMakeSelectorForStudent } from '/imports/schemas/classrooms'

class StudentDashboard extends React.Component {
  render() {
    const { currUser, classrooms, teacherName } = this.props

    const { avatar } = currUser.profile

    const titleStyle = {
      fontSize: '3em',
      textAlign: 'center',
    }

    const infoStyle = {
      fontSize: '1.5em',
      textAlign: 'center',
    }

    const upcomingStyle = {
      minHeight: '21.5em',
    }

    const aboutMeStyle = {
      minHeight: '15em',
    }

    const inputStyle = {
      minHeight: '10em',
      width: '100%',
      opacity: '0.9',
    }

    return (
      <div>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <Header style={titleStyle} as="h1" content={`${currUser.username}`} textAlign="center" />
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit
                />
                <Container style={infoStyle}>
                  <p>
                    {classrooms && classrooms[0] && classrooms[0].name}
                    <br />
                    {teacherName && `Teacher: ${teacherName}`}
                  </p>
                </Container>
              </Segment>
              {/* Not sure if we are tracking skills with AIE
                  
                  <SkillAction currUser={currUser} />  
                  <RecentAssetAction currUser={currUser} />*/}
            </Grid.Column>

            <Grid.Column width={11}>
              <Segment raised color="blue" style={upcomingStyle}>
                <Header as="h2" content="Upcoming Assignments" />
                <AssignmentsListGET />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* <Divider hidden /> */}

        <Grid padded stackable>
          <Grid.Column tablet={16} computer={16}>
            <Segment raised color="yellow" style={aboutMeStyle}>
              <Grid.Row>
                <Header as="h2" content="About me" />
                <TextArea
                  placeholder="Tell the class a little about yourself and your goals for making games"
                  style={inputStyle}
                />
              </Grid.Row>
              <hr />
              <Grid.Row>
                <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
              </Grid.Row>
              <hr />
              <Grid.Row>
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Grid.Row>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
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
