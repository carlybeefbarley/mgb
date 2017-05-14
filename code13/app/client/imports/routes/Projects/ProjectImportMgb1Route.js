import _ from 'lodash'
import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { Button, Header, Icon, Input, List, Message, Segment } from 'semantic-ui-react'
import { showToast } from '/client/imports/routes/App'
import { logActivity } from '/imports/schemas/activity'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'

// Let's be smart about generating and remembering the user's 
// default + desired assetPrefxes & mgb2projectnames for the new projects
const prefixMemo = {}
const mgb2projNameMemo = {}
const _defaultAssetPrefix = pName => (_.toLower(pName.slice(0, 5)) + '.')
const _defaultMgb2ProjectName = pName => (pName)

//
// The 'Import MGB1 project' UI code
//

class ProjectImportMgb1Route extends React.Component {

  static propTypes = {
    user:             PropTypes.object,         // Maybe absent if route is /assets
    currUser:         PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array,          // Projects list for currently logged in user
    isSuperAdmin:     PropTypes.bool,
    ownsProfile:      PropTypes.bool
  }

  state = {
    mgb1Projects:                 {},          //  e.g. [ { 'foo': ['mechanics demos'] } ]
    confirmPendingForProjectName: null,
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
        newPList[mgb1namesVerified] = _.sortBy(result.projectNames)
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
    Meteor.call('job.import.mgb1.project', importParams, (err, result) => {
      if (err)
        showToast(`Unable to import project: ${err.reason}`, 'error')
      else {
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
    const { user, isSuperAdmin } = this.props
    const { profile, username } = user
    const { mgb1Projects } = this.state
    
    return (
      <Segment basic>
        <Helmet
          title="Import MGB1 Project"
          meta={[ {"name": "description", "content": "Import Project"} ]}
        />
        <Header as='h2' content='Import MGB1 Project'/>
        <Segment raised>
          <ExplanationMessage />
          <Header sub>MGB1 account status for @{username} in 'MGBv2'</Header>
          <List bulleted>
            <List.Item>
              Self-claimed MGB1 name: <NameOrNone nameStr={profile.mgb1name} />
            </List.Item>
            <List.Item>
              ADMIN-verified MGB1 names: <NameOrNone nameStr={profile.mgb1namesVerified} />
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
            { ( profile.mgb1namesVerified && profile.mgb1namesVerified !== '' ) && 
              <Segment>
                <Header sub>Projects for mgb1@{profile.mgb1namesVerified}:</Header>
                <List>
                  { _.map(mgb1Projects[profile.mgb1namesVerified], pName => (
                    <List.Item key={pName}>
                      <List.Content>
                        <Button 
                            compact 
                            wide
                            content={`Import '${pName}'...`}
                            onClick={ () => this.setState( { 
                              confirmPendingForProjectName: pName,
                              assetPrefix: (prefixMemo[pName] || _defaultAssetPrefix(pName)),
                              mgb2NewProjectName: (mgb2projNameMemo[pName] || _defaultMgb2ProjectName(pName))
                            } ) }
                            />
                        
                        { this.state.confirmPendingForProjectName === pName && 
                          <div style={{padding: '8px'}}>
                            <span>Asset Prefix: </span>
                            <Input 
                                placeholder='asset prefix'
                                value={ this.state.assetPrefix }
                                onChange={ this._onAssetPrefixChange }
                                /> 
                            &emsp;

                            <span>New Project Name: </span>
                            <Input 
                                placeholder='Mgb2 project to create...'
                                value={ this.state.mgb2NewProjectName }
                                onChange={ this._onMgb2ProjectNameChange }
                                /> 
                            &emsp;

                            <Button 
                                compact 
                                content='CONFIRM IMPORT' 
                                onClick={ () => this.handleImportProject( profile.mgb1namesVerified, pName, pName, this.state.assetPrefix ) }
                                />
                          </div> 
                        }
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </Segment>
            }
          </List>
        </Segment>
      </Segment>
    )
  }
}

//
// Some stateless Components to keep the main code above a bit cleaner
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
        All projects currently hosted in our prior flash-based 'MGB1' system are going be imported into the new system soon..
      </p>
      <p>
        Contact us in chat to request having your project imported immediately
      </p>
    </Message.Content>
  </Message>
)

// Export it
export default ProjectImportMgb1Route