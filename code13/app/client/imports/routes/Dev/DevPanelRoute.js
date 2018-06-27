import React, { Component } from 'react'
import _ from 'lodash'
import HeroLayout from '/client/imports/layouts/HeroLayout'
import validate from '/imports/schemas/validate'
import { Container, Grid, Header, Segment, Form, Divider, Message, Image, Button } from 'semantic-ui-react'
import LoginLinks from '../Users/LoginLinks'
import Recaptcha from '/client/imports/components/Recaptcha/Recaptcha'
import { roleTeacher } from '/imports/schemas/roles'
import { Classrooms } from '/imports/schemas'
import { createContainer } from 'meteor/react-meteor-data'
import { showToast } from '/client/imports/modules'

const mascotColumnStyle = {
  // allow click through, so users can play with the particles
  pointerEvents: 'none',
}

const title = [
  { key: 0, text: 'Mr.', value: 0 },
  { key: 1, text: 'Mrs.', value: 1 },
  { key: 2, text: 'Ms.', value: 2 },
  { key: 3, text: 'Dr.', value: 3 },
  { key: 4, text: 'Prof.', value: 4 },
  { key: 5, text: 'A.H.', value: 5 },
]

const teacherPermissions = {
  teamId: 'teachers',
  teamName: 'teachers',
  roles: [roleTeacher],
}

export default class DevPanelRoute extends Component {
  state = {
    errors: { teacher: {}, student: {} },
    formDataTeacher: { title: 0 },
    formDataStudent: {},
    isLoading: false,
    isRecaptchaComplete: false,
    titleIndex: 0,
  }

  subClassroom = (classroomId, userId) => {
    Meteor.call('Classroom.addStudent', classroomId, userId)
  }

  updateClass = (classroomId, userId) => {
    const result = Classrooms.update({ _id: classroomId }, { $addToSet: userId })
    console.log(result)
  }

  handleSubmitTeacher = () => {
    event.preventDefault()
    let { email, username } = this.state.formDataTeacher
    const { titleIndex } = this.state
    const teacherErrors = this.state.errors.teacher
    const studentErrors = this.state.errors.student
    const title = title[titleIndex].text

    const errors = {
      email: validate.emailWithReason(email),
      username: validate.usernameWithReason(username),
    }

    let data = {
      username,
      emails: [{ address: email, verified: false }],
      profile: {
        name: username,
        institution: 'Academy of Interactive Entertainment',
        title,
      },
      permissions: [teacherPermissions],
    }

    if (_.some(errors)) {
      this.setState({ errors: { teacher: errors, student: studentErrors } })
      return
    }

    console.log('Creating account with: ', data)

    let enrollId = Meteor.call('AccountsCreate.teacher', data)
    console.log('Returned ID is :', enrollId)
  }

  handleSubmitStudent = event => {
    event.preventDefault()
    let { email, username, classroomId } = this.state.formDataStudent
    const teacherErrors = this.state.errors.teacher
    const studentErrors = this.state.errors.student

    const errors = {
      email: validate.emailWithReason(email),
      username: validate.usernameWithReason(username),
    }

    let data = {
      username,
      emails: [{ address: email, verified: false }],
      profile: {
        name: username,
        institution: 'Academy of Interactive Entertainment',
      },
      permissions: [],
    }

    if (_.some(errors)) {
      this.setState({ errors: { teacher: teacherErrors, student: studentErrors } })
      return
    }

    console.log('Creating account with: ', data)

    let enrollId = Meteor.call('AccountsCreate.student', data, (error, result) => {
      if (error) {
        console.log('AccountsCreate.teacher failed with', error)
        showToast.error(error)
      } else {
        this.subClassroom(classroomId, result)
        console.log(result)
        showToast('Account Created Successfully')
        return result
      }
    })

    console.log('Returned ID is :', enrollId)
  }

  handleChangeTeacher = e => {
    const { name, value } = e.target
    console.dir(e.target.value)
    if (value) {
      this.setState((prevState, props) => {
        return {
          formDataTeacher: {
            ...prevState.formDataTeacher,
            [name]: value,
          },
        }
      })
    }
  }

  handleStudentChange = e => {
    const { name, value } = e.target
    console.dir(e.target.value)
    if (value) {
      this.setState((prevState, props) => {
        return {
          formDataStudent: {
            ...prevState.formDataStudent,
            [name]: value,
          },
        }
      })
    }
  }

