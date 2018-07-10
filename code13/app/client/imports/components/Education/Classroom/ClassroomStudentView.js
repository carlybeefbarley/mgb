import React from 'react'
import { Grid, Header, Segment, List, Button } from 'semantic-ui-react'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import Spinner from '/client/imports/components/Nav/Spinner'
import ReactQuill from 'react-quill'
import AssignmentsListGET from '/client/imports/components/Education/AssignmentsListGET'
import StudentListGET from '/client/imports/components/Education/StudentListGET'
import QLink from '/client/imports/routes/QLink'

export default class StudentClassroomView extends React.Component {
  render() {
    const { currUser, classroom, teacher, toggleChat } = this.props

    if (!classroom) {
      return <Spinner loadingMsg="Loading Classroom..." />
    }

    const { avatar } = classroom
    const containerStyle = {
      overflowY: 'auto',
      overflowX: 'hidden',
    }

    const titleStyle = {
      fontSize: '2em',
      textAlign: 'center',
    }

    const infoStyle = {
      fontSize: '1.3em',
      textAlign: 'center',
    }

    const headerStyle = {
      color: 'lightgrey',
      fontSize: '2.5em',
      textAlign: 'center',
    }
    return (
      <div style={containerStyle}>
        <Header as="h1" content="Student Classroom Dashboard" style={headerStyle} />

        <Grid columns={16} padded stackable>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <Header style={titleStyle} as="h1" content={classroom && classroom.name} />

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
                    <List.Content>
                      {teacher && <QLink to={`/u/${teacher.username}`}>{`${teacher.username}`}</QLink>}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content onClick={toggleChat}>
                      <Button icon="chat" color="blue" content="Classroom Chat" />
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>

            <Grid.Column width={8}>
              <Segment raised color="green">
                <Header as="h2" content="About this Class" />
                <Segment>
                  <ReactQuill
                    readOnly
                    style={{ pointerEvents: 'none' }}
                    theme={null}
                    defaultValue={classroom && classroom.description}
                  />
                </Segment>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={13}>
              <Segment raised color="yellow">
                <Header as="h2" content="Upcoming Assignments" />
                <AssignmentsListGET {...this.props} showUpcoming showNoDueDate showProjectCreateButtons />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Column width={13}>
            <Grid.Row>
              <Segment raised color="purple">
                <Header as="h2" content="Students" />
                <StudentListGET studentIds={classroom.studentIds} />
              </Segment>
            </Grid.Row>
          </Grid.Column>

          <Grid.Column width={13}>
            <Grid.Row>
              <Segment raised color="orange">
                <Header as="h2" content="Published Games from this Class" />
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Segment>
            </Grid.Row>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}
