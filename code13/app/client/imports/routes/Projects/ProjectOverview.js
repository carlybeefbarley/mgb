import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import { Grid, Segment, Checkbox, Message, Icon, Header, Button, Popup } from 'semantic-ui-react'
import { showToast } from '/client/imports/modules'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import QLink from '../QLink'
import { Projects } from '/imports/schemas'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import ProjectMembersGET from '/client/imports/components/Projects/ProjectMembersGET'
import GamesAvailableGET from '/client/imports/components/Assets/GameAsset/GamesAvailableGET'
import Spinner from '/client/imports/components/Nav/Spinner'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import UserListRoute from '../Users/UserListRoute'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import AssetsAvailableGET from '/client/imports/components/Assets/AssetsAvailableGET'
import { logActivity } from '/imports/schemas/activity'
import ProjectForkGenerator from './ProjectForkGenerator'
import { makeChannelName } from '/imports/schemas/chats'
import { isUserSuperAdmin } from '/imports/schemas/roles'
import SpecialGlobals from '/imports/SpecialGlobals.js'
import Hotjar from '/client/imports/helpers/hotjar.js'

const buttonSty = { width: '220px', marginTop: '2px', marginBottom: '2px' }

const ProjectChatButton = ({ projId }) => {
  const channelName = makeChannelName({ scopeGroupName: 'Project', scopeId: projId })
  return (
    <QLink style={buttonSty} query={{ _fp: `chat.${channelName}` }} className="ui small primary button">
      <Icon name="chat" />
      View Project Team Chat
    </QLink>
  )
}

