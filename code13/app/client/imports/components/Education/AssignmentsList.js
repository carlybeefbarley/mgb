import React from 'react'
import _ from 'lodash'
import { List } from 'semantic-ui-react'
import { arraySelector } from '../Assets/EditAudio/EditMusic/djent/utils/tools'

export default class AssignmentsList extends React.Component {
  defaultProps = {}
  getFutureAssignments = () => {
    const { assignmentAssets } = this.props

    return assignmentAssets
  }

  convertDueDate = assignmentDate => {
    const dateArr = assignmentDate.split('-'),
      day = parseInt(dateArr[2]),
      month = parseInt(dateArr[1]),
      year = parseInt(dateArr[0])
    return new Date(`${year}-${month}-${day}`)
  }

  assignmentHasDueDate = assignment => {
    if (typeof assignment !== 'object') throw new Error('Invalid type passed.')
    if (assignment && assignment.metadata && assignment.metadata.dueDate) {
      return true
    }
    return false
  }

  assignmentIsPastDue = assignment => {
    if (typeof assignment !== 'object') throw new Error('Invalid type passed.')

    if (this.assignmentHasDueDate(assignment)) {
      const dueDate = this.convertDueDate(assignment.metadata.dueDate),
        now = new Date()
      if (dueDate < now) {
        return true
      } else {
        return false
      }
    }
    console.warn('Warning: Assignment does not have due date.')
  }

  filterAssetList = (assignmentAssetList, returnTypes) => {
    const returnArray = assignmentAssetList.filter(curr => {
      if (returnTypes.includes('noDueDate')) {
        if (!this.assignmentHasDueDate(curr)) {
          return curr
        }
      }
      if (returnTypes.includes('pastDue')) {
        if (this.assignmentIsPastDue(curr)) {
          return curr
        }
      }
      if (returnTypes.includes('upcoming')) {
        if (!this.assignmentIsPastDue(curr)) {
          return curr
        }
      }
    })

    if (returnArray.length === 0) console.log('sortAssetList() No Assets Found!')
    return returnArray
  }

  renderListItems = viewAssets => {
    if (viewAssets.length === 0) {
      return (
        <List.Item>
          <List.Content>
            <List.Header>You do not currently have any assignments.</List.Header>
          </List.Content>
        </List.Item>
      )
    }

    return _.map(viewAssets, assignmentAsset => {
      const isPassDue = this.assignmentIsPastDue(assignmentAsset)
      return (
        <List.Item key={assignmentAsset.name}>
          <List.Icon name="student" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              <small style={{ color: isPassDue ? 'red' : 'lightgray' }}>
                {`${isPassDue ? 'Past Due ' : ''}${assignmentAsset.metadata.dueDate || 'No Due Date'}`}
              </small>
            </List.Content>
            <List.Header>{assignmentAsset.name}</List.Header>
            <List.Description>
              <small>{assignmentAsset.text}</small>
            </List.Description>
          </List.Content>
        </List.Item>
      )
    })
  }

  render() {
    const { assignmentAssets, showPastDue, showUpcoming, showNoDueDate } = this.props
    const viewAssets = this.filterAssetList(assignmentAssets, ['pastDue', 'upcoming', 'noDueDate'])
    const listItems = this.renderListItems(viewAssets)
    return <List>{listItems}</List>
  }
}
