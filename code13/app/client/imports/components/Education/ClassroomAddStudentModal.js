import React from 'react'
import _ from 'lodash'
import { Button, Form, List, Modal, Divider } from 'semantic-ui-react'
import { showToast } from '/client/imports/modules'
import { withTracker } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import validate from '/imports/schemas/validate'

// Should be refactored to globals, shares same limit with ClassroomCreateNewModal
const MAX_USERS_TO_LOAD = 25

class ClassroomAddStudentModal extends React.Component {
  state = {
    isOpen: false,
    accordionIsOpen: false,
    studentIds: [],
    inviteStudentsQueue: [],
    errors: {},
    formData: { username: '', email: '' },
    submitButtonIsDisabled: false,
  }
  toggleIsOpen = () => {
    this.setState(prevState => {
      return { ...prevState, isOpen: !prevState.isOpen }
    })
  }

  handleAddStudentToInviteList = () => {
    const { inviteStudentsQueue, formData } = this.state

    // TODO: Clean this up so error handling is on a per-field basis.
    const alreadyInvited = _.find(inviteStudentsQueue, student => {
      return (
        student.username.toLowerCase() === formData.username.toLowerCase() ||
        formData.email.toLowerCase() === student.email.toLowerCase()
      )
    })

    if (alreadyInvited) {
      this.setState({ errors: { username: 'Student Already Invited', email: 'Student Already Invited' } })
      return
    }

    const newinviteStudentsQueue = [
      ...inviteStudentsQueue,
      { username: formData.username, email: formData.email },
    ]
    this.setState(prevState => {
      return { inviteStudentsQueue: newinviteStudentsQueue }
    })
    this.clearForm()
  }
  handleRemoveStudentFromInviteList = username => {
    const { inviteStudentsQueue } = this.state
    const newinviteStudentsQueue = _.filter(inviteStudentsQueue, student => {
      if (student.username === username) return false
      return true
    })

    console.log(newinviteStudentsQueue)
    this.setState({ inviteStudentsQueue: newinviteStudentsQueue })
  }

  renderInviteStudentsQueue = () => {
    const { inviteStudentsQueue } = this.state
    const returnList = _.map(inviteStudentsQueue, student => {
      return (
        <List.Item key={student.username + student.email}>
          <List.Icon
            name="x"
            color="red"
            onClick={() => this.handleRemoveStudentFromInviteList(student.username)}
          />
          <List.Content>
            <List.Header>{student.username}</List.Header>
            <List.Description>{student.email}</List.Description>
          </List.Content>
        </List.Item>
      )
    })

    if (returnList.length === 0) {
      return (
        <List.Item key={'No Students'}>
          <List.Icon name="student" />
          <List.Content>
            <List.Header>
              Fill out the form below and click "Add to List" to add a student to the list of students to
              invite to your classroom.
            </List.Header>
            <List.Description />
          </List.Content>
        </List.Item>
      )
    }
    return returnList
  }

  toggleSubmitButtonIsDisabled = override => {
    // if there is an override, just set it to that.
    if (typeof override === 'boolean') {
      this.setState({ submitButtonIsDisabled: override })
      return
    }

    // if the override is given a bad value or is empty, ignore it.
    this.setState(prevState => {
      return { submitButtonIsDisabled: prevState.submitButtonIsDisabled }
    })
  }

  handleInviteFormSubmit = () => {
    const { inviteStudentsQueue } = this.state
    const { classroomId } = this.props.params
    this.toggleSubmitButtonIsDisabled(true)

    const mappedStudents = _.map(inviteStudentsQueue, studentItem => {
      const errors = {
        email: validate.emailWithReason(studentItem.email),
        username: validate.usernameWithReason(studentItem.username),
      }
      if (_.some(errors)) {
        console.log('Invite Student Failed With Errors:', errors)
      }

      const { username, email } = studentItem
      // TODO: Fix error checking for one last go before we send the batch off to the server.

      return {
        username,
        emails: [{ address: email, verified: false }],
        profile: {
          name: username,
          institution: 'Academy of Interactive Entertainment',
        },
        permissions: [],
      }
    })

    Meteor.call('AccountsCreate.studentBatch', mappedStudents, (err, idArray) => {
      if (err) {
        showToast.error(err)
      } else {
        // TODO: Need to remove them from the list at this point.
        Meteor.call('Classroom.addStudentByList', classroomId, idArray, (err, success) => {
          if (err) {
            console.log(err)
            this.toggleSubmitButtonIsDisabled(false)
            this.clearData()
          } else {
            this.toggleSubmitButtonIsDisabled(false)
            this.clearData()
            this.toggleIsOpen()
          }
        })
      }
    })
  }

