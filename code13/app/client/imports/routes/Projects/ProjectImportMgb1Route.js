import _ from 'lodash'
import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { Header, Icon, List, Message, Segment } from 'semantic-ui-react'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'

const NameOrNone = ( { nameStr } )  => (
  <span>
    { (nameStr && _.isString(nameStr) && nameStr.length > 0) ? `'${nameStr}'` : <small>(none)</small> }
  </span>
)

class ProjectImportMgb1Route extends React.Component {

  static propTypes = {
    user:             PropTypes.object,         // Maybe absent if route is /assets
    currUser:         PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array,          // Projects list for currently logged in user
    isSuperAdmin:     PropTypes.bool,
    ownsProfile:      PropTypes.bool
  }

  state = {
    mgb1Projects:        {}                    //  e.g. [ { 'foo': ['mechanics demos'] } ]
  }

  refreshProjectList = () => {
    const { user } = this.props
    const { profile } = user
    const { mgb1namesVerified } = profile
    Meteor.call( 'mgb1.getProjectNames', mgb1namesVerified, (err, result) => {
      if (err) 
        console.error('mgb1.getProjectNames failed: ', err.reason)
      else
      {
        const newPList = _.clone( this.state.mgb1Projects )
        newPList[mgb1namesVerified] = result.projectNames
        this.setState( { mgb1Projects: newPList} )
      }
    })
  }

  componentDidMount() {
    this.refreshProjectList()
  }
  
  /*
   *   @param changeObj contains { field: value } settings.. e.g "profile.mgb1namesVerified": "New Title"
   */
  handleProfileFieldChanged = changeObj =>
  {
    const m1verified = changeObj["profile.mgb1namesVerified"]
    if (m1verified || m1verified === "")
    {
      // mgb1namesVerified has some additional handling.. 
      Meteor.call('User.update.mgb1namesVerified', this.props.user._id, m1verified, error => {
        if (error)
          console.log("Could not update mgb1namesVerified: ", error.reason)
      })
    }
    else
      console.error("handleProfileFieldChanged() could not update changeObj: ", changeObj)
  }

  render() {
    const { user, isSuperAdmin } = this.props
    const { profile, username } = user
    const { mgb1Projects } = this.state
    
    console.log(mgb1Projects[profile.mgb1namesVerified])
    return (
      <Segment basic>
        <Helmet
          title="Import MGB1 Project"
          meta={[ {"name": "description", "content": "Import Project"} ]}
        />
        <Header as='h2' content='Import MGB1 Project'/>
        <Segment raised>
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
            <Segment>
              <Header sub>Projects for mgb1@{profile.mgb1namesVerified}:</Header>
              <List>
                { _.map(mgb1Projects[profile.mgb1namesVerified], pName => (
                  <List.Item>
                    <List.Content>
                      Project: '{pName}'
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Segment>
          </List>
        </Segment>
      </Segment>
    )
  }
}

export default ProjectImportMgb1Route