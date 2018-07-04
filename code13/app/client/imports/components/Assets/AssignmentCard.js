import React from 'react'
import { Card, Icon, Button } from 'semantic-ui-react'
import ReactQuill from 'react-quill'
import { openAssetById } from '/client/imports/routes/QLink'

const renderDueDate = fuzzyDate => {
  const actualDate = `${fuzzyDate.split('-')[1]}/${fuzzyDate.split('-')[2]}`
  //TODO: Fix this so it works
  return actualDate
}

const AssignmentCard = props => {
  const { assignmentDetail, dueDate = null } = props.assignmentAsset.metadata
  const { assignmentAsset, canEdit } = props

  return (
    <Card raised fluid>
      <Card.Content>
        <Card.Header>
          <Icon name="file" /> {assignmentAsset.name}
        </Card.Header>
        <Card.Meta>{dueDate && `Due ${renderDueDate(dueDate)}`}</Card.Meta>
        <Card.Description>
          <ReactQuill
            readOnly
            style={{ pointerEvents: 'none' }}
            theme={null}
            defaultValue={assignmentDetail}
          />
        </Card.Description>
        {canEdit && (
          <Button
            compact
            floated="right"
            icon="pencil"
            content="Edit"
            onClick={() => {
              openAssetById(props.assignmentId)
            }}
          />
        )}
      </Card.Content>
    </Card>
  )
}

export default AssignmentCard
