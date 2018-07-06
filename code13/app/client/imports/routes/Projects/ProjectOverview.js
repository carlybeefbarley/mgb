import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { Divider, Form, Grid, Input, Segment, Message, Icon, Header, Button, Popup } from 'semantic-ui-react'
import { showToast } from '/client/imports/modules'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { Projects, Users } from '/imports/schemas'
import ProjectMembersGET from '/client/imports/components/Projects/ProjectMembersGET'
import ProjectHistoryRoute from './ProjectHistoryRoute'
import GamesAvailableGET from '/client/imports/components/Assets/GameAsset/GamesAvailableGET'
import AssetCreateNewModal from '/client/imports/components/Assets/NewAsset/AssetCreateNewModal'
import Spinner from '/client/imports/components/Nav/Spinner'
import { joyrideStore } from '/client/imports/stores'
import UserListRoute from '../Users/UserListRoute'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import AssetsAvailableGET from '/client/imports/components/Assets/AssetsAvailableGET'
import { logActivity } from '/imports/schemas/activity'
import ProjectForkGenerator from './ProjectForkGenerator'
import { makeChannelName } from '/imports/schemas/chats'
import { isUserSuperAdmin, doesUserHaveRole, roleTeacher } from '/imports/schemas/roles'
import SpecialGlobals from '/imports/SpecialGlobals.js'
import Hotjar from '/client/imports/helpers/hotjar.js'
import { withMeteorData } from '../../hocs'
import { getProjectAvatarUrl } from '../../helpers/assetFetchers'
import AssignmentCardGET from '/client/imports/components/Assets/AssignmentCardGET'
import ChatPanel from '/client/imports/components/Chat/ChatPanel'
import AssignmentProjectListGET from '/client/imports/routes/Projects/AssignmentProjectListGET.js'
import WorkState from '/client/imports/components/Controls/WorkState'

