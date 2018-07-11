import React from 'react'
import _ from 'lodash'
import { List, Button, Icon } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'
import Spinner from '/client/imports/components/Nav/Spinner'
import moment from 'moment'

export default class AssignmentsList extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    assignmentAssets: PropTypes.array,
    showProjectCreateButtons: PropTypes.bool,
    showPastDue: PropTypes.bool,
    showUpcoming: PropTypes.bool,
    showNoDueDate: PropTypes.bool,
    showCompleted: PropTypes.bool,
  }

  getFutureAssignments = () => {
    const { assignmentAssets } = this.props
    return assignmentAssets
  }

  assignmentHasDueDate = assignment => {
    if (typeof assignment !== 'object') throw new Error('Invalid type passed, expect object.')
    return assignment && assignment.metadata && assignment.metadata.dueDate
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

  // Filter assignment assets list based on props
  filterAssetList = assignmentAssetList => {
    const { showNoDueDate, showPastDue, showUpcoming, exclusive } = this.props

    // Split array by list with dates and list without dates
    const splitByHasDate = _.partition(assignmentAssetList, assignmentAsset => {
      return this.assignmentHasDueDate(assignmentAsset)
    })
    const assignmentsWithDates = splitByHasDate[0]
    const assignmentsWithoutDates = splitByHasDate[1]

    // Split array (with dates) by list of past due and list of upcoming
    const splitByPastDue = _.partition(assignmentsWithDates, assignmentAsset => {
      return this.assignmentIsPastDue(assignmentAsset)
    })
    const assignmentsPastDue = splitByPastDue[0]
    const assignmentsUpcoming = splitByPastDue[1]

    // Combine array based on props
    let returnArr = []
    if (showPastDue) returnArr = [...assignmentsPastDue, ...returnArr]
    if (showUpcoming) returnArr = [...assignmentsUpcoming, ...returnArr]
    if (showNoDueDate) returnArr = [...assignmentsWithoutDates, ...returnArr]

    return returnArr
  }

  // Returns a new array sorted by dueDate
  sortAssetsByDate = list => {
    // Sort by due date
    return _.sortBy(list, [
      asset => {
        return new Date(asset.metadata.dueDate)
      },
    ])
  }

  renderProjectButton = (assignmentAsset, project) => {
    const { currUser, showProjectCreateButtons } = this.props
    const buttonSty = {
      width: '11em',
    }
    if (!showProjectCreateButtons) return

    if (project) {
      return (
        <Button
          size="mini"
          compact
          color="yellow"
          style={buttonSty}
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
        <Button
          size="mini"
          compact
          style={buttonSty}
          onClick={() => this.handleCreateProject(assignmentAsset)}
        >
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
            <List.Header>There are no relevant assignments.</List.Header>
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
            <List.Icon fitted size="small" style={verticalAlignSty} name="file" />
          )}
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              {this.renderProjectButton(assignmentAsset, project)}
              <small
                style={{
                  display: 'inline-block',
                  minWidth: '6.5em',
                  color: isPastDue ? 'lightgray' : 'dimgray',
                  textAlign: 'right',
                }}
              >
                <strong>{` ${moment(assignmentAsset.metadata.dueDate).format('ll') || ''}`}&nbsp;</strong>
              </small>
            </List.Content>

            <QLink to={`/u/${assignmentAsset.dn_ownerName}/asset/${assignmentAsset._id}`}>
              <List.Header style={verticalAlignSty}>{assignmentAsset.name}</List.Header>
            </QLink>

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
    console.log(assignmentAssets)

    let list = this.filterAssetList(assignmentAssets)
    list = this.sortAssetsByDate(list)
    const listItems = this.renderListItems(list)
    return <List>{listItems}</List>
  }
}