const ProjectOverview = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object, // Contains params.projectId  OR projectName
    user: PropTypes.object, // App.js gave us this from params.id OR params.username
    currUser: PropTypes.object,
  },

  componentDidMount() {
    // setTimeou just to be sure that everything is loaded
    setTimeout(() => Hotjar('trigger', 'project-overview', this.props.currUser), 200)
  },

  getInitialState: () => ({
    showAddUserSearch: false, // True if user search box is to be shown
    isForkPending: false, // True if a fork operation is pending
    isDeletePending: false, // True if a delete project operation is pending
    isDeleteComplete: false, // True if a delete project operation succeeded.
    compoundNameOfDeletedProject: null, // Used for User feedback after deleting project. using Compound name for full clarity
    confirmDeleteNum: -1, // If >=0 then it indicates how many assets will be deleted. Used to flag 2-stage DELETE PROJECT
  }),

  getMeteorData() {
    const { projectId, projectName } = this.props.params
    const { user } = this.props
    const sel = projectId ? { _id: projectId } : { ownerId: user._id, name: projectName }

    let handleForProject = Meteor.subscribe('projects.oneProject', sel)

    return {
      project: Projects.findOne(sel),
      loading: !handleForProject.ready(),
    }
  },

  canEdit() {
    return Boolean(
      !this.data.loading &&
        this.data.project &&
        this.props.currUser &&
        (this.data.project.ownerId === this.props.currUser._id || isUserSuperAdmin(this.props.currUser)),
    )
  },

  render() {
    const { project, loading } = this.data // One Project provided via getMeteorData()
    if (loading) return <Spinner />

    const { currUser, params } = this.props
    const { isDeleteComplete, compoundNameOfDeletedProject } = this.state
    const canEdit = this.canEdit()
    const isMyProject = currUser && project && project.ownerId === currUser._id
    const relativeProjectName = project ? `${isMyProject ? '' : `${project.ownerName}:`}${project.name}` : ''

    if (!project && isDeleteComplete)
      return (
        <Segment basic padded>
          <Helmet
            title={`Deleted Project: ${compoundNameOfDeletedProject}`}
            meta={[{ name: `Deleted Project: ${compoundNameOfDeletedProject}`, content: 'Project' }]}
          />
          <Message
            warning
            icon="trash"
            header={`You successfully deleted Project '${compoundNameOfDeletedProject}'`}
            content={
              <div>
                <br />
                <QLink to={`/u/${currUser.profile.name}/projects`}>View your Projects List.</QLink>
                &emsp;The ones that still survive, at least...
              </div>
            }
          />
        </Segment>
      )

    if (project && this.state.isDeleteComplete)
      return (
        <p>
          What the heck? Project '{compoundNameOfDeletedProject}' is still here? Err, refresh page maybe!?
        </p>
      )

    if (!project)
      return <ThingNotFound type="Project" id={params.projectId || params.projectName} defaultHead />
    const isPartOfTeam = !!currUser && (isMyProject || _.includes(project.memberIds, currUser._id))
    return (
      <Grid padded columns="equal">
        <Helmet
          title={`Project: ${relativeProjectName}`}
          meta={[{ name: `Project: ${relativeProjectName}`, content: 'Project' }]}
        />

        <Grid.Column style={{ minWidth: '250px', maxWidth: '250px' }}>
          <ProjectCard
            project={project}
            owner={this.props.user}
            canEdit={canEdit}
            handleFieldChanged={this.handleFieldChanged}
          />
          <QLink
            id="mgbjr-project-overview-assets"
            to={`/u/${project.ownerName}/assets`}
            style={buttonSty}
            query={{ project: project.name }}
            className="ui small primary button"
          >
            View Project Assets
          </QLink>
          {isPartOfTeam && <ProjectChatButton projId={project._id} />}

          {/* FORK PROJECT STUFF */}
          <Segment secondary compact style={{ width: '220px' }}>
            <Header content="Project Forking" />
            <span style={{ float: 'right' }}>
              <ProjectForkGenerator project={project} isForkPending={this.state.isForkPending} />
            </span>
            <div style={{ padding: '2px 2px 8px 2px' }}>
              <Checkbox
                disabled={!canEdit}
                checked={!!project.allowForks}
                onChange={() => this.handleFieldChanged({ allowForks: !project.allowForks })}
                label="Allow forks"
                title="Project Owner may allow other users to fork this Project and it's Assets"
              />
            </div>
            <Popup
              inverted
              wide="very"
              on="click"
              trigger={
                <Button
                  fluid
                  id="mgbjr-project-overview-fork"
                  disabled={!project.allowForks || !currUser}
                  size="small"
                  content={this.state.isForkPending ? 'Forking project...' : 'Fork Project'}
                />
              }
            >
              {this.state.isForkPending ? (
                <div>Forking... please wait..</div>
              ) : (
                <div>
                  <Header as="h4" content="Name for new Forked project" />
                  <div className="ui small fluid action input" style={{ minWidth: '300px' }}>
                    <input
                      type="text"
                      id="mgbjr-fork-project-name-input"
                      placeholder="New Project name"
                      defaultValue={project.name + ' (fork)'}
                      ref="forkNameInput"
                      size="22"
                    />
                    <Button icon="fork" ref="forkGoButton" onClick={this.handleForkGo} />
                  </div>
                </div>
              )}
            </Popup>
          </Segment>

          {this.renderRenameDeleteProject()}
        </Grid.Column>

        <Grid.Column>
          <Segment basic>
            <GamesAvailableGET
              header={<Header as="h3">Games in this Project</Header>}
              currUser={currUser}
              scopeToUserId={project.ownerId}
              scopeToProjectName={project.name}
            />
          </Segment>

          <QLink
            id="mgbjr-project-overview-assets"
            to={`/u/${project.ownerName}/assets`}
            query={{ project: project.name }}
          >
            <Header as="h3">Project Assets</Header>
          </QLink>
          <Segment basic>
            <AssetsAvailableGET scopeToUserId={project.ownerId} scopeToProjectName={project.name} />
          </Segment>

          <Header as="h3">{`Project Members (${project.memberIds.length} of ${isUserSuperAdmin(currUser)
            ? SpecialGlobals.quotas.SUdefaultNumMembersAllowedInProject
            : SpecialGlobals.quotas.defaultNumMembersAllowedInProject})`}</Header>
          <Segment basic>
            Project Members may create, edit or delete Assets in this Project &nbsp;
            <ProjectMembersGET
              project={project}
              enableRemoveButton={canEdit}
              enableLeaveButton={currUser ? currUser._id : null}
              handleRemove={this.handleRemoveMemberFromProject}
              handleLeave={this.handleMemberLeaveFromProject}
            />
          </Segment>
          <Segment basic>{this.renderAddPeople()}</Segment>
        </Grid.Column>
      </Grid>
    )
  },

  handleForkGo() {
    const newProjName = this.refs.forkNameInput.value
    showToast.info(`Forking project '${this.data.project.name}' to '${newProjName}..`)
    this.setState({ isForkPending: true })
    const forkCallParams = {
      sourceProjectName: this.data.project.name,
      sourceProjectOwnerId: this.data.project.ownerId,
      newProjectName: newProjName,
    }
    Meteor.call('Project.Azzets.fork', forkCallParams, (err, result) => {
      if (err) showToast.error(`Could not fork project: ${err}`)
      else {
        const msg = `Forked project '${this.data.project
          .name}' to '${newProjName}, creating ${result.numNewAssets} new Assets`
        logActivity('project.fork', msg)
        showToast.warning(msg)
        // TODO: navigate to /u/${currUser.username}/projects/${result.newProjectId}
      }
      this.setState({ isForkPending: false })
    })
  },

  // TODO - override 'Search Users" header level in UserListRoute
  // TODO - some better UI for Add People.
  handleClickUser(userId, userName) {
    if (this.state.isDeletePending) {
      showToast('Delete is still pending. Please wait..')
      return
    }

    var project = this.data.project
    var newData = { memberIds: _.union(project.memberIds, [userId]) }
    Meteor.call('Projects.update', project._id, newData, (error, result) => {
      if (error) showToast.error(`Could not add member ${userName} to project ${project.name}`)
      else
        // guntis - Is it ok that I've added project id, name as asset params?
        logActivity(
          'project.addMember',
          `Add Member ${userName} to project ${project.name}`,
          null,
          {
            dn_ownerName: project.ownerName,
            ownerId: project.ownerId,
            _id: project._id,
            name: project.name,
          },
          { toUserId: userId, toUserName: userName },
        )
    })
  },

  handleRemoveMemberFromProject(userId, userName) {
    if (this.state.isDeletePending) {
      showToast.warning('Delete is still pending. Please wait..')
      return
    }

    var project = this.data.project
    var newData = { memberIds: _.without(project.memberIds, userId) }

    Meteor.call('Projects.update', project._id, newData, (error, result) => {
      if (error) showToast.error(`Could not remove member ${userName} from project ${project.name}`)
      else
        logActivity(
          'project.removeMember',
          `Removed Member ${userName} from project ${project.name}`,
          null,
          {
            dn_ownerName: project.ownerName,
            ownerId: project.ownerId,
            _id: project._id,
            name: project.name,
          },
          { toUserId: userId, toUserName: userName },
        )
    })
  },

  handleMemberLeaveFromProject(userId, userName) {
    var project = this.data.project
    Meteor.call('Projects.leave', project._id, userId, (error, result) => {
      if (error) showToast.error(`Member ${userName} could not leave project ${project.name}`)
      else
        logActivity('project.leaveMember', `Member ${userName} left from project ${project.name}`, null, {
          dn_ownerName: project.ownerName,
          ownerId: project.ownerId,
          _id: project._id,
          name: project.name,
        })
    })
  },
  /**
   *   @param changeObj contains { field: value } settings.. e.g "profile.title": "New Title"
   */
  handleFieldChanged(changeObj) {
    const { project } = this.data

    Meteor.call('Projects.update', project._id, changeObj, error => {
      if (error) showToast.error(`Could not update project: ${error.reason}`)
      else {
        // Go through all the keys, log completion tags for each
        _.each(_.keys(changeObj), k => joyrideCompleteTag(`mgbjr-CT-project-set-field-${k}`))
      }
    })
  },

  handleDeleteProject() {
    var { name } = this.data.project
    Meteor.call('Projects.countNonDeletedAssets', name, (error, result) => {
      if (error) showToast.error(`Could not count Number of Assets in Project '${name}: ${error.reason}`)
      else this.setState({ confirmDeleteNum: result })
    })
  },

  handleConfirmedDeleteProject() {
    var { name, _id, ownerName } = this.data.project
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
  },

  // TODO - Activity - filter for project / user.  Maybe have a Project-related Activity Page

  renderRenameDeleteProject() {
    const { isDeleteComplete, isDeletePending, confirmDeleteNum } = this.state
    const canEdit = this.canEdit()

    if (!canEdit) return null

    return (
      <Segment secondary compact style={{ width: '220px' }}>
        <Header>Manage Project</Header>
        <div style={{ padding: '2px' }}>
          <Button
            fluid
            icon="edit"
            size="small"
            content="Rename"
            disabled={isDeleteComplete || isDeletePending}
            onClick={() => {
              showToast.warning('Rename Project has not yet been implemented..')
            }}
          />
        </div>
        <div style={{ padding: '2px' }}>
          <Button
            fluid
            icon={confirmDeleteNum < 0 ? <Icon color="red" name="trash" /> : null}
            size="small"
            disabled={isDeleteComplete || isDeletePending}
            content={
              confirmDeleteNum < 0 ? 'Delete' : `Confirm Delete of Project and ${confirmDeleteNum} Assets..?`
            }
            color={confirmDeleteNum < 0 ? null : 'red'}
            onClick={confirmDeleteNum < 0 ? this.handleDeleteProject : this.handleConfirmedDeleteProject}
          />
        </div>

        {isDeletePending && (
          <Message icon size="mini">
            <Icon name="circle notched" loading />
            <Message.Content>
              <Message.Header>Deleting Project</Message.Header>
              Please wait while we make sure it's really deleted...
            </Message.Content>
          </Message>
        )}
      </Segment>
    )
  },

  renderAddPeople() {
    if (!this.canEdit()) return null

    const project = this.data.project
    const relevantUserIds = [project.ownerId, ...project.memberIds]
    const active = this.state.showAddUserSearch

    return (
      <Segment secondary compact={!active}>
        <Button
          color="green"
          icon="add user"
          content="Add Members"
          disabled={this.state.isDeletePending}
          active={active}
          onClick={() => {
            this.setState({ showAddUserSearch: !active })
          }}
        />
        {!active ? null : (
          <UserListRoute
            location={this.props.location}
            handleClickUser={this.handleClickUser}
            excludeUserIdsArray={relevantUserIds}
            renderVertical
          />
        )}
      </Segment>
    )
  },
})

export default ProjectOverview
