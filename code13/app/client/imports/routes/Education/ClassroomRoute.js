import React from 'react'
import { Grid, Header, Segment, List, Table, Icon, Button } from 'semantic-ui-react'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'
import { createContainer } from 'meteor/react-meteor-data'
import { Classrooms, Users, Azzets, Projects } from '/imports/schemas'
import Spinner from '../../components/Nav/Spinner'
import ReactQuill from 'react-quill'
import AssignmentsListGET from '/client/imports/components/Education/AssignmentsListGET'
import ChatPanel from '/client/imports/components/Chat/ChatPanel'
import { makeChannelName } from '/imports/schemas/chats'

const cellStyle = {
  textAlign: 'center',
}
/**
 * This file renders two different views depending on if the user is a teacher or a student of a given classroom.
 * Student/Teacher identity is resolved in the createContainer HOC.
 * 
 * Student projects are subscribed in HOC and and filtered to only show projects that have an assignment ID.
 */
class TeacherView extends React.Component {
  // Calls all the other table methods to render out the full table with both student names
  // assignment names, and the status of said assignments in a coherent view.
  renderAssignmentTable = () => {
    const { assignments, students } = this.props

    return (
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="1" /> {/* Top left spacer cell to fill out table. */}
            {this.renderTableAssignmentHeaderCells(assignments)}
          </Table.Row>
        </Table.Header>
        <Table.Body>{this.renderStudentRows()}</Table.Body>
      </Table>
    )
  }

  // Renders out the assignment header cells based on the assignment's name
  renderTableAssignmentHeaderCells = assignments => {
    let headerCells = _.map(assignments, assignment => {
      return <Table.HeaderCell colSpan="1" content={assignment.name} />
    })
    return headerCells
  }
  // Renders out the students names for the table.
  renderStudentRows = () => {
    const { assignments, students, studentProjects } = this.props

    const rows = _.map(students, student => {
      return (
        <Table.Row>
          <Table.Cell collapsing content={student.username} />
          {this.renderStudentProjectStatusCells(student)}
        </Table.Row>
      )
    })

    return rows
  }
  // Render out the "assignment" cells for a student by seeing if they own a project that has
  // the current row's assignmentId referenced in it. This is dependant on this.props.assignments to be
  // in an array so that rows are sorted correctly.

  renderStudentProjectStatusCells = student => {
    const { assignments, students, studentProjects } = this.props

    const cells = _.map(assignments, assignment => {
      const hasAssignment = _.find(studentProjects, project => {
        if (
          project.ownerId === student._id &&
          project.assignmentId &&
          project.assignmentId === assignment._id
        ) {
          return true // TODO: Change to project workstate display string once finalized
        }
      })

      return (
        <Table.Cell style={cellStyle}>
          <Icon name={hasAssignment ? 'check circle' : 'x'} color={hasAssignment ? 'green' : 'red'} />
        </Table.Cell>
      )
    })

    return cells
  }

