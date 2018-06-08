import React from 'react'
import { Segment, Header, Message, Icon, List } from 'semantic-ui-react'

const AssignmentDetails = props => (
  <Segment raised padded style={{ flex: '1 1 100%', margin: 0 }}>
    <Header as="h3">Assignment 1</Header>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
      dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
      ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
      fugiat nulla pariatur.
    </p>
    <Header as="h4">Due date: 6/17</Header>
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
