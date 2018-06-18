import React from 'react'
import { Segment, Header, Message, Icon, List } from 'semantic-ui-react'

const AssignmentDetails = props => (
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
  </Segment>
)

export default AssignmentDetails
