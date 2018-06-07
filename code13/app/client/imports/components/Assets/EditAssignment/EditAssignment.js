import PropTypes from 'prop-types'
import React from 'react'
import { Grid } from 'semantic-ui-react'
import AssetsAvailableGET from '/client/imports/components/Assets/AssetsAvailableGET'
import BaseForm from '/client/imports/components/Controls/BaseForm.js'
import { Header, Divider, Message } from 'semantic-ui-react'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'

const _defaultAssignmentMetadata = {
  name: '',
  description: '',
  deadline: '',
  project: '',
}

class EditAssignmentForm extends BaseForm {
  get data() {
    return this.props.asset.metadata
  }

  render() {
    return (
      <div className="ui form">
        {this.text('Name', 'name', 'text')}
        {this.textArea('Description', 'description')}
        {this.date('Deadline', 'deadline')}
      </div>
    )
  }
}

export default class EditAssignment extends React.Component {
  static propTypes = {
    asset: PropTypes.object,
    canEdit: PropTypes.bool.isRequired,
    currUser: PropTypes.object,
    handleContentChange: PropTypes.func,
    editDeniedReminder: PropTypes.func,
    project: PropTypes.string,
  }

  handleChange(key) {
    this.handleSave()
  }

  handleSave(reason) {
    this.props.handleMetadataChange(this.props.asset.metadata)
  }

  render() {
    const { asset, canEdit, handleContentChange, currUser } = this.props
    asset.p
    if (!asset) return null

    if (!asset.metadata) asset.metadata = _defaultAssignmentMetadata

    return (
      <Grid centered container>
        <Grid.Column className="edit-game">
          <EditAssignmentForm
            asset={asset}
            canEdit={canEdit}
            onChange={this.handleChange.bind(this)}
            saveThumbnail={d => {
              handleContentChange(null, d, 'Updating thumbnail')
            }}
          />
          <br />
          <AssetsAvailableGET scopeToUserId={currUser._id} scopeToProjectName={'_assignment1'} />
        </Grid.Column>
      </Grid>
    )
  }
}
