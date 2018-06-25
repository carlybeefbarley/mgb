import React from 'react'
import _ from 'lodash'
import { Button, Grid, Header, Segment, List, TextArea } from 'semantic-ui-react'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import { createContainer } from 'meteor/react-meteor-data'
import { Classrooms } from '/imports/schemas'
import SubmissionFeed from '/client/imports/components/Education/SubmissionFeed'

class TeacherDashboard extends React.Component {
  renderClassesList = () => {
    const { classrooms } = this.props
    const list = _.map(classrooms, classroom => {
      return (
        <List.Item key={classroom.name}>
          <List.Content>
            <List.Header>{classroom.name}</List.Header>
          </List.Content>
        </List.Item>
      )
    })

    if (list.length === 0)
      return (
        <List.Item key={'TOPBOY'}>
          <List.Content>
            <List.Header>No Classrooms Found.</List.Header>
          </List.Content>
        </List.Item>
      )
    return list
  }

  handleCreateNewClass = () => {}

  render() {
    const { currUser } = this.props,
      containerStyle = {
        overflowY: 'auto',
      },
      titleStyle = {
        fontSize: '3em',
        textAlign: 'center',
      },
      { avatar } = currUser.profile,
      infoStyle = {
        fontSize: '1.7em',
        textAlign: 'center',
      },
      inputStyle = {
        minHeight: '10em',
        width: '100%',
        opacity: '0.9',
      }

    return (
      <Grid columns={1} padded style={containerStyle}>
        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Button color="orange" floated="right">
              Add New Class
            </Button>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={4}>
            <Segment raised color="blue">
              <ImageShowOrChange
                id="mgbjr-profile-avatar"
                maxHeight="11em"
                maxWidth="auto"
                canLinkToSrc
                imageSrc={avatar}
                header="User Avatar"
                canEdit={false}
              />
              <Header style={titleStyle} as="h1" content={currUser.username} textAlign="center" />
              <List style={infoStyle}>
                <List.Item>
                  <List.Content>
                    <List.Icon name="chat" color="blue" />Class Chat
                  </List.Content>
                </List.Item>
              </List>
            </Segment>
          </Grid.Column>
          <Grid.Column width={6}>
            <Segment raised color="blue">
              <Header as="h2" content="Your Classes" />
              <List relaxed content={this.renderClassesList()} />
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Segment raised color="yellow">
              <Header as="h2" content="Submission Feed" />
              <SubmissionFeed />
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Segment raised color="purple">
              <Header as="h2" content="About You" />
              <TextArea
                placeholder="Let your students know a little bit about your background and what kind of games you have worked on"
                style={inputStyle}
              />
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default createContainer(props => {
  const userId = Meteor.user()._id
  const classroomsHandler = Meteor.subscribe('classrooms.byUserId', userId)
  const classroomsCursor = Classrooms.find({ ownerId: userId })
  const classrooms = classroomsCursor.fetch()
  return { ...props, classrooms, loading: !classroomsHandler.ready() }
}, TeacherDashboard)
