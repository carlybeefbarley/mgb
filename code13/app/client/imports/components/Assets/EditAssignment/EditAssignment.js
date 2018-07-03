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
      <Grid columns={1} padded>
        <Grid.Row>
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
        </Grid.Row>
      </Grid>
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

  getStudents = () => {
    let idArray = []
    const handleForUsers = Meteor.subscribe('users.getByIdList', idArray)
    const selector = { _id: { $in: idArray } }
  }

  handleChange(key) {
    this.handleSave()
  }

  handleSave(reason) {
    this.props.handleMetadataChange(this.props.asset.metadata)
  }

  handleCreateProjectFromAssignment = () => {
    const { currUser, asset: { _id, name, metadata } } = this.props
    let newProj = {
      name,
      description: metadata.description,
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
    utilPushTo(this.context.urlLocation.query, `/u/${currUser.profile.name}/projects/${name}`)
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
            saveThumbnail={d => {
              handleContentChange(null, d, 'Updating thumbnail')
            }}
          />
          <br />
          <Button
            floated="right"
            onClick={() => {
              if (!asset.metadata.projectId) this.handleCreateProjectFromAssignment()
              else {
                utilPushTo(
                  this.context.urlLocation.query,
                  `/u/${currUser.profile.name}/projects/${asset.name}`,
                )
              }
            }}
            content={asset.metadata.projectId ? 'Go to Project' : 'Create Project'}
          />
        </Grid.Column>
      </Grid>
    )
  }
}
