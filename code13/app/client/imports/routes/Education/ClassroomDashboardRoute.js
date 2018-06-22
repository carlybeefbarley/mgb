import React from 'react'
import { Grid, Header, Segment, List } from 'semantic-ui-react'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'
import { createContainer } from 'meteor/react-meteor-data'
import UpcomingClassAssignmentsList from '/client/imports/components/Education/UpcomingClassAssignmentsList'
import { Classrooms, Users } from '/imports/schemas'
import Spinner from '../../components/Nav/Spinner'
import ReactQuill from 'react-quill'
import AssignmentsListGET from '/client/imports/components/Education/AssignmentsListGET'
import ChatPanel from '/client/imports/components/Chat/ChatPanel'
import {
  parseChannelName,
  makeChannelName,
  ChatChannels,
  isChannelNameValid,
  chatParams,
  makePresentedChannelName,
  makePresentedChannelIconName,
} from '/imports/schemas/chats'

class ClassroomDashboard extends React.Component {
  render() {
    const { currUser, classroom, teacher, assignment } = this.props
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
    if (!classroom) {
      return <Spinner content="Loading Data..." />
    }

    return (
      <div style={containerStyle}>
        <Grid columns={16} stretched>
          <Grid.Column width={3}>
            <ChatPanel currUser={currUser} channelName={channelName} />
          </Grid.Column>
          <Grid.Column width={10}>
            <Grid columns={10}>
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
                        <List.Content>{teacher.username}</List.Content>
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
                      <ReactQuill theme={null} readyOnly value={classroom.description} />
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
          </Grid.Column>
          <Grid.Column width={3} />
        </Grid>
      </div>
    )
  }
}

export default createContainer(props => {
  const handleForClassroom = Meteor.subscribe('classrooms.oneClassroom', props.params.classroomId)
  const classroomCursor = Classrooms.find(props.params.classroomId)
  const classroom = classroomCursor.fetch()[0]
  let teacher, handleForUsers
  if (classroom && classroom.ownerId) {
    handleForUsers = Meteor.subscribe('users.getByIdList', [classroom.ownerId])
    teacher = Users.find(classroom.ownerId).fetch()[0]
  }

  const returnProps = {
    ...props,
    classroom,
    loading: !handleForClassroom.ready() && handleForUsers && handleForUsers.ready(),
    teacher,
  }
  return returnProps
}, ClassroomDashboard)
