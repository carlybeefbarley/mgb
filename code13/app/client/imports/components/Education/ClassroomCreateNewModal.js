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

// Default number of users to find in HOC. Prevents loading a very large number of users.
// This should probably be a global setting somewhere.
const MAX_USERS_TO_LOAD = 25

class ClassroomCreateNewModal extends React.Component {
  state = {
    searchIsFocus: false,
    isOpen: false,
    accordionIsOpen: false,
    filterString: '',
    formData: { studentIds: [] },
  }

  handleAddStudent = (id, username) => {
    this.setState(prevState => {
      const prevStudentIds = prevState.formData.studentIds
      const studentIds = _.union(prevStudentIds, [id])
      return { formData: { ...prevState.formData, studentIds } }
    })
  }

  handleRemoveStudent = (id, username) => {
    this.setState(prevState => {
      const prevStudentIds = prevState.formData.studentIds
      const studentIds = _.pull(prevStudentIds, id)
      console.log('Removed IDs:', studentIds)
      return { formData: { ...prevState.formData, studentIds } }
    })
  }

  renderUserList = () => {
    // const listStyle = { maxHeight: '25vh', overflowY: 'auto' } // So the list of users isn't massive and cause full page scrolling.
    const { location } = this.props

    return (
      <Accordion>
        <Accordion.Title active={this.state.accordionIsOpen} index={0} onClick={this.handleAccordionClick}>
          <Icon name="dropdown" />
          Manage Students
        </Accordion.Title>
        <Accordion.Content active={this.state.accordionIsOpen}>
          <Divider horizontal content="Add Students" />
          <UserListRoute
            location={{ ...location, query: { ...location.query, limit: 13 } }}
            handleClickUser={this.handleAddStudent}
            renderVertical
            excludeUserIdsArray={this.state.formData.studentIds}
          />
          <Divider horizontal content="Remove Students" />
          {this.renderStudentsSelected()}
        </Accordion.Content>
      </Accordion>
    )
  }

  renderStudentsSelected = () => {
    const { studentIds } = this.state.formData
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

  setSearchFocusStatus = (event, value) => {
    event.stopPropagation()
    this.setState({ searchIsFocus: value })
  }

  handleAccordionClick = () => {
    this.setState(prevState => {
      return { ...prevState, accordionIsOpen: !prevState.accordionIsOpen }
    })
  }
  getFormData = event => {
    const field = event.target.name,
      value = event.target.value

    this.setState((prevState, props) => {
      return { formData: { ...prevState.formData, [field]: value } }
    })
  }

  toggleIsOpen = () => {
    this.setState(prevState => {
      return { ...prevState, isOpen: !prevState.isOpen }
    })
  }

  handleKeyDown = event => {
    event.stopPropagation()
    const { searchIsFocus } = this.state
    if (event.key === 'Enter' && !searchIsFocus) {
      this.handleSubmit()
    }
  }

  handleSubmit = () => {
    const { formData } = this.state
    Meteor.call(
      'Classroom.create',
      formData.name,
      formData.description,
      [], // TODO: Don't add any teachers to this classroom because we dont support that yet.
      formData.studentIds,
      (err, succubus) => {
        if (err) {
          showToast.error(`Failed to create new classroom: ${err.message}`)
          throw new Meteor.Error(`Failed to create classroom "${formData.name}": `, err)
        } else {
          this.toggleIsOpen()
          this.setState({ formData: { studentIds: [], name: '', description: '' } })
          showToast.success(`Successfuly created a new classroom! Classroom: "${formData.name}"`)
        }
      },
    )
  }

  render() {
    const { location } = this.props
    const { isOpen } = this.state
    return (
      <Modal
        open={isOpen}
        onClose={() => this.toggleIsOpen()}
        onOpen={() => this.toggleIsOpen()}
        trigger={<Button color="green" floated="right" icon="plus" content="Create New Classroom" />}
      >
        <Modal.Header>Create New Classroom</Modal.Header>
        <Modal.Content>
          <p>
            This will create a new classroom. After creating the classroom, you will be able to invite
            students to join the classroom and also create assignments for the students
          </p>
          <Form
            onKeyDown={e => this.handleKeyDown(e)}
            onChange={e => {
              this.getFormData(e)
            }}
          >
            <Form.Field required>
              <label>Name</label>
              <input
                name="name"
                type="text"
                placeholder="Classroom Name"
                onBlur={e => this.setSearchFocusStatus(e, true)}
                onFocus={e => this.setSearchFocusStatus(e, false)}
              />
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <input
                name="description"
                type="text"
                placeholder="Brief Description of Classroom"
                onBlur={e => this.setSearchFocusStatus(e, true)}
                onFocus={e => this.setSearchFocusStatus(e, false)}
              />
            </Form.Field>
            {/* {userListReady && <UserList users={users} />} */}
            {/* {this.renderUserList()} Functionality removed to simplify classroom creation. */}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button icon color="red" floated="right" labelPosition="right" onClick={() => this.toggleIsOpen()}>
            Close
            <Icon name="x" />
          </Button>
          <Button color="green" floated="right" onClick={() => this.handleSubmit()}>
            Create
          </Button>
          <Divider hidden />
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
}, ClassroomCreateNewModal)
