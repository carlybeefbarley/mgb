import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Helmet from 'react-helmet'
import {
  Divider,
  Form,
  Grid,
  Input,
  Segment,
  Checkbox,
  Message,
  Modal,
  Icon,
  Header,
  Button,
  Popup,
  List,
} from 'semantic-ui-react'
import { showToast } from '/client/imports/modules'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { Projects } from '/imports/schemas'
import AssetCreateNewModal from '/client/imports/components/Assets/NewAsset/AssetCreateNewModal'
import Spinner from '/client/imports/components/Nav/Spinner'
import { joyrideStore } from '/client/imports/stores'
import ProjectHistoryRoute from './ProjectHistoryRoute'
import UserListRoute from '../Users/UserListRoute'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import AssetsAvailableGET from '/client/imports/components/Assets/AssetsAvailableGET'
import { logActivity } from '/imports/schemas/activity'
import ProjectForkGenerator from './ProjectForkGenerator'
import { isUserSuperAdmin } from '/imports/schemas/roles'
import SpecialGlobals from '/imports/SpecialGlobals.js'
import Hotjar from '/client/imports/helpers/hotjar.js'
import { withMeteorData } from '../../hocs'
import StudentListGET from '/client/imports/routes/Projects/StudentListGET.js'
import AssignmentDetails from './AssignmentDetails'
import ChatPanel from '/client/imports/components/Assets/ChatPanel.js'
import { makeChannelName } from '/imports/schemas/chats'

class AssignmentOverview extends Component {
  static propTypes = {
    currUser: PropTypes.object,
    loading: PropTypes.bool,
    params: PropTypes.object, // Contains params.projectId  OR projectName
    project: PropTypes.object,
    user: PropTypes.object, // App.js gave us this from params.id OR params.username
  }

  state = {
    showAddUserSearch: false, // True if user search box is to be shown
    isForkPending: false, // True if a fork operation is pending
    isDeletePending: false, // True if a delete project operation is pending
    isDeleteComplete: false, // True if a delete project operation succeeded.
    compoundNameOfDeletedProject: null, // Used for User feedback after deleting project. using Compound name for full
    // clarity
    confirmDeleteNum: -1, // If >=0 then it indicates how many assets will be deleted. Used to flag 2-stage DELETE
    // PROJECT
    activities: [], // always array even empty one
  }

  componentDidMount() {
    // setTimeou just to be sure that everything is loaded
    setTimeout(() => Hotjar('trigger', 'project-overview', this.props.currUser), 200)
  }

  // This should not conflict with the deferred changes since those don't change these fields :)
  handleWorkStateChange = newWorkState => {
    const { _id, workState } = this.props.project
    const oldState = workState
    if (newWorkState !== oldState) {
      Meteor.call('Projects.update', _id, { workState: newWorkState }, (err, res) => {
        if (err) showToast.error(err.reason)
      })
      logActivity(
        'project.workState',
        `WorkState changed from ${oldState} to "${newWorkState}"`,
        null,
        this.props.project,
      )
    }
  }

  handleSubmitAssignment = () => {
    this.handleWorkStateChange('needs review')
  }

  handleDeleteProject = () => {
    var { name } = this.props.project
    Meteor.call('Projects.countNonDeletedAssets', name, (error, result) => {
      if (error) showToast.error(`Could not count Number of Assets in Project '${name}: ${error.reason}`)
      else this.setState({ confirmDeleteNum: result })
    })
  }

  handleConfirmedDeleteProject = () => {
    var { name, _id, ownerName } = this.props.project
    var compoundNameOfDeletedProject = `${ownerName}:${name}`
    this.setState({ isDeletePending: true }) // Button disable/enable also guards against re-entrancy

    Meteor.call('Projects.deleteProjectId', _id, true, (error, result) => {
      if (error) {
        showToast.error(`Could not delete Project '${name}: ${error.reason}`)
        this.setState({ isDeletePending: false })
      } else {
        logActivity('project.destroy', `Deleted ${result} Project ${name}`)
        this.setState({
          isDeletePending: false,
          isDeleteComplete: true,
          compoundNameOfDeletedProject,
        })
      }
    })
  }

