import React from 'react'
import _ from 'lodash'
import { List, Button, Icon } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'

export default class AssignmentsList extends React.Component {
  static propTypes = {
    showPastDue: PropTypes.bool,
    showUpcoming: PropTypes.bool,
    showNoDueDate: PropTypes.bool,
    showCompleted: PropTypes.bool,
    showProjectCreateButtons: PropTypes.bool,
  }

  static defaultProps = {
    showPastDue: true,
    showUpcoming: true,
    showNoDueDate: true,
    showCompleted: true,
    showProjectCreateButtons: false,
  }

  getFutureAssignments = () => {
    const { assignmentAssets } = this.props

    return assignmentAssets
  }

  assignmentHasDueDate = assignment => {
    if (typeof assignment !== 'object') throw new Error('Invalid type passed, expect object.')
    if (assignment && assignment.metadata && assignment.metadata.dueDate) {
      return true
    }
    return false
  }

  assignmentIsPastDue = assignment => {
    if (typeof assignment !== 'object') throw new Error('Invalid type passed, expect object.')

    if (this.assignmentHasDueDate(assignment)) {
      const dueDate = new Date(assignment.metadata.dueDate),
        now = new Date()
      if (dueDate < now) {
        return true
      } else {
        return false
      }
    }
    console.warn('Warning: Assignment does not have due date.')
  }

  // TODO: Handle for completed past assignments
  filterAssetList = assignmentAssetList => {
    const { showNoDueDate, showPastDue, showUpcoming } = this.props
    const returnArray = assignmentAssetList.filter(assignmentAsset => {
      if (showNoDueDate && !this.assignmentHasDueDate(assignmentAsset)) {
        return assignmentAsset
      }
      if (showPastDue && this.assignmentIsPastDue(assignmentAsset)) {
        return assignmentAsset
      }
      if (
        showUpcoming &&
        !this.assignmentIsPastDue(assignmentAsset) &&
        this.assignmentHasDueDate(assignmentAsset)
      ) {
        return assignmentAsset
      }
    })

    if (returnArray.length === 0) console.warn('sortAssetList() No Assets Found!')
    return returnArray
  }

  renderProjectButton = assignmentAsset => {
    if (!this.props.showProjectCreateButtons) return
    const { currUserProjects } = this.props
    const project = _.find(currUserProjects, project => {
      return project.assignmentId && project.assignmentId === assignmentAsset._id
    })
    if (project) {
      return (
        <Button
          size="mini"
          compact
          color="green"
          onClick={() => {
            utilPushTo(null, `u/${Meteor.user().username}/projects/${project.name}`)
          }}
        >
          <Icon name="sitemap" />
          Go To Project
        </Button>
      )
    } else {
      return (
        <Button size="mini" compact onClick={() => this.handleCreateProject(assignmentAsset)}>
          <Icon name="sitemap" />
          Create Project
        </Button>
      )
    }
  }

  handleCreateProject = assignmentAsset => {
    console.log('Click worked yo.')
    const { currUser } = this.props
    const data = {
      name: `${currUser.username}'s Project for ${assignmentAsset.name}`,
      description: '',
      assignmentId: assignmentAsset._id,
    }

    Meteor.call('Projects.create', data)
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
      const isPastDue = this.assignmentIsPastDue(assignmentAsset)
      return (
        <List.Item key={assignmentAsset.name}>
          <List.Icon name="student" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              {this.renderProjectButton(assignmentAsset)}
              <small style={{ color: isPastDue ? 'red' : 'lightgray' }}>
                {`${isPastDue ? 'Past Due ' : ''}${assignmentAsset.metadata.dueDate || 'No Due Date'}`}
              </small>
            </List.Content>
            <QLink to={`/u/${assignmentAsset.dn_ownerName}/asset/${assignmentAsset._id}`}>
              <List.Header>{assignmentAsset.name}</List.Header>
              <List.Description>
                <small>{assignmentAsset.text}</small>
              </List.Description>
            </QLink>
          </List.Content>
        </List.Item>
      )
    })
  }

  render() {
    const { assignmentAssets } = this.props
    const listItems = this.renderListItems(this.filterAssetList(assignmentAssets))
    return <List>{listItems}</List>
  }
}
