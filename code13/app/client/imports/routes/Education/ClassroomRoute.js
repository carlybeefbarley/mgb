import React from 'react'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { Grid, Header, Segment, List, Table, Icon, Button, Divider } from 'semantic-ui-react'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import { createContainer } from 'meteor/react-meteor-data'
import { Classrooms, Users, Azzets, Projects } from '/imports/schemas'
import Spinner from '../../components/Nav/Spinner'
import ReactQuill from 'react-quill'
import AssignmentsList from '/client/imports/components/Education/AssignmentsList'
import AssignmentsListGET from '/client/imports/components/Education/AssignmentsListGET'
import StudentListGET from '/client/imports/components/Education/StudentListGET'
import ChatPanel from '/client/imports/components/Chat/ChatPanel'
import { makeChannelName } from '/imports/schemas/chats'
import ClassroomAddStudentModal from '/client/imports/components/Education/ClassroomAddStudentModal'
import ClassroomAddAssignmentModal from '/client/imports/components/Education/ClassroomAddAssignmentModal'
import QLink from '/client/imports/routes/QLink'
import { doesUserHaveRole, roleTeacher } from '/imports/schemas/roles'

const cellStyle = {
  textAlign: 'center',
}
/**
 * This file renders two different views depending on if the user is a teacher or a student of a given classroom.
 * Student/Teacher identity is resolved in the createContainer HOC.
 *
 * Student projects are subscribed in HOC and and filtered to only show projects that have an assignment ID.
 */
