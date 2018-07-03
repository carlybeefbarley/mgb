import PropTypes from 'prop-types'
import React from 'react'
import { Grid, Button } from 'semantic-ui-react'
import BaseForm from '/client/imports/components/Controls/BaseForm.js'
import { showToast } from '/client/imports/modules'
import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'

const _defaultAssignmentMetadata = {
  description: '',
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
        {this.text('Description', 'description', 'text', {
          title: 'Short description of assignment for teacher reference',
        })}
        {this.date('Due Date', 'dueDate')}
        {this.bool('Is Team Project', 'isTeamProject', {
          title: 'If the project should allow multiple members',
        })}
        {this.textEditor('Assignment Detail', 'assignmentDetail', {
          title: 'Assignment details for students',
          canEdit: this.props.canEdit,
        })}
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

  componentDidMount() {
    if (!this.props.asset.metadata.projectId) this.handleCreateProjectFromAssignment()
  }

  handleChange(key) {
    this.handleSave()
  }

  handleSave(reason) {
    this.props.handleMetadataChange(this.props.asset.metadata)
  }

  handleCreateProjectFromAssignment = () => {
    const { asset: { _id, name, description, metadata } } = this.props
    let newProj = {
      name,
      description,
      assignmentId: _id,
      allowForks: true,
      workState: 'unknown',
    }

    Meteor.call('Projects.create', newProj, (error, result) => {
      if (error) showToast.error('Could not create project - ' + error.reason)
      else {
        logActivity('project.create', `Create project ${name}`)
        metadata.projectId = result
        this.handleSave()
      }
    })
  }

  render() {
    const { currUser, asset, canEdit, handleContentChange } = this.props
    if (!asset) return null

    if (!asset.metadata) asset.metadata = _defaultAssignmentMetadata

    return (
      <Grid centered container>
        <Grid.Column className="edit-assignment">
          <EditAssignmentForm
            asset={asset}
            canEdit={canEdit}
            onChange={this.handleChange.bind(this)}
            handleCreateProjectFromAssignment={this.handleCreateProjectFromAssignment}
            saveThumbnail={d => {
              handleContentChange(null, d, 'Updating thumbnail')
            }}
          />
          <br />
          <Button
            floated="right"
            onClick={() =>
              utilPushTo(
                this.context.urlLocation.query,
                `/u/${currUser.profile.name}/projects/${asset.name}`,
              )}
            content="Go to Project"
          />
        </Grid.Column>
      </Grid>
    )
  }
}
