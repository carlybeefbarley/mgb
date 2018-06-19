import React from 'react'
import { Card, Icon, Popup } from 'semantic-ui-react'
import ReactQuill from 'react-quill'

const AssignmentCard = props => {
  return (
    <Card fluid>
      <Card.Content>
        <Icon name="student" />
        <Card.Header>{props.assignmentAsset.name}</Card.Header>
        <Card.Meta>{props.assignmentAsset.dn_ownerName}</Card.Meta>
        <Card.Description>
          <ReactQuill readOnly theme={null} defaultValue={props.assignmentAsset.metadata.assignmentDetail} />
        </Card.Description>
      </Card.Content>
    </Card>
  )
}

export default AssignmentCard
