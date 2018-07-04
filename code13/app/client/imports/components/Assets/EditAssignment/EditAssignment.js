import PropTypes from 'prop-types'
import React from 'react'
import { Grid, Button, Header } from 'semantic-ui-react'
import BaseForm from '/client/imports/components/Controls/BaseForm.js'

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
    const headerStyle = {
      fontSize: '1.5em',
    }

    return (
      <div>
        <Header as="h1" content="Edit Assignment" style={headerStyle} />
        <Grid columns={1} padded>
          <Grid.Row style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
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
              })}
            </div>
          </Grid.Row>
        </Grid>
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
        </Grid.Column>
      </Grid>
    )
  }
}