  render() {
    const { currUser, assignments } = this.props

    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = currUser.profile

    const titleStyle = {
      fontSize: '2em',
      textAlign: 'center',
    }

    const infoStyle = {
      fontSize: '1.7em',
      textAlign: 'center',
    }

    const cellStyle = {
      textAlign: 'center',
    }

    return (
      <div style={containerStyle}>
        {/* FLoating doesn't seem to work unless I include columns */}
        <Grid columns={1} padded>
          <Grid.Column width={16}>
            <div>
              <Button color="orange" floated="right">
                Add New Assignment
              </Button>
            </div>
          </Grid.Column>
        </Grid>
        <Grid columns={2} padded stretched>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <Header style={titleStyle} as="h1" content={`Classroom Dashboard`} />
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
                      <List.Icon name="chat" color="blue" />Class Chat
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column width={11}>
              <Segment raised color="blue">
                <Header as="h3" content="Upcoming Assignments" />
                <AssignmentsListGET showUpcoming showPastDue={false} showNoDueDate={false} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid columns={1} padded>
          <Grid.Column width={16}>
            <div>
              <Button color="green" floated="right">
                Add New Student
              </Button>
            </div>
          </Grid.Column>
        </Grid>
        <Grid columns={1} padded>
          <Grid.Column width={16}>
            <Header as="h3" content="Student Assignment Progress" />
            <Segment raised color="yellow">
              <Grid.Row>{this.renderAssignmentTable()}</Grid.Row>
            </Segment>
            <Header as="h3" content="All Assignments" />
            <Segment raised color="green">
              <AssignmentsListGET showUpcoming showPastDue showNoDueDate />
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

class StudentView extends React.Component {
  render() {
    const { currUser, classroom, teacher, assignment, isTeacher, currUserProjects } = this.props

    if (!classroom) {
      return <Spinner loadingMsg="Loading Classroom..." />
    }

    const channelName = makeChannelName({ scopeGroupName: 'Classroom', scopeId: classroom._id })
    const containerStyle = {
      overflowY: 'auto',
      overflowX: 'hidden',
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
        <Grid columns={10}>
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
                    <List.Content>{teacher && teacher.username}</List.Content>
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
                  <ReactQuill theme={null} readyOnly value={classroom && classroom.description} />
                </Segment>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={8}>
              <Segment raised color="yellow">
                <Header as="h2" content="Upcoming Assignments" />
                <AssignmentsListGET showUpcoming showPastDue={false} showNoDueDate={false} />
              </Segment>
            </Grid.Column>

            <Grid.Column width={8}>
              <Segment raised color="yellow">
                <Header as="h2" content="Past Assignments" />
                <AssignmentsListGET showPastDue showNoDueDate={false} showUpcoming={false} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Column width={16}>
            <Grid.Row>
              <Segment raised color="purple">
                <UserColleaguesList user={currUser} narrowItem projects={currUserProjects} />
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

class Classroom extends React.Component {
  render() {
    const { currUser, classroom, teacher, assignment, isTeacher } = this.props

    if (!classroom) {
      return <Spinner loadingMsg="Loading Classroom..." />
    }

    const channelName = makeChannelName({ scopeGroupName: 'Classroom', scopeId: classroom._id })
    const containerStyle = {
      overflowY: 'auto',
      overflowX: 'hidden',
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
        <Grid columns={16} stretched>
          <Grid.Column width={3}>
            <ChatPanel currUser={currUser} channelName={channelName} />
          </Grid.Column>
          <Grid.Column width={10}>
            {(isTeacher && <TeacherView {...this.props} />) || <StudentView {...this.props} />}
          </Grid.Column>
          <Grid.Column width={3} />
        </Grid>
      </div>
    )
  }
}

export default createContainer(props => {
  const userId = Meteor.user()._id
  // Subscribe to the classroom at params.classroomId
  const handleForClassroom = Meteor.subscribe('classrooms.oneClassroom', props.params.classroomId)
  const classroomCursor = Classrooms.find(props.params.classroomId)
  const classroom = classroomCursor.fetch()[0]
  let handleForStudents,
    studentsCursor,
    students = [],
    handleForAssignments,
    assignmentsCursor,
    assignments = [],
    handleForStudentProjects,
    studentProjectsCursor,
    studentProjects = [],
    teacher,
    handleForUsers,
    isTeacher = false

  if (classroom && classroom.ownerId) {
    handleForUsers = Meteor.subscribe('users.getByIdList', [classroom.ownerId])
    teacher = Users.find(classroom.ownerId).fetch()[0]
    if (classroom.ownerId === userId) isTeacher = true

    // Subscribe to student users of classroom after subscribed to classroom
    if (classroom && classroom.studentIds && classroom.studentIds.length > 0) {
      handleForStudents = Meteor.subscribe('users.getByIdList', classroom.studentIds)
      studentsCursor = Users.find({ _id: { $in: classroom.studentIds } })
      students = studentsCursor.fetch()
    }

    // Subscribe to assignment assets of classroom after subscribed to classroom
    if (classroom && classroom.assignmentAssetIds && classroom.assignmentAssetIds.length > 0) {
      handleForAssignments = Meteor.subscribe('assets.public.partial.bySelector', {
        _id: { $in: classroom.assignmentAssetIds },
      })
      assignmentsCursor = Azzets.find({ _id: { $in: classroom.assignmentAssetIds } })
      assignments = assignmentsCursor.fetch()
    }

    // Subscribe to projects of students of classroom after subscribed to classroom
    if (
      classroom &&
      classroom.studentIds &&
      classroom.studentIds.length > 0 &&
      classroom.assignmentAssetIds &&
      classroom.assignmentAssetIds.length > 0
    ) {
      handleForStudentProjects = Meteor.subscribe('projects.byUserList', classroom.studentIds)
      studentProjectsCursor = Projects.find({
        ownerId: { $in: classroom.studentIds },
        assignmentId: { $exists: true },
      })
      studentProjects = studentProjectsCursor.fetch()
    }
  }

  const returnProps = {
    ...props,
    classroom,
    loading: !handleForClassroom.ready() && handleForUsers && handleForUsers.ready(),
    teacher,
    isTeacher,
    students,
    assignments,
    studentProjects,
  }
  return returnProps
}, Classroom)
