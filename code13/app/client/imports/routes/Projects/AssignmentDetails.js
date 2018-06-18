import React from 'react'
import { Segment, Header, Message, Icon, List } from 'semantic-ui-react'

const AssignmentDetails = props => (
  <Segment raised padded style={{ flex: '1 1 100%', margin: 0 }}>
    <Header as="h3">Assignment 1</Header>
    <p>{props.detail}</p>
    <Header as="h4">Due date: {props.dueDate}</Header>
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
