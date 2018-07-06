import React from 'react'
import _ from 'lodash'
import { List, Button, Icon } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'
import Spinner from '/client/imports/components/Nav/Spinner'

export default class AssignmentsList extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    assignmentAssets: PropTypes.array,
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
    console.warn(`Warning: ${assignment.name} does not have due date.`)
  }

  formatDueDate = fuzzyDate => {
    const actualDate = `${fuzzyDate.split('-')[1]}/${fuzzyDate.split('-')[2]}`
    //TODO: Fix this so it works
    return actualDate
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

    // Sort by due date
    // Doesn't work for some reason
    returnArray.sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })

    return returnArray
  }

  renderProjectButton = (assignmentAsset, project) => {
    const { currUser, showProjectCreateButtons } = this.props
    if (!showProjectCreateButtons) return

    if (project) {
      return (
        <Button
          size="mini"
          compact
          color="green"
          onClick={() => {
            utilPushTo(null, `u/${currUser.username}/projects/${project.name}`)
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
    const { currUser } = this.props
    const data = {
      name: `${currUser.username}'s Project for ${assignmentAsset.name}`,
      description: '',
      assignmentId: assignmentAsset._id,
    }

    Meteor.call('Projects.create', data)
  }

  renderListItems = viewAssets => {
    if (!viewAssets) {
      return <Spinner />
    }

    if (viewAssets.length === 0) {
      return (
        <List.Item>
          <List.Content>
            <List.Header>You do not currently have any assignments.</List.Header>
          </List.Content>
        </List.Item>
      )
    }
    const { currUserProjects, showProjectCreateButtons } = this.props

    return _.map(viewAssets, assignmentAsset => {
      const isPastDue = this.assignmentIsPastDue(assignmentAsset)
      const project = _.find(currUserProjects, project => {
        return project.assignmentId && project.assignmentId === assignmentAsset._id
      })

      const verticalAlignSty = { lineHeight: '1.5em', verticalAlign: 'middle', padding: 0 }

      return (
        <List.Item key={assignmentAsset.name}>
          {showProjectCreateButtons ? (
            <List.Icon fitted size="small" style={{ minWidth: '1.5em', ...verticalAlignSty }}>
              {project && <WorkState isAssignment iconOnly size="small" workState={project.workState} />}
            </List.Icon>
          ) : (
            <List.Icon fittedsize="small" style={verticalAlignSty} name="file" />
          )}
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              {this.renderProjectButton(assignmentAsset, project)}
              <small style={{ color: isPastDue ? 'red' : 'gray' }}>
                {`${isPastDue ? 'Past Due ' : 'Due '}${this.formatDueDate(assignmentAsset.metadata.dueDate) ||
                  'No Due Date'}`}
              </small>
            </List.Content>
            {this.props.isTeacher ? (
              <QLink to={`/u/${assignmentAsset.dn_ownerName}/asset/${assignmentAsset._id}`}>
                <List.Header style={verticalAlignSty}>{assignmentAsset.name}</List.Header>
              </QLink>
            ) : (
              <List.Header style={verticalAlignSty}>{assignmentAsset.name}</List.Header>
            )}
            <List.Description>
              <small>{assignmentAsset.text}</small>
            </List.Description>
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
