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

// Should be refactored to globals, shares same limit with ClassroomCreateNewModal
const MAX_USERS_TO_LOAD = 25

class ClassroomAddStudentModal extends React.Component {
  state = {
    isOpen: false,
    accordionIsOpen: false,
    studentIds: [],
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

  renderUserList = () => {
    // const listStyle = { maxHeight: '25vh', overflowY: 'auto' } // So the list of users isn't massive and cause full page scrolling.
    const { location } = this.props

    return (
      <div>
        <UserListRoute
          location={{ ...location, query: { ...location.query, limit: 13 } }}
          handleClickUser={this.handleAddStudent}
          renderVertical
          excludeUserIdsArray={this.state.studentIds}
        />
        {this.state.studentIds.length > 0 && <Divider />}
        {this.renderStudentsSelected()}
        <Divider horizontal content="Invite New Student to Class" />
        <Form>
          <Form.Field>
            <label>Email</label>
            <input name="email" type="email" placeholder="Student's email address" />
          </Form.Field>
          <Form.Button type="submit" color="green">
            Invite
          </Form.Button>
        </Form>
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
    console.log(studentObjects)
    return <UserList users={studentObjects} handleClickUser={this.handleRemoveStudent} narrowItem />
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
