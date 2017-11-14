import _ from 'lodash'
import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { Button, Header, Icon, Input, List, Message, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'
import { logActivity } from '/imports/schemas/activity'
import mgb1 from '/client/imports/helpers/mgb1'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'
import AssetCreateLink from '/client/imports/components/Assets/NewAsset/AssetCreateLink'

// Data Container stuff
import { Projects } from '/imports/schemas'
import { projectMakeSelector } from '/imports/schemas/projects'
import { createContainer } from 'meteor/react-meteor-data'

// Let's be smart about generating and remembering the user's
// default + desired assetPrefxes & mgb2projectnames for the new projects
const prefixMemo = {}
const mgb2projNameMemo = {}
const _defaultAssetPrefix = pName => _.toLower(pName.slice(0, 5)) + '.'
const _defaultMgb2ProjectName = pName => pName

// CSS smell
const _6pxSpcSty = { margin: '6px' }

//
// The 'Import MGB1 project' UI code
//

class ProjectImportMgb1RouteUI extends React.Component {
  static propTypes = {
    user: PropTypes.object, // Maybe absent if route is /assets
    currUser: PropTypes.object, // Currently Logged in user
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
    isSuperAdmin: PropTypes.bool,
    ownsProfile: PropTypes.bool,
    userProjects: PropTypes.array, // provided by the <ProjectImportMgb1RouteUI> container that wraps this component
    loadingUserProjects: PropTypes.bool, // provided by the <ProjectImportMgb1RouteUI> container that wraps this component
  }

  state = {
    mgb1Projects: {}, //  e.g. [ { 'foo': ['mechanics demos'] } ]
    confirmPendingForProjectName: null, // String with MGB1 username@@projectName to expand to show Import choices, or null to expand none of them
    importInProcess: false,
    assetPrefix: 'proj.',
    mgb2NewProjectName: '',
  }

  refreshMgb1ProjectNamesList = () => {
    const { user } = this.props
    const { profile } = user
    const { mgb1namesVerified } = profile

    if (!mgb1namesVerified || mgb1namesVerified === '') return

    _.each(mgb1namesVerified.split(','), mgb1vname => {
      Meteor.call('mgb1.getProjectNames', mgb1vname, (err, result) => {
        if (err) console.error(`mgb1.getProjectNames(${mgb1vname}) failed: `, err.reason)
        else {
          const newPList = _.clone(this.state.mgb1Projects)
          newPList[mgb1vname] = _.sortBy(result.projectNames, _.toLower)
          this.setState({ mgb1Projects: newPList })
        }
      })
    })
  }

  componentDidMount() {
    this.refreshMgb1ProjectNamesList()
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.user &&
      this.props.user.profile.mgb1namesVerified !== prevProps.user.profile.mgb1namesVerified
    )
      this.refreshMgb1ProjectNamesList()
  }

  // Used to maintain state.assetPrefix
  _onAssetPrefixChange = event => {
    this.setState({ assetPrefix: event.target.value })
    prefixMemo[this.state.confirmPendingForProjectName] = event.target.value
  }

  _onMgb2ProjectNameChange = event => {
    this.setState({ mgb2NewProjectName: event.target.value })
    mgb2projNameMemo[this.state.confirmPendingForProjectName] = event.target.value
  }

  handleImportProject = (mgb1Username, mgb1Projectname, mgb2NewProjectName, mgb2assetNamePrefix) => {
    var importParams = {
      // These params are described in Meteor.method('job.import.mgb1.project', ___)
      mgb1Username,
      mgb1Projectname,
      mgb2NewProjectName,
      mgb2assetNamePrefix,
      mgb2Username: Meteor.user().username,
      excludeTiles: false,
      excludeActors: false,
      excludeMaps: false,
      isDryRun: false,
    }
    this.setState({ importInProcess: true })
    Meteor.call('job.import.mgb1.project', importParams, (err, result) => {
      this.setState({ importInProcess: false })
      if (err) showToast.error(`Unable to import project: ${err.reason}`)
      else {
        this.setState({ confirmPendingForProjectName: null })
        showToast(`Completed import. New project id = ${result.newProjectId}`)
        logActivity(
          'project.create',
          `Imported MGB1 project ${mgb1Username}/${mgb1Projectname} to ${mgb2NewProjectName}`,
        )
      }
    })
  }

  /*
   *  @param changeObj contains { field: value } settings.. e.g "profile.mgb1namesVerified": "New Title"
   */
  handleProfileFieldChanged = changeObj => {
    const m1verified = changeObj['profile.mgb1namesVerified']
    if (m1verified || m1verified === '') {
      // mgb1namesVerified has some additional handling..
      Meteor.call('User.update.mgb1namesVerified', this.props.user._id, m1verified, error => {
        if (error) console.log("Could not update 'profile.mgb1namesVerified': ", error.reason)
      })
    } else console.error('handleProfileFieldChanged() does not know how to update changeObj: ', changeObj)
  }

  render() {
    const { user, isSuperAdmin, userProjects, ownsProfile, loadingUserProjects } = this.props
    const { profile, username } = user
    const { mgb1Projects, importInProcess, confirmPendingForProjectName } = this.state
    const canImport = ownsProfile // TODO.. maybe add stuff like Projects Quota limit etc

    // Verified names
    const mgb1vnamesArray =
      profile.mgb1namesVerified && profile.mgb1namesVerified.length > 0
        ? profile.mgb1namesVerified.split(',')
        : null
    // Self-claimed names
    const mgb1cnamesArray =
      profile.mgb1name && profile.mgb1name.length > 0 ? profile.mgb1name.split(',') : null

    return (
      <Segment basic>
        <Helmet title="Import MGBv1 Projects" meta={[{ name: 'description', content: 'Import Projects' }]} />
        <Header as="h2" content="Import MGBv1 Projects" />
        <Segment raised>
          <ExplanationMessage />
          <Segment>
            <Header sub>MGB1 account status for @{username} in MGBv2</Header>
            <List>
              <List.Item>
                Self-claimed MGB1 names:
                <MgbUserNames names={mgb1cnamesArray} validationNamesList={mgb1vnamesArray} />
              </List.Item>
              <List.Item>
                ADMIN-verified ( ask using <ChatPanelRef /> ) MGB1 names:
                <MgbUserNames names={mgb1vnamesArray} validationNamesList={mgb1cnamesArray} />
              </List.Item>
            </List>
            {isSuperAdmin && (
              <Segment raised color="red">
                <Icon color="red" name="bomb" />
                <span data-tooltip="Comma-separated names, no spaces">
                  SuperAdmin EDIT of verified MGB1 names:{' '}
                </span>
                <InlineEdit
                  validate={validate.mgb1names}
                  activeClassName="editing"
                  placeholder="(add names here)"
                  text={profile.mgb1namesVerified || ''}
                  paramName="profile.mgb1namesVerified"
                  change={this.handleProfileFieldChanged}
                  isDisabled={false}
                />
              </Segment>
            )}
          </Segment>
          {_.map(mgb1vnamesArray, mgb1vname => (
            <Segment key={mgb1vname}>
              <Header as="h3">
                <img className="ui avatar image" style={_6pxSpcSty} src={mgb1.getUserAvatarUrl(mgb1vname)} />
                Projects owned by '{mgb1vname}' in MGBv1:
              </Header>
              {loadingUserProjects && <p>Loading...</p>}
              <List>
                {_.map(mgb1Projects[mgb1vname], mgb1pName => (
                  <List.Item key={mgb1pName}>
                    <List.Content>
                      <Button
                        compact
                        fluid
                        disabled={!canImport || importInProcess}
                        content={`Import '${mgb1pName}' from MGB v1...`}
                        onClick={() =>
                          this.setState({
                            confirmPendingForProjectName:
                              `${mgb1vname}@@${mgb1pName}` === confirmPendingForProjectName
                                ? null
                                : `${mgb1vname}@@${mgb1pName}`,
                            assetPrefix: prefixMemo[mgb1pName] || _defaultAssetPrefix(mgb1pName),
                            mgb2NewProjectName:
                              mgb2projNameMemo[mgb1pName] || _defaultMgb2ProjectName(mgb1pName),
                          })}
                      />
                      <RelatedMgb2projects
                        mgb1Username={mgb1vname}
                        mgb1Projectname={mgb1pName}
                        user={user}
                        userProjects={userProjects}
                      />
                      {confirmPendingForProjectName === `${mgb1vname}@@${mgb1pName}` && (
                        <div style={{ padding: '8px' }}>
                          <span>Asset Prefix: </span>
                          <Input
                            disabled={!canImport || importInProcess}
                            placeholder="asset prefix"
                            value={this.state.assetPrefix}
                            onChange={this._onAssetPrefixChange}
                          />
                          &emsp;
                          <span>New Project Name: </span>
                          <Input
                            placeholder="Mgb2 project to create..."
                            disabled={!canImport || importInProcess}
                            value={this.state.mgb2NewProjectName}
                            onChange={this._onMgb2ProjectNameChange}
                          />
                          &emsp;
                          <Button
                            compact
                            color="green"
                            disabled={!canImport || importInProcess}
                            content={importInProcess ? 'Importing...' : 'CONFIRM IMPORT'}
                            onClick={() =>
                              this.handleImportProject(
                                mgb1vname,
                                mgb1pName,
                                this.state.mgb2NewProjectName,
                                this.state.assetPrefix,
                              )}
                          />
                        </div>
                      )}
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Segment>
          ))}
        </Segment>
      </Segment>
    )
  }
}

//
// Some simple stateless sub-Components used by <ProjectImportMgb1RouteUI>..
// They are factored out here in order to keep the main code above a bit cleaner
//

const MgbUserNames = ({ names, validationNamesList }) => (
  <div>
    {names ? (
      _.map(names, uname => (
        <div key={uname}>
          {validationNamesList && (
            <Icon style={_6pxSpcSty} name={_.includes(validationNamesList, uname) ? 'check' : 'question'} />
          )}
          <img className="ui avatar image" style={_6pxSpcSty} src={mgb1.getUserAvatarUrl(uname)} />
          {uname}
        </div>
      ))
    ) : (
      <small>(none)</small>
    )}
  </div>
)

const ChatPanelRef = () => (
  <QLink query={{ _fp: 'chat' }}>
    <Icon name="chat" />chat panel
  </QLink>
)

const ExplanationMessage = () => (
  <Message info icon>
    <Icon name="space shuttle" />
    <Message.Content>
      <Message.Header>At your service!</Message.Header>
      <p>
        Verified users can import their projects from their linked accounts in our prior flash-based 'MGBv1'
        system as follows:
      </p>
      <ol>
        <li>
          State your claimed MGBv1 names using the <em>MGBv1 username =</em> area on your Profile Page
        </li>
        <li>
          Contact us using the <ChatPanelRef /> to request verification of those prior MGBv1 account names
        </li>
        <li>We will message you via your wall when it is verified</li>
        <li>Import your old games using the wonderful UI below</li>
        <li>
          Create new gameConfig Assets to list start maps of any games (so that others can find and play your
          games)
        </li>
      </ol>
    </Message.Content>
  </Message>
)

const RelatedMgb2projects = ({ user, userProjects, mgb1Username, mgb1Projectname }) => {
  if (!user || !userProjects || userProjects.length === 0) return null

  const relatedProjects = _.filter(
    userProjects,
    p => p.mgb1 && p.mgb1.mgb1username === mgb1Username && p.mgb1.mgb1ProjectName === mgb1Projectname,
  )
  if (relatedProjects.length === 0) return null

  return (
    <div>
      {_.map(relatedProjects, p => (
        <Segment key={p._id} attached>
          Imported as <QLink to={`/u/${p.ownerName}/projects/${p.name}`}>{p.name}</QLink>.&emsp; Progress:{' '}
          <small>{p.mgb1.importProgress}</small>.&emsp;
          <AssetCreateLink
            assetKind="game"
            assetName={`${p.mgb1.mgb2assetNamePrefix || _defaultAssetPrefix(p.name)}${p.name}`}
            projectName={p.name}
            classNames="small right floated"
            label="Create gameConfig Asset"
          />
        </Segment>
      ))}
    </div>
  )
}

const ProjectImportMgb1Route = createContainer(({ user }) => {
  const userId = user ? user._id : null

  const handleForProjects = userId ? Meteor.subscribe('projects.byUserId', userId) : null
  const projectsReady = handleForProjects === null ? true : handleForProjects.ready()
  const projectSelector = projectMakeSelector(userId)

  return {
    userProjects: Projects.find(projectSelector).fetch(),
    loadingUserProjects: !projectsReady,
  }
}, ProjectImportMgb1RouteUI)

// Export the UI, wrapped by the data container
export default ProjectImportMgb1Route
