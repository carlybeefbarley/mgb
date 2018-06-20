import React from 'react'
import { Segment, Header, Message, Icon, List, Button } from 'semantic-ui-react'
import { openAssetById } from '/client/imports/routes/QLink'

const AssignmentDetail = props => (
  <Segment raised padded style={{ flex: '1 1 100%', margin: 0 }}>
    <Header>
      {props.name} - Due {props.dueDate}
    </Header>
    <div dangerouslySetInnerHTML={{ __html: props.detail }} />
    {props.isStudent && (
      <Message icon warning>
        <Message.Content>
          <Icon name="warning" />
          <b>2 / 3</b> required assets are completed
        </Message.Content>
      </Message>
    )}
    <Button
      icon="pencil"
      content="Edit"
      onClick={() => {
        openAssetById(props.assignmentId)
      }}
    />
  </Segment>
)

export default AssignmentDetail
