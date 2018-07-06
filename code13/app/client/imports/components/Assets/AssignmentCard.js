import React from 'react'
import { Card, Icon, Button } from 'semantic-ui-react'
import ReactQuill from 'react-quill'
import { openAssetById } from '/client/imports/routes/QLink'
import moment from 'moment'

const AssignmentCard = props => {
  const { assignmentDetail, dueDate = null } = props.assignmentAsset.metadata
  const { assignmentAsset, canEdit } = props

  return (
    <Card fluid>
      <Card.Content>
        {/* This is redundant information, the name of the assignment is the header of assignment overview */}
        {/* <Card.Header>
          <Icon name="file" /> {assignmentAsset.name}
        </Card.Header> */}
        <Card.Meta>{dueDate && `Due ${moment(dueDate).format('ll')}`}</Card.Meta>
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
