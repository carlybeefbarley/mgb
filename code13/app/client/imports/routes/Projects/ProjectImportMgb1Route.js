import _ from 'lodash'
import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { Button, Header, Icon, Input, List, Message, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/routes/App'
import { logActivity } from '/imports/schemas/activity'
import mgb1 from '/client/imports/helpers/mgb1'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'

// Data Container stuff
import { Projects } from '/imports/schemas'
import { projectMakeSelector } from '/imports/schemas/projects'
import { createContainer } from 'meteor/react-meteor-data'


// Let's be smart about generating and remembering the user's 
// default + desired assetPrefxes & mgb2projectnames for the new projects
const prefixMemo = {}
const mgb2projNameMemo = {}
const _defaultAssetPrefix = pName => (_.toLower(pName.slice(0, 5)) + '.')
const _defaultMgb2ProjectName = pName => (pName)

//
// The 'Import MGB1 project' UI code
//

class ProjectImportMgb1RouteUI extends React.Component {

  static propTypes = {
    user:             PropTypes.object,         // Maybe absent if route is /assets
    currUser:         PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array,          // Projects list for currently logged in user
    isSuperAdmin:     PropTypes.bool,
    ownsProfile:      PropTypes.bool,
    userProjects:     PropTypes.array,          // provided by the <ProjectImportMgb1RouteUI> container that wraps this component
    loadingUserProjects: PropTypes.bool         // provided by the <ProjectImportMgb1RouteUI> container that wraps this component
  }

  state = {
    mgb1Projects:                 {},          //  e.g. [ { 'foo': ['mechanics demos'] } ]
    confirmPendingForProjectName: null,        // String with MGB1 projectName to expand to show Import choices, or null to expand none of them
    importInProcess:              false, 
    assetPrefix:                  'proj.',
    mgb2NewProjectName:           ''
  }

  refreshProjectList = () => {
    const { user } = this.props
    const { profile } = user
    const { mgb1namesVerified } = profile

    if (!mgb1namesVerified || mgb1namesVerified === '')
      return 

    Meteor.call( 'mgb1.getProjectNames', mgb1namesVerified, (err, result) => {
      if (err) 
        console.error('mgb1.getProjectNames failed: ', err.reason)
      else
      {
        const newPList = _.clone( this.state.mgb1Projects )
        newPList[mgb1namesVerified] = _.sortBy(result.projectNames, _.toLower)
        this.setState( { mgb1Projects: newPList } )
      }
    })
  }

  componentDidMount() {
    this.refreshProjectList()
  }

  componentDidUpdate(prevProps) {
    if (this.props.user && this.props.user.profile.mgb1namesVerified !== prevProps.user.profile.mgb1namesVerified)
      this.refreshProjectList()    
  }
  
  // Used to maintain state.assetPrefix
  _onAssetPrefixChange = event => { 
    this.setState( { assetPrefix: event.target.value } ) 
    prefixMemo[this.state.confirmPendingForProjectName] = event.target.value
  }

  _onMgb2ProjectNameChange = event => { 
    this.setState( { mgb2NewProjectName: event.target.value } ) 
    mgb2projNameMemo[this.state.confirmPendingForProjectName] = event.target.value
  }

  handleImportProject = (mgb1Username, mgb1Projectname, mgb2NewProjectName, mgb2assetNamePrefix) => 
  {
    var importParams = {    
      // These params are described in Meteor.method('job.import.mgb1.project', ___)
      mgb1Username, 
      mgb1Projectname, 
      mgb2NewProjectName, 
      mgb2assetNamePrefix, 
      mgb2Username:   Meteor.user().username,
      excludeTiles:   false,
      excludeActors:  false,
      excludeMaps:    false,
      isDryRun:       false      
    }
    this.setState( { importInProcess: true } )
    Meteor.call('job.import.mgb1.project', importParams, (err, result) => {
      this.setState( { importInProcess: false } )
      if (err)      
        showToast(`Unable to import project: ${err.reason}`, 'error')
      else {
        this.setState( { confirmPendingForProjectName: null } )
        showToast(`Completed import. New project id = ${result.newProjectId}`)
        logActivity("project.create",  `Imported MGB1 project ${mgb1Username}/${mgb1Projectname} to ${mgb2NewProjectName}`)
      }
    })
  }

  /*
   *  @param changeObj contains { field: value } settings.. e.g "profile.mgb1namesVerified": "New Title"
   */
  handleProfileFieldChanged = changeObj =>
  {
    const m1verified = changeObj["profile.mgb1namesVerified"]
    if (m1verified || m1verified === "")
    {
      // mgb1namesVerified has some additional handling.. 
      Meteor.call('User.update.mgb1namesVerified', this.props.user._id, m1verified, error => {
        if (error)
          console.log("Could not update 'profile.mgb1namesVerified': ", error.reason)
      })
    }
    else
      console.error("handleProfileFieldChanged() does not know how to update changeObj: ", changeObj)
  }

  render() {
    const { user, isSuperAdmin, userProjects, ownsProfile, loadingUserProjects } = this.props
    const { profile, username } = user
    const { mgb1Projects, importInProcess, confirmPendingForProjectName } = this.state
    const canImport = ownsProfile    // TODO.. maybe add stuff like Projects Quota limit etc
    
    return (
      <Segment basic>
        <Helmet
          title="Import MGB1 Projects"
          meta={[ {"name": "description", "content": "Import Projects"} ]}
        />
        <Header as='h2' content='Import MGB1 Projects'/>
        <Segment raised>
          <ExplanationMessage />
          <Segment>
            <Header sub>MGB1 account status for @{username} in MGBv2</Header>
            <List bulleted>
              <List.Item>
                Self-claimed MGB1 name: <NameOrNone nameStr={profile.mgb1name} /> 
                { profile.mgb1name && 
                  <img className="ui avatar image" src={mgb1.getUserAvatarUrl(profile.mgb1name)} /> 
                }
              </List.Item>
              <List.Item>
                ADMIN-verified MGB1 names: <NameOrNone nameStr={profile.mgb1namesVerified} />
                { profile.mgb1namesVerified && 
                  <img className="ui avatar image" src={mgb1.getUserAvatarUrl(profile.mgb1namesVerified)} /> 
                }
              </List.Item>
              { isSuperAdmin && 
                <List.Item>
                  <List.Icon color='red' name='bomb'/>
                  <List.Content>
                    <span data-tooltip='Comma-separated names, no spaces'>SuperAdmin EDIT of verified MGB1 names: </span>
                    <InlineEdit
                      validate={validate.mgb1names}
                      activeClassName="editing"
                      placeholder='(add names here)'
                      text={profile.mgb1namesVerified || ''}
                      paramName="profile.mgb1namesVerified"
                      change={this.handleProfileFieldChanged}
                      isDisabled={false}
                      />
                  </List.Content>
                </List.Item>
              }
              </List>
            </Segment>
            { ( profile.mgb1namesVerified && profile.mgb1namesVerified !== '' ) && 
              <Segment>
                <Header as='h3'>Projects owned by '{profile.mgb1namesVerified}' in MGBv1:</Header>
                { loadingUserProjects && <p>Loading...</p> }
                <List>
                  { _.map(mgb1Projects[profile.mgb1namesVerified], mgb1pName => (
                    <List.Item key={mgb1pName}>
                      <List.Content>
                        <Button 
                            compact 
                            fluid
                            disabled={!canImport || importInProcess}
                            content={`Import '${mgb1pName}' from MGB v1...`}
                            onClick={ () => this.setState( { 
                              confirmPendingForProjectName: (mgb1pName === confirmPendingForProjectName) ? null : mgb1pName,
                              assetPrefix: (prefixMemo[mgb1pName] || _defaultAssetPrefix(mgb1pName)),
                              mgb2NewProjectName: (mgb2projNameMemo[mgb1pName] || _defaultMgb2ProjectName(mgb1pName))
                            } ) }
                            />
                        <RelatedMgb2projects mgb1Username={profile.mgb1namesVerified} mgb1Projectname={mgb1pName} user={user} userProjects={userProjects} />
                        { confirmPendingForProjectName === mgb1pName && 
                          <div style={{padding: '8px'}}>
                            <span>Asset Prefix: </span>
                            <Input 
                                disabled={!canImport || importInProcess}
                                placeholder='asset prefix'
                                value={ this.state.assetPrefix }
                                onChange={ this._onAssetPrefixChange }
                                /> 
                            &emsp;

                            <span>New Project Name: </span>
                            <Input 
                                placeholder='Mgb2 project to create...'
                                disabled={!canImport || importInProcess}
                                value={ this.state.mgb2NewProjectName }
                                onChange={ this._onMgb2ProjectNameChange }
                                /> 
                            &emsp;

                            <Button 
                                compact 
                                disabled={!canImport || importInProcess}
                                content={ importInProcess ? 'Importing...' : 'CONFIRM IMPORT' }
                                onClick={ () => this.handleImportProject( profile.mgb1namesVerified, mgb1pName, this.state.mgb2NewProjectName, this.state.assetPrefix ) }
                                />
                          </div> 
                        }
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </Segment>
            }
        </Segment>
      </Segment>
    )
  }
}

//
// Some simple stateless sub-Components used by <ProjectImportMgb1RouteUI>.. 
// They are factored out here in order to keep the main code above a bit cleaner
//
const NameOrNone = ( { nameStr } )  => (
  <span>
    { (nameStr && _.isString(nameStr) && nameStr.length > 0) ? `'${nameStr}'` : <small>(none)</small> }
  </span>
)

const ExplanationMessage = () => (
  <Message info icon>
    <Icon name='space shuttle' />
    <Message.Content>
      <Message.Header>At your service!</Message.Header>
      <p>
        Verified users can import their projects from their linked accounts in our prior flash-based 'MGBv1' system
      </p>
      <p>
        Contact us using the <QLink query={{_fp: 'chat'}}><Icon name='chat' />chat panel</QLink> to request verification of your prior MGBv1 account name 
      </p>
      <p>
        NOTE: To appear on the games list, and to have a proper play experience, you will need to create a gameConfig asset that lists the start map
      </p>
    </Message.Content>
  </Message>
)

const RelatedMgb2projects = ( { user, userProjects, mgb1Username, mgb1Projectname } ) => {
  if (!user || !userProjects || userProjects.length === 0)
    return null

  const relatedProjects = _.filter(userProjects, p => (p.mgb1 && p.mgb1.mgb1username === mgb1Username && p.mgb1.mgb1ProjectName === mgb1Projectname))
  if (relatedProjects.length === 0)
    return null

  return (
    <div>
      { _.map(relatedProjects, p => (
          <Segment key={p._id} attached>
            Imported as <QLink to={`/u/${p.ownerName}/projects/${p.name}`}>{p.name}</QLink>.   Progress: <small>{p.mgb1.importProgress}</small>
          </Segment>
      ))}
    </div>
  )
}



const ProjectImportMgb1Route = createContainer( ({ user }) => {
  const userId = user ? user._id : null

  const handleForProjects = userId ? Meteor.subscribe("projects.byUserId", userId) : null
  const projectsReady = handleForProjects === null ? true : handleForProjects.ready()
  const projectSelector = projectMakeSelector(userId)

  return {
    userProjects: Projects.find(projectSelector).fetch(),
    loadingUserProjects: !projectsReady
  }}, ProjectImportMgb1RouteUI
)

// Export the UI, wrapped by the data container
export default ProjectImportMgb1Route
