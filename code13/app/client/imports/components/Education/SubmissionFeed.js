import React from 'react'
import _ from 'lodash'
import { List } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
export default class SubmissionFeed extends React.Component {
  /**
   * Hudson: 2018-06-30 19:57:07
   *
   * This component expects to get [projects], [assignments], and [classrooms] to be passed to it as props.
   * It does not use classrooms directly but they are required to get at the assignments / projects / studentIds
   * needed to render out the proper list of recently submitted assignments; as such they are passed as
   * props for possible future use.
   *
   * This component should probably never be used directly but, you're an adult, you do what you want.
   *
   * [classrooms] Should be an array of classroom documents filtered by those that are either owned by this user or
   * where this user's id is included in the classroom's [teacherIds] array within the document.
   *
   * [projects] Should be an array of project documents filtered by those which belong to students that belong to any
   * classroom that this user owns or is included in the classroom's [teacherIds] array within the document
   * server-side.
   *
   * [assignments] Should be an array of asset documents where ownerId is included in ANY of the ids stored within EVERY
   * classrooms [studentIds] arrays. This could get rather large in the future and we should probably consider pagination
   * if this is ever used at scale but for now just pulling all the documents should work.
   *
   * Assignments are considered "submitted" if their workstate is set to whatever the "submitted" workstate is
   * in the HOC SubmissionFeedGET and will only appear within the list if this is so.
   *
   */
  renderAssignmentsList = () => {
    const { projects, assignments } = this.props
    const returnElements = _.map(projects, project => {
      // Find that assignment name by checking all assignments to find where prj.assignmentId === assignment._id
      const assignmentAsset = _.find(assignments, assignment => {
        if (assignment._id === project.assignmentId) {
          return true
        } else {
          return false
        }
      })

      const linkToProject = `/u/${project.ownerName}/projects/${project.name}`

      return (
        <List.Item key={project._id}>
          <QLink to={linkToProject}>
            <List.Content style={{ width: '100%' }}>
              <List.Content floated="right">
                <small style={{ color: 'red' }}>
                  date submitted - TODO: NOT CURRENTLY STORED IN DATABASE
                </small>
              </List.Content>
              <List.Header>{project.ownerName}</List.Header>
              <List.Description>
                <small>{assignmentAsset && assignmentAsset.name}</small>
              </List.Description>
            </List.Content>
          </QLink>
        </List.Item>
      )
    })

    return returnElements
  }
  render() {
    const listElements = this.renderAssignmentsList()
    const noAssignments = (
      <List.Item>
        <List.Content>
          <List.Header>No Assignments Found</List.Header>
        </List.Content>
      </List.Item>
    )
    return <List>{(listElements && listElements) || noAssignments}</List>
  }
}
