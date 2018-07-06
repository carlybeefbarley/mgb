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
import PropTypes from 'prop-types'
export default class ClassroomAddAssignmentModal extends React.Component {
  static PropTypes = {
    classroom: PropTypes.object.isRequired,
  }
  state = {
    awaitingAsset: true,
    assignmentHandler: null,
    isOpen: false,
    disableAcceptButton: false,
    assignmentAsset: null,
  }
  defaultAsset = {
    name: `New Classroom Assignment`,
    ownerId: Meteor.user()._id,
    dn_ownerName: Meteor.user().username,
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
    this.setState({ isOpen: true })
    // Assignment assets are created with the same name upon opening the assignment modal.
    // This will cause repeated re-openings to create many assets with the same name.
    this.defaultAsset.name = `New Classroom Assignment`
    // ${Math.random()
    //  .toString(36)
    //  .substring(7)}`
  }

  componentWillUnmount() {
    // if you navigate away or remove this modal from the dom in any way the assignment should be purged.
    this.onCancel()
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
    this.setState({ awaitingAsset: true, assignmentHandler: null, assignmentAsset: null, isOpen: false })
  }

  onCancel = () => {
    this.closeModal()
    this.deleteAssignment()
  }

  deleteAssignment = () => {
    this.handleChange({ isDeleted: true })
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

  handleAssignToClassroom = () => {
    const { classroom } = this.props
    const { assignmentAsset } = this.state
    this.setState({ disableAcceptButton: true })
    Meteor.call('Classroom.addAssignmentAsset', classroom._id, assignmentAsset._id, (err, success) => {
      if (err) {
        console.log('Failed to add assignment to classroom: ', err.reason)
      } else {
        this.setState({ disableAcceptButton: false })
        this.closeModal()
      }
    })
  }

  assignmentHasDefaultName = () => {
    const { assignmentAsset, awaitingAsset } = this.state
    if (awaitingAsset) return true
    const assetName = assignmentAsset.name

    if (assetName === this.defaultAsset.name) {
      return true
    } else {
      return false
    }
  }

  render() {
    const { awaitingAsset, assignmentAsset, disableAcceptButton, isOpen } = this.state
    const currUser = Meteor.user()
    const isDefaultName = this.assignmentHasDefaultName()

    return (
      <Modal
        closeOnDimmerClick={false}
        closeOnEscape={false}
        onClose={this.closeModal}
        open={isOpen}
        trigger={
          <Button
            color="green"
            icon="pencil"
            content="Create New Assignment"
            floated="right"
            onClick={this.createNewAssignment}
          />
        }
      >
        <Modal.Header>Create a New Assignment</Modal.Header>
        <Modal.Content>
          {awaitingAsset ? (
            <Spinner />
          ) : (
            <Segment>
              <Segment color={isDefaultName ? 'red' : ''}>
                {isDefaultName ? (
                  <span style={{ color: 'red' }}>You must change this assignment's name to save it.</span>
                ) : (
                  ''
                )}
                <Divider hidden />
                <AssetPathDetail
                  canEdit
                  ownerName={assignmentAsset.dn_ownerName}
                  kind={assignmentAsset.kind}
                  name={assignmentAsset.name}
                  handleNameChange={this.handleNameChange}
                  handleDescriptionChange={this.handleTextChange}
                />
              </Segment>
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
          <Button
            color="green"
            onClick={this.handleAssignToClassroom}
            disabled={disableAcceptButton || isDefaultName}
            loading={disableAcceptButton}
          >
            Accept
          </Button>
          <Button color="red" onClick={this.onCancel}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
