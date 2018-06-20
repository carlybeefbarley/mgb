import React from 'react'
import { Card, Icon, Popup } from 'semantic-ui-react'
import ReactQuill from 'react-quill'

const renderDueDate = fuzzyDate => {
  // const actualDate =
  //TODO: Fix this so it works
  return fuzzyDate
}

const AssignmentCard = props => {
  const { assignmentDetail, dueDate = null } = props.assignmentAsset.metadata
  const { assignmentAsset } = props
  return (
    <Card fluid>
      <Card.Content>
        <Icon name="student" />
        <Card.Header>{assignmentAsset.name}</Card.Header>
        <Card.Meta>{dueDate && renderDueDate(dueDate)}</Card.Meta>
        <Card.Description>
          <ReactQuill readOnly theme={null} defaultValue={assignmentDetail} />
        </Card.Description>
      </Card.Content>
    </Card>
  )
}

export default AssignmentCard
