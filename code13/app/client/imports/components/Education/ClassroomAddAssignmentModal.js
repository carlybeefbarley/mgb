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
import AssetPathDetail from '/client/imports/components/Assets/AssetPathDetail'
import Spinner from '/client/imports/components/Nav/Spinner'
import { Azzets } from '/imports/schemas'
export default class ClassroomAddAssignmentModal extends React.Component {
  state = { awaitingAsset: true, assignmentHandler: null }
  defaultAsset = {
    name: `Assignment ${Math.random()
      .toString(36)
      .substring(7)}`,
    ownerId: Meteor.user()._id,
    kind: 'assignment',
    isCompleted: false,
    isDeleted: false,
    isPrivate: false,
  }

  createNewAssignment = () => {
    const defaultAsset = this.defaultAsset
    Meteor.call('Azzets.create', defaultAsset, (err, success) => {
      if (err) {
        console.log(err)
      } else {
        this.loadAsset(success)
      }
    })
    // Need to generate a new name every time you create an asset so future re-openings
    // dont create an asset with the same name.
    this.defaultAsset.name = `Assignment ${Math.random()
      .toString(36)
      .substring(7)}`
  }

  loadAsset = assetId => {
    const assignmentHandler = Meteor.subscribe('assets.public.byId', assetId, () => {
      const assignmentAsset = Azzets.findOne({ _id: assetId })
      this.setState({ assignmentHandler, assignmentAsset, awaitingAsset: false })
    })
  }

  reloadAsset = () => {
    const assetId = this.state.assignmentAsset._id
    const updatedAsset = Azzets.findOne({ _id: assetId })
    this.setState({ assignmentAsset: updatedAsset })
  }

  stopHandler = () => {
    const { assignmentHandler } = this.state
    if (assignmentHandler) {
      assignmentHandler.stop()
    }
  }

  closeModal = () => {
    this.stopHandler()
    this.setState({ awaitingAsset: true, assignmentHandler: null, assignmentAsset: null })
  }

  handleChange = data => {
    const { assignmentAsset } = this.state

    Meteor.call('Azzets.update', assignmentAsset._id, true, data, (err, success) => {
      if (err) {
      } else {
        this.reloadAsset()
      }
    })
  }

  handleNameChange = name => {
    this.handleChange({ name })
  }

  handleDescriptionChange = description => {
    this.handleChange({ metadata: { assignmentDetail: description } })
  }

  handleTextChange = description => {
    this.handleChange({ text: description })
  }

  handleMetadataChange = metadata => {
    this.handleChange({ metadata })
  }

  render() {
    const { awaitingAsset, assignmentAsset } = this.state
    const currUser = Meteor.user()

    return (
      <Modal
        onClose={this.closeModal}
        trigger={
          <Button color="orange" floated="right" onClick={this.createNewAssignment}>
            Create Assignment
          </Button>
        }
      >
        <Modal.Header>Create a New Assignment</Modal.Header>
        <Modal.Content>
          {awaitingAsset ? (
            <Spinner />
          ) : (
            <Segment>
              <AssetPathDetail
                canEdit
                ownerName={assignmentAsset.dn_ownerName}
                kind={assignmentAsset.kind}
                name={assignmentAsset.name}
                handleNameChange={this.handleNameChange}
                handleDescriptionChange={this.handleTextChange}
              />
              <Divider hidden />
              <EditAssignment
                asset={assignmentAsset}
                canEdit
                currUser={currUser}
                handleMetadataChange={this.handleMetadataChange}
              />
            </Segment>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button color="green">Accept</Button>
          <Button color="red">Cancel</Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