  renderUserList = () => {
    const { inviteStudentsQueue, errors, formData } = this.state

    return (
      <div>
        <List>{this.renderInviteStudentsQueue()}</List>
        {inviteStudentsQueue.length > 0 && <Divider />}
        <Form onChange={this.handleChange} onSubmit={this.handleAddStudentToInviteList}>
          <Form.Field required>
            <Form.Input
              label={errors.username || 'Username'}
              name="username"
              type="text"
              value={formData.username}
              error={!!errors.username}
              placeholder="Student's Login Username"
              onBlur={e => this.checkUserName(e)}
            />
          </Form.Field>
          <Form.Field required>
            <Form.Input
              label={errors.email || 'Email'}
              name="email"
              type="email"
              value={formData.email}
              error={!!errors.email}
              placeholder="Student's Email Address"
              onBlur={e => this.checkEmail(e)}
            />
          </Form.Field>

          <Form.Button type="submit" color="green">
            Add to List
          </Form.Button>
        </Form>
      </div>
    )
  }

  checkEmail = e => {
    const email = e.target.value

    // don't clear existing errors
    if (this.state.errors.email) return

    const reason = validate.emailWithReason(email)
    if (reason) {
      return this.setState({ errors: { ...this.state.errors, email: reason } })
    }

    Meteor.call('AccountsHelp.emailTaken', email, (err, response) => {
      if (err) return console.error(err)

      const message = response ? `'${email}' is taken` : null
      this.setState({ errors: { ...this.state.errors, email: message } })
    })
  }

  checkUserName = e => {
    const username = e.target.value

    // don't clear existing errors
    if (this.state.errors.username) return

    const reason = validate.usernameWithReason(username)
    if (reason) {
      return this.setState({ errors: { ...this.state.errors, username: reason } })
    }

    Meteor.call('AccountsHelp.userNameTaken', username, (err, response) => {
      if (err) return console.error(err)

      const message = response ? `'${username}' is taken` : null
      this.setState({ errors: { ...this.state.errors, username: message } })
    })
  }

  handleChange = e => {
    const { name, value } = e.target
    this.setState((prevState, props) => ({
      errors: {
        ...prevState.errors,
        // if a field had an error, provide continual validation
        [name]: prevState.errors[name] ? validate[name + 'WithReason'](value) : null,
      },
      formData: { ...prevState.formData, [name]: value },
    }))
  }

  clearData = () => {
    this.setState({
      studentIds: [],
      errors: {},
    })
    this.clearForm()
    this.clearQueue()
  }

  clearForm = () => {
    this.setState({ formData: { username: '', email: '' } })
  }

  clearQueue = () => {
    this.setState({ inviteStudentsQueue: [] })
  }

  handleSubmitStudent = event => {
    event.preventDefault()

    let { email, username, classroomId } = this.state.studentData

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
      this.setState({ errors })
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

  render() {
    const { isOpen, submitButtonIsDisabled, inviteStudentsQueue } = this.state
    return (
      <Modal
        open={isOpen}
        onClose={() => this.toggleIsOpen()}
        onOpen={() => this.toggleIsOpen()}
        trigger={<Button color="yellow" floated="right" icon="envelope" content="Enroll New Students" />}
      >
        <Modal.Header>Add Students</Modal.Header>
        <Modal.Content>{this.renderUserList()}</Modal.Content>
        <Modal.Actions>
          <Button
            color="green"
            icon="envelope"
            content="Invite Students"
            disabled={submitButtonIsDisabled || inviteStudentsQueue.length === 0}
            loading={submitButtonIsDisabled}
            onClick={this.handleInviteFormSubmit}
          />
          <Button
            color="red"
            onClick={() => {
              this.clearData()
              this.toggleIsOpen()
            }}
          >
            Close
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default withTracker(props => {
  // Handles all of the user subscription for this component.
  const handlerUsers = Meteor.subscribe('user', {}, { limit: MAX_USERS_TO_LOAD })
  const cursorUsers = Users.find({}, { fields: { username: 1, profile: 1 }, limit: MAX_USERS_TO_LOAD })
  const users = cursorUsers.fetch()

  return { ...props, users, userListReady: users && handlerUsers.ready() }
})(ClassroomAddStudentModal)
