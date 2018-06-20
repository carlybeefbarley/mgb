import React from 'react'
import { Segment, Header } from 'semantic-ui-react'

const AssignmentDetails = props => (
  <Segment raised padded style={{ flex: '1 1 100%', margin: 0 }}>
    <Header>
      {props.name} - Due {`${props.dueDate.split('-')[1]}/${props.dueDate.split('-')[2]}`}
    </Header>
    <div dangerouslySetInnerHTML={{ __html: props.detail }} />
  </Segment>
)

export default AssignmentDetails