  renderStudentView = (project, activities) => {
    return (
      <Grid columns="equal" container style={{ overflowX: 'hidden', marginTop: '1em', maxHeight: '100vh' }}>
        <Grid.Row>
          <Header as="h2" color="grey" floated="left">
            Assignment Details
          </Header>
          <AssignmentDetails isStudent />
        </Grid.Row>
        <Grid.Row />
        <Grid.Row stretched columns={2}>
          <Grid.Column width={11}>
            <Header
              as="h2"
              color="grey"
              floated="left"
              style={{ cursor: 'pointer' }}
              onClick={() => utilPushTo(null, `/u/${project.name}/assets`)}
            >
              Assets
            </Header>
            <AssetsAvailableGET scopeToUserId={project.ownerId} scopeToProjectName={project.name} />
          </Grid.Column>
          <Grid.Column width={5}>
            <Header
              as="h2"
              color="grey"
              floated="left"
              // Stretched columns force the width to be 100%
              // The text only should be clickable, limit the width to the length of the text
              style={{ flex: '0 0 auto', width: '3.75em', cursor: 'pointer' }}
              id="mgbjr-project-activity"
              onClick={() => utilPushTo(null, `/u/${project.ownerName}/projects/${project.name}/activity`)}
            >
              Activity
            </Header>
            <ProjectHistoryRoute project={project} activities={activities} style={{ clear: 'left' }} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderTeacherView = (project, activities) => {
    const listSty = {
      overflowY: 'auto',
      height: '20em',
    }

    const { name, assignmentDetail, dueDate } = this.props.project
    const { confirmDeleteNum, isDeleteComplete, isDeletePending } = this.state

    return (
      <Grid.Column>
        <Grid columns="equal" container style={{ overflowX: 'hidden', marginTop: '1em', width: '100%' }}>
          <div style={{ float: 'right' }}>
            <Button
              labelPosition="left"
              icon="trash"
              disabled={isDeleteComplete || isDeletePending}
              content={
                confirmDeleteNum < 0 ? (
                  'Delete'
                ) : (
                  `Confirm Delete of Project and ${confirmDeleteNum} Assets..?`
                )
              }
              color={confirmDeleteNum < 0 ? null : 'red'}
              onClick={confirmDeleteNum < 0 ? this.handleDeleteProject : this.handleConfirmedDeleteProject}
            />
            <Button
              labelPosition="left"
              icon="calendar check"
              content={'Submit Assignment'}
              onClick={this.handleSubmitAssignment}
            />
          </div>
          <Grid.Row>
            <Header as="h2" color="grey" floated="left">
              Assignment Details
            </Header>
            <AssignmentDetails name={name} detail={assignmentDetail} dueDate={dueDate} />
          </Grid.Row>
          <Grid.Row stretched>
            <Grid.Column style={{ height: 'auto' }}>
              <Header
                as="h2"
                color="grey"
                floated="left"
                style={{ cursor: 'pointer' }}
                onClick={() => utilPushTo(null, `/u/${project.name}/assets`)}
              >
                Completed
              </Header>
              <Segment padded raised style={listSty}>
                <StudentListGET assignment={project} />
              </Segment>
            </Grid.Column>
            <Grid.Column style={{ height: 'auto' }}>
              <Header
                as="h2"
                color="grey"
                floated="left"
                // Stretched columns force the width to be 100%
                // The text only should be clickable, limit the width to the length of the text
                style={{ flex: '0 0 auto', width: '3.75em', cursor: 'pointer' }}
                id="mgbjr-project-activity"
                onClick={() => utilPushTo(null, `/u/${project.ownerName}/projects/${project.name}/activity`)}
              >
                Incomplete
              </Header>
              <Segment padded raised style={listSty}>
                {this.renderIncompleteList()}
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Grid.Column>
    )
  }

  renderCompletedList = () => {
    const names = 'abcdefghijklmnopqrstuvwxyz'

    return (
      <List relaxed divided style={{ paddingBottom: '1em !important' }}>
        {_.map(names, letter => {
          var day = Math.floor(Math.random() * 10) + 16
          return (
            <List.Item>
              <List.Header as="a">{`${letter.toUpperCase()}rian`}</List.Header>
              <List.Description>
                Assignment completed on {new Date(2018, 6, day).toDateString()}
              </List.Description>
            </List.Item>
          )
        })}
      </List>
    )
  }

  renderIncompleteList = () => {
    const students = ['Briaa', 'Briab', 'Briac', 'Briad', 'Briae']
    return (
      <List relaxed divided style={{ paddingBottom: '1em !important' }}>
        {_.map(students, student => {
          return (
            <List.Item key={student}>
              <List.Header as="a">{student}</List.Header>
              <List.Description>{Math.floor(Math.random() * 3)}/3 assets completed</List.Description>
            </List.Item>
          )
        })}
      </List>
    )
  }

  render() {
    const { project } = this.props // One Project provided via

    const { activities } = this.state

    const isStudent = false

    const currUser = Meteor.user()
    const channelName = makeChannelName({ scopeGroupName: 'Asset', scopeId: 'Rz3yh9K5zCHZxvEWJ' })

    console.log(this)

    return (
      <Grid columns="equal" padded style={{ flex: '1 1 0' }}>
        <ChatPanel currUser={currUser} channelName={channelName} />
        {isStudent ? (
          this.renderStudentView(project, activities)
        ) : (
          this.renderTeacherView(project, activities)
        )}
      </Grid>
    )
  }
}

export default withMeteorData(props => {
  const { params: { projectId, projectName }, user } = props
  const sel = projectId ? { _id: projectId } : { ownerId: user._id, name: projectName }

  const handleForProject = Meteor.subscribe('projects.oneProject', sel)

  return {
    project: Projects.findOne(sel),
    loading: !handleForProject.ready(),
  }
})(AssignmentOverview)
