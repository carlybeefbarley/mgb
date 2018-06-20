import PropTypes from 'prop-types'
import React from 'react'
import { Grid, Button } from 'semantic-ui-react'
import AssetsAvailableGET from '/client/imports/components/Assets/AssetsAvailableGET'
import BaseForm from '/client/imports/components/Controls/BaseForm.js'
import { showToast } from '/client/imports/modules'
import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'
import ReactQuill from 'react-quill'

const _defaultAssignmentMetadata = {
  assignmentDetail: '',
  dueDate: '',
  workState: 'unknown',
}

class EditAssignmentForm extends BaseForm {
  get data() {
    return this.props.asset.metadata
  }

  render() {
    return (
      <div className="ui form">
        {this.date('Due Date', 'dueDate')}
        {this.bool('Is Team Project', 'isTeamProject')}
        {this.textEditor('Assignment Detail', 'assignmentDetail')}
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

  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  handleChange(key) {
    this.handleSave()
  }

  handleSave(reason) {
    this.props.handleMetadataChange(this.props.asset.metadata)
  }

  handleCreateProjectFromAssignment = () => {
    const { currUser, asset: { _id, name, text, metadata: { assignmentDetail, dueDate } } } = this.props
    let newProj = {
      name,
      description: text,
      assignmentDetail,
      assignmentId: _id,
      dueDate,
      workState: 'unknown',
    }

    Meteor.call('Projects.create', newProj, (error, result) => {
      if (error) showToast.error('Could not create project - ' + error.reason)
      else {
        logActivity('project.create', `Create project ${name}`)
        utilPushTo(this.context.urlLocation.query, `/u/${currUser.profile.name}/projects/${name}`)
      }
    })
  }

  render() {
    const { asset, canEdit, handleContentChange } = this.props
    if (!asset) return null

    if (!asset.metadata) asset.metadata = _defaultAssignmentMetadata

    return (
      <Grid centered container>
        <Grid.Column className="edit-assignment">
          <EditAssignmentForm
            asset={asset}
            canEdit={canEdit}
            onChange={this.handleChange.bind(this)}
            saveThumbnail={d => {
              handleContentChange(null, d, 'Updating thumbnail')
            }}
          />
          <Button floated="right" onClick={this.handleCreateProjectFromAssignment} content="Create Project" />
        </Grid.Column>
      </Grid>
    )
  }
}
