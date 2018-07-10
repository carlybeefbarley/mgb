import React from 'react'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { Grid } from 'semantic-ui-react'
import { createContainer } from 'meteor/react-meteor-data'
import { Classrooms, Users, Azzets, Projects } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'
import ChatPanel from '/client/imports/components/Chat/ChatPanel'
import { makeChannelName } from '/imports/schemas/chats'
import ClassroomTeacherView from '/client/imports/components/Education/Classroom/ClassroomTeacherView'
import ClassroomStudentView from '/client/imports/components/Education/Classroom/ClassroomStudentView'

/**
 * This file renders two different views depending on if the user is a teacher or a student of a given classroom.
 * Student/Teacher identity is resolved in the createContainer HOC.
 *
 * Student projects are subscribed in HOC and and filtered to only show projects that have an assignment ID.
 */

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
              <ClassroomTeacherView {...this.props} toggleChat={this.toggleChat} />
            ) : (
              <ClassroomStudentView {...this.props} toggleChat={this.toggleChat} />
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

  const handleAvatarChange = newUrl => {
    Meteor.call('Classroom.setAvatar', classroom._id, newUrl)
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
    handleAvatarChange,
  }
  return returnProps
}, Classroom)
