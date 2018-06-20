import React from 'react'
import { Segment, Header, Button } from 'semantic-ui-react'
import { openAssetById } from '/client/imports/routes/QLink'

const AssignmentDetail = props => (
  <Segment raised padded style={{ flex: '1 1 100%', margin: 0 }}>
    <Header>
      {props.name} - Due {`${props.dueDate.split('-')[1]}/${props.dueDate.split('-')[2]}`}
      <Button
        compact
        floated="right"
        icon="pencil"
        content="Edit"
        onClick={() => {
          openAssetById(props.assignmentId)
        }}
      />
    </Header>
    <div dangerouslySetInnerHTML={{ __html: props.detail }} />
  </Segment>
)

export default AssignmentDetail