class ProjectOverview extends Component {
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
    assignment: null,
  }

  componentDidMount() {
    // setTimeout just to be sure that everything is loaded
    setTimeout(() => Hotjar('trigger', 'project-overview', this.props.currUser), 200)
    this.getHistory()
  }

  getHistory = () => {
    const activityLimit = 6
    Meteor.call(
      'Activity.getActivitiesByProjectName',
      this.props.params.projectName,
      activityLimit,
      (error, activities) => {
        if (error) console.warn(error)
        else {
          this.setState({ activities })
        }
      },
    )
  }

  getAssignment = assignment => {
    this.setState({ assignment })
  }

  canEdit(project, currUser, loading) {
    return !loading && project && currUser && (project.ownerId === currUser._id || isUserSuperAdmin(currUser))
  }

  handleForkGo = () => {
    const newProjName = this.refs.forkNameInput.inputRef.value
    showToast.info(`Forking project '${this.props.project.name}' to '${newProjName}..`)
    this.setState({ isForkPending: true })
    const forkCallParams = {
      sourceProjectName: this.props.project.name,
      sourceProjectOwnerId: this.props.project.ownerId,
      newProjectName: newProjName,
    }
    Meteor.call('Project.Azzets.fork', forkCallParams, (err, result) => {
      if (err || !result) showToast.error(`Could not fork project: ${err}`)
      else {
        if (result.error) {
          showToast.error(result.message)
        } else {
          const msg = `Forked project '${this.props.project
            .name}' to '${newProjName}, creating ${result.numNewAssets} new Assets`
          logActivity('project.fork', msg)
          showToast.warning(msg)
          // TODO: navigate to /u/${currUser.username}/projects/${result.newProjectId}
        }
      }
      this.setState({ isForkPending: false })
    })
  }

  // TODO - override 'Search Users" header level in UserListRoute
  // TODO - some better UI for Add People.
  handleClickUser = (userId, userName) => {
    if (this.state.isDeletePending) {
      showToast.warning('Delete is still pending. Please wait..')
      return
    }

    const project = this.props.project
    const newData = { memberIds: _.union(project.memberIds, [userId]) }
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
  }

  handleRemoveMemberFromProject = (userId, userName) => {
    if (this.state.isDeletePending) {
      showToast.warning('Delete is still pending. Please wait..')
      return
    }

    var project = this.props.project
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
  }

  handleMemberLeaveFromProject = (userId, userName) => {
    var project = this.props.project
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
  }

  // As specified in workStates.js, WorkStates have the following correspondence to assignment statuses:
  // broken - needs review, working - needs work, polished - complete
  handleWorkStateChange = newWorkState => {
    const { project } = this.props
    const oldState = project.workState
    if (newWorkState !== oldState) {
      Meteor.call('Projects.update', project._id, { workState: newWorkState }, (err, res) => {
        if (err) showToast.error(err.reason)
      })
      logActivity(
        'project.workState',
        `WorkState changed from ${oldState} to ${newWorkState}`,
        {
          dn_ownerName: project.ownerName,
          ownerId: project.ownerId,
          _id: project._id,
          name: project.name,
        },
        project,
      )
    }
  }

  handleWorkStateCancel = () => {
    const { _id, workState } = this.props.project
    if (workState === 'working' || workState === 'polished') {
      // Teacher cancelling 'needs work' or 'completed' workstate change
      this.handleWorkStateChange('broken')
    } else if (workState === 'broken') {
      // Student cancelling 'needs review' workstate change
      this.handleWorkStateChange('unknown')
    }
  }

  /**
   *   @param changeObj contains { field: value } settings.. e.g "profile.title": "New Title"
   */
  handleFieldChanged = changeObj => {
    const { project } = this.props

    Meteor.call('Projects.update', project._id, changeObj, error => {
      if (error) showToast.error(`Could not update project: ${error.reason}`)
      else {
        // Go through all the keys, log completion tags for each
        _.each(_.keys(changeObj), k => joyrideStore.completeTag(`mgbjr-CT-project-set-field-${k}`))
      }
    })
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

  render() {
    const { currUser, currUserProjects, loading, params, project } = this.props // One Project provided via

    const {
      activities,
      compoundNameOfDeletedProject,
      confirmDeleteNum,
      isDeleteComplete,
      isDeletePending,
      isForkPending,
      showAddUserSearch,
    } = this.state

    if (loading) return <Spinner />

    const canEdit = this.canEdit(project, currUser, loading)
    const isMyProject = currUser && project && project.ownerId === currUser._id
    const relativeProjectName = project ? `${isMyProject ? '' : `${project.ownerName}:`}${project.name}` : ''
    const isTeacher = doesUserHaveRole(currUser, roleTeacher)
    if (!project && isDeleteComplete)
      return (
        <Segment basic>
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

    if (project && isDeleteComplete)
      return (
        <p>
          What the heck? Project '{compoundNameOfDeletedProject}' is still here? Err, refresh page maybe!?
        </p>
      )

    if (!project)
      return <ThingNotFound type="Project" id={params.projectId || params.projectName} defaultHead />

    const isPartOfTeam = !!currUser && (isMyProject || _.includes(project.memberIds, currUser._id))

    const sideBarColumnStyle = { minWidth: '250px', maxWidth: '250px' }

    const rowStyle = {
      minHeight: '20em',
      maxHeight: '20em',
    }

    const secondRowStyle = {
      minHeight: '15em',
      maxHeight: '15em',
    }

    return (
      <div style={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <Helmet
          title={`Project: ${relativeProjectName}`}
          meta={[{ name: `Project: ${relativeProjectName}`, content: 'Project' }]}
        />
        <Grid columns={16} padded stackable>
          <Grid.Row>
            <Grid.Column width={3} />
            <Grid.Column width={10}>
              <div>
                <Header style={{ margin: '5px' }} as="h1" textAlign="center" dividing>
                  {project.name}
                </Header>
                {project.assignmentId && (
                  <div style={{ width: '100%', marginBottom: '1em' }}>
                    <div style={{ float: 'left' }}>
                      <WorkState isAssignment workState={project.workState} />
                    </div>
                    <div style={{ float: 'right' }}>
                      {isTeacher ? (
                        <Button.Group style={{ marginRight: '5px' }}>
                          <Button
                            secondary
                            style={{ width: '10em' }}
                            onClick={() => this.handleWorkStateChange('working')}
                          >
                            Needs Work
                          </Button>
                          <Button.Or />
                          <Button
                            primary
                            style={{ width: '10em' }}
                            onClick={() => this.handleWorkStateChange('polished')}
                          >
                            Complete
                          </Button>
                        </Button.Group>
                      ) : (
                        canEdit && (
                          <Button
                            primary
                            labelPosition="left"
                            icon="calendar check"
                            disabled={project.workState === 'broken' || project.workState === 'polished'}
                            content={'Submit Assignment'}
                            onClick={() => this.handleWorkStateChange('broken')}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Grid.Column>
            <Grid.Column width={3} />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3} />
            <Grid.Column width={3}>
              <Segment raised color="blue" textAlign="center" style={rowStyle}>
                <p>
                  <ImageShowOrChange
                    header="Project Avatar"
                    imageSrc={getProjectAvatarUrl(project)}
                    canEdit={canEdit}
                    canLinkToSrc={canEdit}
                    handleChange={(newUrl, avatarId) => this.handleFieldChanged({ avatarAssetId: avatarId })}
                  />
                </p>
                {/* <Form>
                   FORK PROJECT STUFF...not using right now
                  <Form.Field>
                    {' '}
                    <Popup
                      on="click"
                      position="right center"
                      trigger={
                        <ProjectForkGenerator
                          project={project}
                          isForkPending={isForkPending}
                          id="mgbjr-project-overview-fork"
                          labelPosition="left"
                          disabled={!project.allowForks || !currUser || isForkPending}
                          loading={isForkPending}
                        />
                      }
                    >
                      {isForkPending ? (
                        <div>Forking... please wait..</div>
                      ) : (
                        <div>
                          <Header as="h4" content="New name for forked project" />
                          <Input
                            action
                            type="text"
                            ref="forkNameInput"
                            id="mgbjr-fork-project-name-input"
                            placeholder="New Project name"
                            defaultValue={project.name + ' (fork)'}
                            size="small"
                          >
                            <input />
                            <Button icon="fork" onClick={this.handleForkGo} />
                          </Input>
                        </div>
                      )}
                    </Popup>
                  </Form.Field>
                </Form> */}

                <Button icon="chat" color="blue" content="Assignment Chat" />
                {this.canEdit(project, currUser, loading) && (
                  <Form>
                    <Form.Button
                      style={{ marginTop: '1em' }}
                      color="red"
                      labelPosition="left"
                      icon="trash"
                      disabled={isDeleteComplete || isDeletePending}
                      content={confirmDeleteNum < 0 ? 'Delete' : `Confirm Delete`}
                      onClick={
                        confirmDeleteNum < 0 ? this.handleDeleteProject : this.handleConfirmedDeleteProject
                      }
                    />
                    {/* TODO: make this a basic Modal */}
                    {isDeletePending && (
                      <Message icon size="mini">
                        <Icon name="circle notched" loading />
                        <Message.Content>
                          <Message.Header>Deleting Project</Message.Header>
                          Please wait while we make sure it's really deleted...
                        </Message.Content>
                      </Message>
                    )}
                  </Form>
                )}
              </Segment>
            </Grid.Column>
            <Grid.Column width={7}>
              <Segment raised color="green" style={rowStyle}>
                <Header as="h2" content="Assignment Instructions" />
                <AssignmentCardGET
                  canEdit={isTeacher}
                  assignmentId={project.assignmentId}
                  getAssignment={this.getAssignment}
                />
              </Segment>
            </Grid.Column>
            {/* <Grid.Column width={3} /> */}
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3} />
            <Grid.Column width={5}>
              <Segment raised color="yellow" style={secondRowStyle}>
                <div>
                  <Header as="h3" style={{ flex: '0 0 auto' }}>
                    Games
                  </Header>
                  <GamesAvailableGET
                    canEdit={canEdit}
                    currUser={currUser}
                    scopeToUserId={project.ownerId}
                    scopeToProjectName={project.name}
                  />
                </div>
              </Segment>
            </Grid.Column>
            <Grid.Column width={5}>
              <Segment raised color="pink" style={secondRowStyle}>
                <div>
                  <Header as="h3" style={{ flex: '0 0 auto' }}>
                    Recent Activity
                  </Header>
                  <ProjectHistoryRoute project={project} activities={activities} />
                </div>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3} />
            <Grid.Column width={10}>
              <Segment raised color="purple" style={secondRowStyle}>
                <Header
                  as="h2"
                  floated="left"
                  style={{ cursor: 'pointer' }}
                  onClick={() => utilPushTo(null, `/u/${project.name}/assets`)}
                >
                  Assets
                </Header>
                {canEdit && (
                  <AssetCreateNewModal
                    currUser={currUser}
                    currUserProjects={currUserProjects}
                    buttonProps={{ floated: 'right' }}
                    viewProps={{
                      showProjectSelector: false,
                      suggestedParams: { projectName: project.name },
                    }}
                  />
                )}
                <Divider fitted hidden clearing />
                <AssetsAvailableGET scopeToUserId={project.ownerId} scopeToProjectName={project.name} />
              </Segment>
            </Grid.Column>
            <Grid.Column width={3} />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3} />
            <Grid.Column width={10}>
              <Segment raised color="orange" style={secondRowStyle}>
                <div>
                  <Header as="h2" floated="left">
                    Collaborators{' '}
                    <small>
                      ({project.memberIds.length} of{' '}
                      {isUserSuperAdmin(currUser) ? (
                        SpecialGlobals.quotas.SUdefaultNumMembersAllowedInProject
                      ) : (
                        SpecialGlobals.quotas.defaultNumMembersAllowedInProject
                      )})
                    </small>
                  </Header>
                </div>
              </Segment>
            </Grid.Column>
            <Grid.Column width={3} />
          </Grid.Row>
          {/* <Grid.Column width={3} /> */}
        </Grid>
      </div>

      // <div style={{ height: '100%', overflowX: 'hidden' }}>
      //   <Grid columns={16} padded stackable>

      //     <Grid.Row>
      //       <Grid.Column width={4} textAlign="center" style={sideBarColumnStyle}>
      //

      //       </Grid.Column>
      //       <Grid.Column>
      //         {/* {project.assignmentId && (
      //           <Grid>
      //             <div style={{ width: '100%', marginBottom: '1em' }}>
      //               <div style={{ float: 'left' }}>
      //                 <WorkState isAssignment workState={project.workState} />
      //               </div>
      //               <div style={{ float: 'right' }}>
      //                 {isTeacher ? (
      //                   <Button.Group style={{ marginRight: '5px' }}>
      //                     <Button
      //                       secondary
      //                       style={{ width: '10em' }}
      //                       onClick={() => this.handleWorkStateChange('working')}
      //                     >
      //                       Needs Work
      //                     </Button>
      //                     <Button.Or />
      //                     <Button
      //                       primary
      //                       style={{ width: '10em' }}
      //                       onClick={() => this.handleWorkStateChange('polished')}
      //                     >
      //                       Complete
      //                     </Button>
      //                   </Button.Group>
      //                 ) : (
      //                   canEdit && (
      //                     <Button
      //                       primary
      //                       labelPosition="left"
      //                       icon="calendar check"
      //                       disabled={project.workState === 'broken' || project.workState === 'polished'}
      //                       content={'Submit Assignment'}
      //                       onClick={() => this.handleWorkStateChange('broken')}
      //                     />
      //                   )
      //                 )}
      //               </div>
      //             </div>
      //             <div>
      //               <Header as="h2" color="grey" floated="left">
      //                 Assignment Instructions
      //               </Header>
      //               <AssignmentCardGET
      //                 canEdit={isTeacher}
      //                 assignmentId={project.assignmentId}
      //                 getAssignment={this.getAssignment}
      //               />
      //             </div>
      //           </Grid>
      //         )} */}

      //         <Grid columns="equal">
      //           <Grid.Column stretched>
      //             <div>
      //               <Header as="h2" color="grey" style={{ flex: '0 0 auto' }}>
      //                 Games
      //               </Header>
      //               <GamesAvailableGET
      //                 canEdit={canEdit}
      //                 currUser={currUser}
      //                 scopeToUserId={project.ownerId}
      //                 scopeToProjectName={project.name}
      //               />
      //             </div>
      //           </Grid.Column>
      //           <Grid.Column stretched>
      //             <Header
      //               as="h2"
      //               color="grey"
      //               floated="left"
      //               // Stretched columns force the width to be 100%
      //               // The text only should be clickable, limit the width to the length of the text
      //               style={{ flex: '0 0 auto', width: '3.75em', cursor: 'pointer' }}
      //               id="mgbjr-project-activity"
      //               onClick={() =>
      //                 utilPushTo(null, `/u/${project.ownerName}/projects/${project.name}/activity`)}
      //             >
      //               Activity
      //             </Header>
      //             <ProjectHistoryRoute project={project} activities={activities} />
      //           </Grid.Column>
      //         </Grid>

      //         <Grid columns="1">
      //           <Grid.Column>
      //             <Header
      //               as="h2"
      //               color="grey"
      //               floated="left"
      //               style={{ cursor: 'pointer' }}
      //               onClick={() => utilPushTo(null, `/u/${project.name}/assets`)}
      //             >
      //               Assets
      //             </Header>
      //             {canEdit && (
      //               <AssetCreateNewModal
      //                 currUser={currUser}
      //                 currUserProjects={currUserProjects}
      //                 buttonProps={{ floated: 'right' }}
      //                 viewProps={{
      //                   showProjectSelector: false,
      //                   suggestedParams: { projectName: project.name },
      //                 }}
      //               />
      //             )}
      //             <Divider fitted hidden clearing />
      //             <AssetsAvailableGET scopeToUserId={project.ownerId} scopeToProjectName={project.name} />
      //           </Grid.Column>
      //           <Grid.Column>
      //             <Header as="h2" color="grey" floated="left">
      //               Members{' '}
      //               <small>
      //                 ({project.memberIds.length} of{' '}
      //                 {isUserSuperAdmin(currUser) ? (
      //                   SpecialGlobals.quotas.SUdefaultNumMembersAllowedInProject
      //                 ) : (
      //                   SpecialGlobals.quotas.defaultNumMembersAllowedInProject
      //                 )})
      //               </small>
      //             </Header>
      //             {canEdit && (
      //               <Button
      //                 color={showAddUserSearch ? 'black' : 'green'}
      //                 icon={showAddUserSearch ? 'checkmark' : 'add user'}
      //                 content={showAddUserSearch ? "I'm done" : 'Add Members'}
      //                 floated="right"
      //                 disabled={isDeletePending}
      //                 onClick={() => {
      //                   this.setState({ showAddUserSearch: !showAddUserSearch })
      //                 }}
      //               />
      //             )}
      //             <Divider fitted hidden clearing />
      //             <p>Project Members may create, edit or delete Assets in this Project.</p>
      //             {showAddUserSearch && (
      //               <UserListRoute
      //                 location={{ ...location, query: { ...location.query, limit: 13 } }}
      //                 handleClickUser={this.handleClickUser}
      //                 excludeUserIdsArray={[project.ownerId, ...project.memberIds]}
      //                 renderVertical
      //               />
      //             )}

      //             <ProjectMembersGET
      //               project={project}
      //               enableRemoveButton={canEdit}
      //               enableLeaveButton={currUser ? currUser._id : null}
      //               handleRemove={this.handleRemoveMemberFromProject}
      //               handleLeave={this.handleMemberLeaveFromProject}
      //             />
      //           </Grid.Column>
      //         </Grid>
      //       </Grid.Column>
      //     </Grid.Row>
      //     <Divider hidden section />
      //   </Grid>
      // </div>
    )
  }
}

export default withMeteorData(props => {
  const { projectName, username } = props.params // This is the data of the TARGET project, not the current user.
  // const handleForProjectOwner = Meteor.subscribe('user.byName', userName)
  // const projectOwner = Users.findOne({ username: userName })

  const projSelector = { name: projectName, ownerName: username }
  const handleForProject = Meteor.subscribe('projects.oneProject', projSelector)
  const project = Projects.findOne(projSelector)

  return {
    project,
    loading: !handleForProject.ready(),
  }
})(ProjectOverview)