  handleSetClassroom = () => classroomId => {
    Meteor.update()
  }

  handleSelect = event => {
    const titleIndex = _.find(title, { text: event.target.innerText })

    if (titleIndex !== undefined) {
      this.setState({ titleIndex: titleIndex.value })
    }
  }

  handleRecaptchaComplete = () => {
    return true
  }

  render() {
    const { isLoading, errors, formDataTeacher, isRecaptchaComplete } = this.state
    const { currUser } = this.props

    let renderItem

    if (true) {
      renderItem = (
        <HeroLayout
          heroContent={
            <Segment>
              <Header color="red">FOR DEVELOPMENT ONLY</Header>
              <Divider />
              <Container text>
                <Grid padded columns="equal" verticalAlign="middle">
                  <Grid.Column>
                    <Header as="h2" content="Sign Up Invite - Teacher" />
                    <Segment stacked>
                      <Form
                        onChange={this.handleChangeTeacher}
                        onSubmit={() => this.handleSubmitTeacher()}
                        loading={isLoading}
                      >
                        <Form.Input
                          error={!!errors.teacher.email}
                          icon="envelope"
                          label={errors.teacher.email || 'Email'}
                          name="email"
                          onBlur={this.checkEmail}
                          placeholder="c.woodstock@CCH.edu"
                          type="email"
                        />
                        <Form.Select
                          label={'Title'}
                          name="title"
                          value={this.state.titleIndex}
                          options={title}
                          onChange={e => this.handleSelect(e)}
                        />
                        <Form.Input
                          error={!!errors.teacher.username}
                          icon="user"
                          label={errors.teacher.username || 'Username (used for profile)'}
                          name="username"
                          onBlur={this.checkUserName}
                          placeholder={`${title[this.state.titleIndex].text} Woodstock`}
                        />
                        <Button
                          fluid
                          color="red"
                          content="Send Enrollment Email"
                          onClick={() => {
                            this.handleSubmitTeacher()
                          }}
                        />
                      </Form>
                    </Segment>
                    {errors.teacher.server && <Message error content={errors.teacher.server} />}
                    {!currUser && <LoginLinks showLogin />}
                  </Grid.Column>
                  <Grid.Column width={8} only="tablet computer" style={mascotColumnStyle}>
                    <Divider hidden section />
                    <Image src="/images/mascots/team.png" />
                  </Grid.Column>
                </Grid>
                <Divider /> {/************** STUDENT STUFF BELOW *****************/}
                <Grid padded columns="equal" verticalAlign="middle">
                  <Grid.Column>
                    <Header as="h2" content="Sign Up - Student (Testing only)" />
                    <Segment stacked>
                      <Form
                        onChange={this.handleStudentChange}
                        onSubmit={event => this.handleSubmitStudent(event)}
                        loading={isLoading}
                      >
                        <Form.Input
                          icon="student"
                          label="CLASSROOM_ID"
                          name="classroomId"
                          placeholder="Id of classroom to attach student"
                        />
                        <Form.Input
                          error={!!errors.email}
                          icon="envelope"
                          label={errors.student.email || 'Email'}
                          name="email"
                          onBlur={this.checkEmail}
                          placeholder="c.woodstock@CCH.edu"
                          type="email"
                        />
                        <Form.Input
                          error={!!errors.student.username}
                          icon="user"
                          label={errors.student.username || 'Username (used for profile)'}
                          name="username"
                          onBlur={this.checkUserName}
                          placeholder={`${title[this.state.titleIndex].text} Woodstock`}
                        />
                        <Button
                          fluid
                          color="red"
                          content="Enroll Student"
                          onClick={() => {
                            this.handleSubmitStudent()
                          }}
                        />
                      </Form>
                    </Segment>
                    {errors.student.server && <Message error content={errors.student.server} />}
                    {!currUser && <LoginLinks showLogin />}
                  </Grid.Column>
                  <Grid.Column width={8} only="tablet computer" style={mascotColumnStyle}>
                    <Divider hidden section />
                    {/* <Image src="/images/mascots/team.png" /> */}
                  </Grid.Column>
                </Grid>
              </Container>
            </Segment>
          }
        />
      )
    } else {
      renderItem = <div style={{ color: 'red' }}> YOU ARE NOT WELCOME HERE </div>
    }
    return renderItem
  }
}
