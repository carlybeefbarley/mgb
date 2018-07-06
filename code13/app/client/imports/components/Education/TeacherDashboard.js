import _ from 'lodash'
import { createContainer } from 'meteor/react-meteor-data'
import React from 'react'
import { Button, Form, Grid, Header, List, Modal, Segment, TextArea, Divider } from 'semantic-ui-react'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import SubmissionFeedGET from '/client/imports/components/Education/SubmissionFeedGET'
import QLink from '/client/imports/routes/QLink'
import { Classrooms } from '/imports/schemas'
import ClassroomCreateNewModal from '/client/imports/components/Education/ClassroomCreateNewModal'
import UserBioCard from '/client/imports/components/Users/UserBioCard'

class TeacherDashboard extends React.Component {
  renderClassesList = () => {
    const { classrooms, currUser } = this.props

    const list = _.map(classrooms, classroom => {
      return (
        <List.Item key={classroom.name}>
          <List.Content>
            <QLink to={`/user/${currUser._id}/classroom/${classroom._id}`}>
              <List.Header>{classroom.name}</List.Header>
            </QLink>
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

  render() {
    const { currUser } = this.props,
      containerStyle = {
        overflowY: 'auto',
      },
      titleStyle = {
        fontSize: '2em',
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

    const listStyle = {
      overflowY: 'auto',
      maxHeight: '10em',
      minHeight: '10em',
    }

    return (
      <Grid columns={1} padded>
        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Header as="h1" content="Teacher Dashboard" style={headerStyle} />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row style={rowStyle}>
          <Grid.Column width={3} />
          <Grid.Column width={4}>
            <Segment raised color="blue" style={rowStyle}>
              <br />
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
            </Segment>
          </Grid.Column>
          <Grid.Column width={6}>
            <Segment raised color="green" style={rowStyle}>
              <div>
                <Header as="h2" content="Your Classrooms" />
                <div style={listStyle}>
                  <List relaxed content={this.renderClassesList()} />
                </div>
                <Divider />
                <ClassroomCreateNewModal {...this.props} />
              </div>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        {/* Come back to the submission feed in the future for teachers with multiple classrooms */}

        {/* <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Segment raised color="yellow">
              <Header as="h2" content="Submission Feed" />
              <SubmissionFeedGET />
            </Segment>
          </Grid.Column>
        </Grid.Row> */}

        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <UserBioCard {...this.props} user={currUser} canEdit />
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
