import React from 'react'
import _ from 'lodash'
import { List } from 'semantic-ui-react'

export default class AssignmentsList extends React.Component {
  render() {
    const { assignmentAssets } = this.props
    return (
      <List>
        {_.map(assignmentAssets, assignmentAsset => {
          return (
            <List.Item key={assignmentAsset.name}>
              <List.Icon name="student" />
              <List.Content style={{ width: '100%' }}>
                <List.Content floated="right">
                  <small style={{ color: 'lightgray' }}>{assignmentAsset.metadata.dueDate}</small>
                </List.Content>
                <List.Header>{assignmentAsset.name}</List.Header>
                <List.Description>
                  <small>{assignmentAsset.text}</small>
                </List.Description>
              </List.Content>
            </List.Item>
          )
        })}
      </List>
    )
  }
}