class TeacherClassroomView extends React.Component {
  classroomHasStudents = () => {
    const { students, assignments } = this.props
    return students && students.length > 0 && assignments && assignments.length > 0
  }
  // Calls all the other table methods to render out the full table with both student names
  // assignment names, and the status of said assignments in a coherent view.
  renderAssignmentTable = () => {
    const { assignments, students } = this.props

    if (!this.classroomHasStudents()) {
      return (
        <Segment>
          <Header>This classroom has no students and or assignments.</Header>
        </Segment>
      )
    }

    return (
      <Table celled striped>
        <Table.Header>
          <Table.Row key={'row_root'}>
            <Table.HeaderCell colSpan="1" key={'column_root'} />
            {/* Top left spacer cell to fill out table. */}
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
      return (
        <Table.HeaderCell colSpan="1" key={'column_' + assignment._id}>
          <QLink to={`/u/${assignment.dn_ownerName}/asset/${assignment._id}`}>{assignment.name}</QLink>
        </Table.HeaderCell>
      )
    })
    return headerCells
  }
  // Renders out the students names for the table.
  renderStudentRows = () => {
    const { assignments, students, studentProjects } = this.props

    const rows = _.map(students, student => {
      return (
        <Table.Row key={'row_' + student._id}>
          <Table.Cell collapsing key={'cell_' + student._id}>
            <QLink to={`/u/${student.username}`}>{student.username}</QLink>
          </Table.Cell>
          {this.renderStudentProjectStatusCells(student)}
        </Table.Row>
      )
    })

    return rows
  }

  getWorkStateStyleColor = workState => {
    switch (workState) {
      case 'broken':
        return 'red'
      case 'working':
        return 'yellow'
      case 'polished':
        return 'green'
      default:
        return 'grey'
    }
  }

  getWorkStateIconName = workState => {
    switch (workState) {
      case 'broken':
        return 'remove'
      case 'working':
        return 'warning'
      case 'polished':
        return 'check'
      default:
        return ''
    }
  }

  // Render out the "assignment" cells for a student by seeing if they own a project that has
  // the current row's assignmentId referenced in it. This is dependant on this.props.assignments to be
  // in an array so that rows are sorted correctly.

  renderStudentProjectStatusCells = student => {
    const { assignments, students, studentProjects } = this.props

    const cells = _.map(assignments, assignment => {
      const cellProject = _.find(studentProjects, project => {
        if (
          project.ownerId === student._id &&
          project.assignmentId &&
          project.assignmentId === assignment._id
        ) {
          return true // TODO: Change to project workstate display string once finalized
        }
      })
      // console.log('Cell Project: ', cellProject)
      const workState = cellProject ? cellProject.workState : 'unknown'
      return (
        <Table.Cell style={cellStyle} key={'cell_' + assignment._id + '_' + student._id}>
          <QLink to={cellProject && `/u/${cellProject.ownerName}/projects/${cellProject.name}`}>
            <Icon
              size="large"
              name={this.getWorkStateIconName(workState)}
              color={this.getWorkStateStyleColor(workState)}
              title={workState}
            />
          </QLink>
        </Table.Cell>
      )
    })

    return cells
  }

  render() {
    const { currUser, assignments, students, classroom, toggleChat } = this.props

    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = currUser && currUser.profile

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

    const headerStyle = {
      color: 'lightgrey',
      fontSize: '2em',
      textAlign: 'center',
      lineHeight: '2em',
    }

    const rowStyle = {
      minHeight: '23em',
      maxHeight: '23em',
      marginBottom: '2em',
    }

    const listStyle = {
      overflowY: 'auto',
      maxHeight: '14em',
      minHeight: '14em',
    }

    return (
      <div style={containerStyle}>
        {/* Floating doesn't seem to work unless I include columns - Hudson */}
        <Grid columns={1} padded>
          <Grid.Column width={16}>
            <Header as="h1" content="Teacher Classroom Dashboard" style={headerStyle} />
            <p>
              <small>{`${assignments.length} assignments, ${students.length} students.`}</small>
            </p>
          </Grid.Column>
        </Grid>
        <Grid columns={2} padded stretched>
          <Grid.Row style={rowStyle}>
            <Grid.Column width={5}>
              <Segment raised style={rowStyle} color="blue">
                <div>
                  <Header style={titleStyle} as="h1" content={classroom.name} />
                  <ImageShowOrChange
                    id="mgbjr-profile-avatar"
                    maxHeight="11em"
                    maxWidth="auto"
                    imageSrc={avatar}
                    canLinkToSrc
                    header="User Avatar"
                    canEdit={false}
                  />
                  <List style={infoStyle}>
                    <List.Item>
                      <List.Content onClick={toggleChat}>
                        <Button icon="chat" color="blue" content="Class Chat" />
                      </List.Content>
                    </List.Item>
                  </List>
                </div>
              </Segment>
            </Grid.Column>
            <Grid.Column width={8}>
              <Segment raised color="green" style={rowStyle}>
                <div>
                  <Header as="h3" content="Upcoming Assignments" />

                  <div style={listStyle}>
                    <AssignmentsList showUpcoming showNoDueDate />
                  </div>
                  <Divider />
                  <ClassroomAddAssignmentModal classroom={classroom} />
                </div>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={13}>
              <Segment raised color="yellow">
                <ClassroomAddStudentModal {...this.props} />
                <div>
                  <Header
                    style={{ lineHeight: '2em', verticalAlign: 'middle' }}
                    as="h3"
                    content="Student Assignment Progress"
                  />

                  <Grid.Row>{this.renderAssignmentTable()}</Grid.Row>
                </div>
              </Segment>

              <Segment raised color="purple">
                <Header as="h3" content="Past Assignments" />
                <AssignmentsList assignmentAssets={assignments} showPastDue />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={13}>
              <Segment raised color="orange">
                <Header as="h3" content="Students" />
                <StudentListGET studentIds={classroom.studentIds} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

class StudentClassroomView extends React.Component {
  render() {
    const { currUser, classroom, teacher, assignments, currUserProjects, toggleChat } = this.props

    if (!classroom) {
      return <Spinner loadingMsg="Loading Classroom..." />
    }

    const channelName = makeChannelName({ scopeGroupName: 'Classroom', scopeId: classroom._id })
    const containerStyle = {
      overflowY: 'auto',
      overflowX: 'hidden',
    }

    const { avatar } = currUser && currUser.profile

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
                      <Button icon="chat" color="blue" content="Class Chat" />
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
                <AssignmentsListGET showUpcoming showNoDueDate />
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

class Classroom extends React.Component {
  state = { chatIsOpen: true }

  toggleChat = () => {
    this.setState(prevState => {
      return { ...prevState, chatIsOpen: !prevState.chatIsOpen }
    })
  }

  render() {
    const { currUser, classroom, isTeacher, loading, params } = this.props
    const { chatIsOpen } = this.state

    if (loading) return <Spinner loadingMsg="Loading Classroom..." />

    if (!classroom) return <ThingNotFound type="Classroom ID" id={params.classroomId} />

    const channelName = makeChannelName({ scopeGroupName: 'Classroom', scopeId: classroom._id })
    const containerStyle = {
      overflowY: 'auto',
      overflowX: 'hidden',
    }

    return (
      <div style={containerStyle}>
        <Grid columns={16} stretched>
          <Grid.Column width={3}>
            {chatIsOpen && <ChatPanel currUser={currUser} channelName={channelName} />}
          </Grid.Column>
          <Grid.Column width={13}>
            {isTeacher ? (
              <TeacherClassroomView {...this.props} toggleChat={this.toggleChat} />
            ) : (
              <StudentClassroomView {...this.props} toggleChat={this.toggleChat} />
            )}
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default createContainer(props => {
  const userId = Meteor.user()._id
  const { classroomId } = props.params
  // Subscribe to the classroom at params.classroomId
  const handleForClassroom = Meteor.subscribe('classrooms.oneClassroom', classroomId)
  const classroomCursor = Classrooms.find(classroomId)
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
    teacher = Users.findOne(classroom.ownerId)
    if (classroom.ownerId === userId) isTeacher = true

    // Subscribe to student users of classroom after subscribed to classroom
    if (classroom && classroom.studentIds && classroom.studentIds.length > 0) {
      handleForStudents = Meteor.subscribe('users.getByIdList', classroom.studentIds)
      studentsCursor = Users.find({ _id: { $in: classroom.studentIds } })
      students = studentsCursor.fetch()
    }

    // Subscribe to assignment assets of classroom after subscribed to classroom
    if (classroom && classroom.assignmentAssetIds && classroom.assignmentAssetIds.length > 0) {
      handleForAssignments = Meteor.subscribe('assets.byAssignmentsList', classroom.assignmentAssetIds)
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
