import React, { Component } from 'react'
import _ from 'lodash'
import HeroLayout from '/client/imports/layouts/HeroLayout'
import validate from '/imports/schemas/validate'
import { Container, Grid, Header, Segment, Form, Divider, Message, Image, Button } from 'semantic-ui-react'
import LoginLinks from '../Users/LoginLinks'
import Recaptcha from '/client/imports/components/Recaptcha/Recaptcha'

const mascotColumnStyle = {
  // allow click through, so users can play with the particles
  pointerEvents: 'none',
}

const salutations = [
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
  roles: ['teacher'],
}

export default class DevPanelRoute extends Component {
  state = {
    errors: { teacher: {}, student: {} },
    formDataTeacher: { salutation: 0 },
    formDataStudent: {},
    isLoading: false,
    isRecaptchaComplete: false,
    salutationIndex: 0,
  }

  handleSubmitTeacher = () => {
    event.preventDefault()
    let { email, username } = this.state.formDataTeacher
    const { salutationIndex } = this.state
    const teacherErrors = this.state.errors.teacher
    const studentErrors = this.state.errors.student
    const salutation = salutations[salutationIndex].text

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
        salutation,
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

  handleSubmitStudent = () => {
    event.preventDefault()
    let { email, username } = this.state.formDataStudent
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

    let enrollId = Meteor.call('AccountsCreate.teacher', data)
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

  handleSetPermissions = e => {
    Meteor.call('Users.setPermissions', { _id: 'mGeXxx6is7zKhXgnL' }, teacherPermissions)
  }

  handleSelect = event => {
    const salutationIndex = _.find(salutations, { text: event.target.innerText })

    if (salutationIndex !== undefined) {
      this.setState({ salutationIndex: salutationIndex.value })
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
                          label={'Salutation'}
                          name="salutation"
                          value={this.state.salutationIndex}
                          options={salutations}
                          onChange={e => this.handleSelect(e)}
                        />
                        <Form.Input
                          error={!!errors.teacher.username}
                          icon="user"
                          label={errors.teacher.username || 'Username (used for profile)'}
                          name="username"
                          onBlur={this.checkUserName}
                          placeholder={`${salutations[this.state.salutationIndex].text} Woodstock`}
                        />
                        <Button
                          fluid
                          primary
                          content="Set Permissions"
                          onClick={e => {
                            this.handleSetPermissions(e)
                          }}
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
                        onSubmit={() => this.handleSubmitStudent()}
                        loading={isLoading}
                      >
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
                          placeholder={`${salutations[this.state.salutationIndex].text} Woodstock`}
                        />
                        <Button
                          fluid
                          primary
                          content="Set Permissions"
                          onClick={e => {
                            this.handleSetPermissions(e)
                          }}
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
