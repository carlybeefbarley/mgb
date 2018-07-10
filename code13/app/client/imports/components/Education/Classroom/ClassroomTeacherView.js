import React from 'react'
import { Grid, Header, Segment, List, Table, Icon, Button, Divider } from 'semantic-ui-react'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import AssignmentsList from '/client/imports/components/Education/AssignmentsList'
import StudentListGET from '/client/imports/components/Education/StudentListGET'
import ClassroomAddStudentModal from '/client/imports/components/Education/ClassroomAddStudentModal'
import ClassroomAddAssignmentModal from '/client/imports/components/Education/ClassroomAddAssignmentModal'
import QLink from '/client/imports/routes/QLink'

const cellStyle = {
  textAlign: 'center',
}

export default class TeacherClassroomView extends React.Component {
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
    const { currUser, assignments, students, classroom, toggleChat, handleAvatarChange } = this.props

    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = classroom

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
                    canEdit
                    handleChange={url => handleAvatarChange(url)}
                  />
                  <List style={infoStyle}>
                    <List.Item>
                      <List.Content onClick={toggleChat}>
                        <Button icon="chat" color="blue" content="Classroom Chat" />
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
                    <AssignmentsList assignmentAssets={assignments} showUpcoming showNoDueDate />
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
