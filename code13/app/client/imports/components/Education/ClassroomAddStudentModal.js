import React from 'react'
import _ from 'lodash'
import {
  Button,
  Form,
  Grid,
  Header,
  List,
  Modal,
  Icon,
  Accordion,
  Divider,
  Input,
  Segment,
} from 'semantic-ui-react'
import { showToast } from '/client/imports/modules'
import UserList from '/client/imports/components/Users/UserList'
import UserListRoute from '/client/imports/routes/Users/UserListRoute'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import validate from '/imports/schemas/validate'

// Should be refactored to globals, shares same limit with ClassroomCreateNewModal
const MAX_USERS_TO_LOAD = 25

class ClassroomAddStudentModal extends React.Component {
  state = {
    isOpen: false,
    accordionIsOpen: false,
    studentIds: [],
    inviteStudentsQueue: [{ username: 'PH - User Name', email: 'PH@email.com' }],
    errors: {},
    formData: { username: '', email: '' },
  }
  toggleIsOpen = () => {
    this.setState(prevState => {
      return { ...prevState, isOpen: !prevState.isOpen }
    })
  }

  handleAddStudent = (id, username) => {
    this.setState(prevState => {
      const prevStudentIds = prevState.studentIds
      const studentIds = _.union(prevStudentIds, [id])
      return { ...prevState, studentIds }
    })
  }

  handleRemoveStudent = (id, username) => {
    this.setState(prevState => {
      const prevStudentIds = prevState.studentIds
      const studentIds = _.pull(prevStudentIds, id)
      console.log('Removed IDs:', studentIds)
      return { ...prevState, studentIds }
    })
  }

  handleAddStudentToInviteList = () => {
    const { inviteStudentsQueue, formData } = this.state

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
    return returnList
  }

  handleInviteFormSubmit = () => {
    const { inviteStudentsQueue } = this.state

    const mappedStudents = _.map(inviteStudentsQueue, studentItem => {
      // if (_.some(errors)) {
      //   console.log('Invite Student Failed With Errors:', errors)
      //   return
      // }
      const { username, email } = studentItem
      // TODO: Fix error checking for one last go before we send the batch off to the server.
      const errors = {
        email: validate.emailWithReason(email),
        username: validate.usernameWithReason(username),
      }

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
        _.forEach(idArray, id => {
          Meteor.call('Classroom.addStudent', id)
        })
      }
    })
  }

  handleAccordionClick = () => {
    this.setState(prevState => {
      return { ...prevState, accordionIsOpen: !prevState.accordionIsOpen }
    })
  }

  renderUserList = () => {
    // const listStyle = { maxHeight: '25vh', overflowY: 'auto' } // So the list of users isn't massive and cause full page scrolling.
    const { location } = this.props
    const classroomStudentIds = this.props.classroom.studentIds
    const { inviteStudentsQueue, studentIds, errors, accordionIsOpen, formData } = this.state

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
            Invite
          </Form.Button>
        </Form>
        <Divider />
        <Accordion>
          <Accordion.Title active={accordionIsOpen} onClick={(e, data) => this.handleAccordionClick(e, data)}>
            <Icon name="dropdown" />
            Add Existing Users
          </Accordion.Title>
          <Accordion.Content active={accordionIsOpen}>
            <UserListRoute
              location={{ ...location, query: { ...location.query, limit: 13 } }}
              handleClickUser={this.handleAddStudent}
              renderVertical
              excludeUserIdsArray={studentIds}
            />
            {studentIds.length > 0 && <Divider />}
            {this.renderStudentsSelected()}
          </Accordion.Content>
        </Accordion>
      </div>
    )
  }

  renderStudentsSelected = () => {
    const { studentIds } = this.state
    const { users } = this.props
    const studentObjects = _.compact(
      _.map(users, student => {
        if (studentIds.includes(student._id)) return student
        return null
      }),
    )
    return <UserList users={studentObjects} handleClickUser={this.handleRemoveStudent} narrowItem />
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
    const { isOpen } = this.state
    return (
      <Modal
        open={isOpen}
        onClose={() => this.toggleIsOpen()}
        onOpen={() => this.toggleIsOpen()}
        trigger={
          <Button color="green" floated="right">
            Add New Student
          </Button>
        }
      >
        <Modal.Header>Add Student</Modal.Header>
        <Modal.Content>{this.renderUserList()}</Modal.Content>
        <Modal.Actions>
          <Button color="green" onClick={this.handleInviteFormSubmit}>
            Confirm
          </Button>
          <Button color="red">Cancel</Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default createContainer(props => {
  // Handles all of the user subscription for this component.
  const handlerUsers = Meteor.subscribe('user', {}, { limit: MAX_USERS_TO_LOAD })
  const cursorUsers = Users.find({}, { fields: { username: 1, profile: 1 }, limit: MAX_USERS_TO_LOAD })
  const users = cursorUsers.fetch()

  return { ...props, users, userListReady: users && handlerUsers.ready() }
}, ClassroomAddStudentModal)
