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
  Step,
} from 'semantic-ui-react'
import { showToast } from '/client/imports/modules'
import UserList from '/client/imports/components/Users/UserList'
import UserListRoute from '/client/imports/routes/Users/UserListRoute'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import validate from '/imports/schemas/validate'
import EditAssignment from '/client/imports/components/Assets/EditAssignment/EditAssignment'

export default class ClassroomAddAssignmentModal extends React.Component {
  render() {
    return (
      <Modal
        trigger={
          <Button color="orange" floated="right">
            Create Assignment
          </Button>
        }
      >
        <Modal.Header>Create a New Assignment</Modal.Header>
        <Modal.Content>Stuff</Modal.Content>
        <Modal.Actions>
          <Button color="green">Accept</Button>
          <Button color="red">Cancel</Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
