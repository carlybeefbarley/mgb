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
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'

const MAX_USERS_TO_LOAD = 10 // Default number of users to find in HOC. Prevents loading a very large number of users.
class CreateClassroomModal extends React.Component {
  state = { isOpen: false, accordionIsOpen: false, filterString: '' }

  renderUserList = () => {
    const { users } = this.props
    const { filterString } = this.state
    const usersList = _.filter(users, user => {
      return user.username.includes(filterString)
    })
    const usersListElements = _.map(usersList, user => {
      return (
        <List.Item key={user._id}>
          <List.Content>
            <Form.Checkbox
              label={user.username}
              name={user._id}
              onChange={(e, data) => this.getFormData({ target: { name: data.name, value: data.checked } })}
              // Yeah Yeah I know, don't do that. I just need it to work, I never said anything
              // about it being pretty.
              // TODO: Less bad code here
            />
          </List.Content>
        </List.Item>
      )
    })

    return (
      <Accordion>
        <Accordion.Title active={this.state.accordionIsOpen} index={0} onClick={this.handleAccordionClick}>
          <Icon name="dropdown" />
          Add Students
        </Accordion.Title>
        <Accordion.Content active={this.state.accordionIsOpen}>
          <Input
            onChange={e => {
              e.persist()
              this.handleFilterUsers(e)
            }}
          />
          <Divider />
          <List divided horizontal>
            {(usersListElements.length && usersListElements) || <Segment> No Users Found </Segment>}
          </List>
        </Accordion.Content>
      </Accordion>
    )
  }

  handleFilterUsers = e => {
    this.setState(prevState => {
      return { ...prevState, filterString: e.target.value }
    })
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
    if (event.key === 'Enter') {
      this.handleSubmit()
    }
  }

  handleSubmit = () => {
    const { formData } = this.state
    Meteor.call('Classroom.create', formData.name, formData.description, (err, succubus) => {
      if (err) {
        showToast.error(`Failed to create new classroom: ${err.message}`)
        throw new Meteor.Error(`Failed to create classroom "${formData.name}": `, err)
      } else {
        this.toggleIsOpen()
        showToast.success(`Successfuly created a new classroom! Classroom: "${formData.name}"`)
      }
    })
  }

  render() {
    const { isOpen } = this.state
    const { location, users, userListReady } = this.props
    return (
      <Modal
        open={isOpen}
        onClose={() => this.toggleIsOpen()}
        onOpen={() => this.toggleIsOpen()}
        trigger={
          <Button color="orange" floated="right">
            Add New Class
          </Button>
        }
      >
        <Modal.Header>Add A Classroom</Modal.Header>
        <Modal.Content>
          <Form
            onKeyDown={e => this.handleKeyDown(e)}
            onChange={e => {
              this.getFormData(e)
            }}
          >
            <Form.Field required>
              <label>Name</label>
              <input name="name" type="text" placeholder="Classroom Name" />
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <input name="description" type="text" placeholder="Brief Description of Classroom" />
            </Form.Field>
            {/* {userListReady && <UserList users={users} />} */}
            {this.renderUserList()}
          </Form>
          <Divider />
        </Modal.Content>
        <Modal.Actions>
          <Button icon color="red" floated="right" labelPosition="right" onClick={() => this.toggleIsOpen()}>
            Close
            <Icon name="x" />
          </Button>
          <Button color="green" floated="right" onClick={() => this.handleSubmit()}>
            Create
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default createContainer(props => {
  const handler = Meteor.subscribe('user', {})
  const cursor = Users.find({}, { fields: { username: 1, profile: 1 }, limit: MAX_USERS_TO_LOAD })
  const users = cursor.fetch()

  return { ...props, users, userListReady: users && handler.ready() }
}, CreateClassroomModal)
