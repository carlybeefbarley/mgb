import React from 'react'
import {
  Container,
  Divider,
  Button,
  Icon,
  Card,
  Image,
  Grid,
  Header,
  Segment,
  Tab,
  List,
  Input,
  TextArea,
  Table,
} from 'semantic-ui-react'
import Footer from '/client/imports/components/Footer/Footer'
import PropTypes from 'prop-types'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import SkillAction from '/client/imports/components/Dashboard/Actions/SkillAction'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'
import HeroLayout from '/client/imports/layouts/HeroLayout'
import QLink from '/client/imports/routes/QLink'
import UX from '/client/imports/UX'
import HoverImage from 'react-hover-image'
import UserBioCard from '/client/imports/components/Users/UserBioCard'
import { createContainer } from 'meteor/react-meteor-data'
import { teacherRole, isUserTeacher } from '/imports/schemas/roles'
import { Users } from '/imports/schemas'

class StudentProfile extends React.Component {
  render() {
    const { currUser, canEdit, user } = this.props

    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = user && user.profile

    const TeacherNameStyle = {
      fontSize: '2.3em',
      textAlign: 'center',
    }

    const SchoolNameStyle = {
      fontSize: '1.3em',
      textAlign: 'center',
    }

    const ChatFontStyle = {
      textAlign: 'center',
      fontSize: '1.3em',
    }

    const ParagraphStyle = {
      fontSize: '1.1em',
    }
    return (
      <div style={containerStyle}>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <List>
                  <List.Item>
                    <List.Content style={TeacherNameStyle}>{user && user.username}</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content style={SchoolNameStyle}>Classname</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content style={SchoolNameStyle}>AIE</List.Content>
                  </List.Item>
                </List>

                {/* Change avatar for classroom later  */}
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={false}
                />
                <List>
                  <List.Item>
                    <List.Content style={ChatFontStyle}>
                      {/* <List.Icon name="chat" color="blue" />Student Chat */}
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>

            <Grid.Column width={11}>
              <UserBioCard {...this.props} canEdit={canEdit} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={16}>
              <Segment raised color="yellow">
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

class TeacherProfile extends React.Component {
  render() {
    const { currUser, canEdit, user } = this.props
    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = user && user.profile

    const TeacherNameStyle = {
      fontSize: '2.6em',
      textAlign: 'center',
    }

    const SchoolNameStyle = {
      fontSize: '1.6em',
      textAlign: 'center',
    }

    const ChatFontStyle = {
      textAlign: 'center',
      fontSize: '1.6em',
    }

    const ParagraphStyle = {
      fontSize: '1.05em',
    }

    return (
      <div style={containerStyle}>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <List>
                  <List.Item>
                    <List.Content style={TeacherNameStyle}>{user && user.username}</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content style={SchoolNameStyle}>AIE</List.Content>
                  </List.Item>
                </List>

                {/* Change avatar for classroom later  */}
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={false}
                />
                <List>
                  <List.Item>
                    <List.Content style={ChatFontStyle}>
                      {/* <List.Icon name="chat" color="blue" />Teacher Chat */}
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column width={11}>
              <UserBioCard {...this.props} canEdit={canEdit} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={16}>
              <Segment raised color="yellow">
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

class EducationProfileRoute extends React.Component {
  render() {
    const { isTeacher } = this.props
    return isTeacher ? <TeacherProfile {...this.props} /> : <StudentProfile {...this.props} />
  }
}

export default createContainer(props => {
  const handleForUsers = Meteor.subscribe('user.byName', props.params.username)
  const user = Users.findOne({ username: props.params.username })
  const isTeacher = isUserTeacher(props.currUser)
  const canEdit = props && props.currUser && user && user._id === props.currUser._id
  return { ...props, isTeacher, user, canEdit }
}, EducationProfileRoute)
