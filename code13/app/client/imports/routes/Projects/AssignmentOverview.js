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
import { makeChannelName } from '/imports/schemas/chats'
import { isUserSuperAdmin } from '/imports/schemas/roles'
import SpecialGlobals from '/imports/SpecialGlobals.js'
import Hotjar from '/client/imports/helpers/hotjar.js'
import { withMeteorData } from '../../hocs'
import { getProjectAvatarUrl } from '../../helpers/assetFetchers'
import AssignmentDetails from './AssignmentDetails'

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

  renderStudentView = (project, activities) => {
    return (
      <Grid columns="equal" container style={{ overflowX: 'hidden', marginTop: '1em' }}>
        <Grid.Row>
          <Header as="h2" color="grey" floated="left">
            Assignment Details
          </Header>
          <AssignmentDetails isStudent />
        </Grid.Row>
        <Grid.Row />
        <Grid.Row>
          <Grid.Column>
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
          <Grid.Column stretched>
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
            <ProjectHistoryRoute project={project} activities={activities} />
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
    return (
      <Grid columns="equal" container style={{ overflowX: 'hidden', marginTop: '1em' }}>
        <Grid.Row>
          <Header as="h2" color="grey" floated="left">
            Assignment Details
          </Header>
          <AssignmentDetails />
        </Grid.Row>
        <Grid.Row />
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
              {this.renderCompletedList()}
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
    )
  }

  renderCompletedList = () => {
    const names = 'abcdefghijklmnopqrstuvwxyz'
    return (
      <List relaxed divided style={{ paddingBottom: '1em !important' }}>
        {_.map(names, letter => {
          return <List.Item>{`${letter.toUpperCase()}rian`}</List.Item>
        })}
      </List>
    )
  }

  renderIncompleteList = () => {
    return (
      <List relaxed divided style={{ paddingBottom: '1em !important' }}>
        <List.Item>
          <List.Content>Briaa</List.Content>
          <List.Content float="right">2/3 completed</List.Content>
        </List.Item>
        <List.Item>
          Briab<List.Content float="right">2/3 completed</List.Content>
        </List.Item>
        <List.Item>
          Briac<List.Content float="right">2/3 completed</List.Content>
        </List.Item>
        <List.Item>
          Briad<List.Content float="right">1/3 completed</List.Content>
        </List.Item>
        <List.Item>
          Briae<List.Content float="right">0/3 completed</List.Content>
        </List.Item>
      </List>
    )
  }

  render() {
    const { project } = this.props // One Project provided via

    const { activities } = this.state

    const isStudent = true

    return (
      <div>
        {isStudent ? (
          this.renderStudentView(project, activities)
        ) : (
          this.renderTeacherView(project, activities)
        )}
      </div>
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
