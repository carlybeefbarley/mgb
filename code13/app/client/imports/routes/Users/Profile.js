import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Helmet from 'react-helmet'
import moment from 'moment'

import UserProjects from '/client/imports/components/Users/UserProjects'
import UserHistory from '/client/imports/components/Users/UserHistory'
import UserProfileBadgeList from '/client/imports/components/Users/UserProfileBadgeList'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import SkillTreeRoute from '/client/imports/routes/Users/SkillTreeRoute'
import ActivityHeatmap from '/client/imports/components/Users/ActivityHeatmap'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'

import { Projects } from '/imports/schemas'
import { logActivity } from '/imports/schemas/activity'
import { projectMakeSelector } from '/imports/schemas/projects'

import QLink from '../QLink'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'


import { Container, Segment, Header, Button, Grid, Item, Icon, Label, Popup } from 'semantic-ui-react'
import FittedImage from '/client/imports/components/Controls/FittedImage'

const UserShowcase = () => ( null )    // TODO based on workState

export default UserProfileRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    query: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  },

  getMeteorData: function() {
    const userId = (this.props.user && this.props.user._id) ? this.props.user._id : null
    const handleForProjects = Meteor.subscribe("projects.byUserId", userId)
    const projectSelector = projectMakeSelector(userId)

    return {
      projects: Projects.find(projectSelector).fetch(),
      loading: userId && !handleForProjects.ready()
    }
  },

  /**
   *   @param changeObj contains { field: value } settings.. e.g "profile.title": "New Title"
   */
  handleProfileFieldChanged: function(changeObj)
  {
    const fMsg = changeObj["profile.focusMsg"]
    if (fMsg || fMsg === "")
    {
      // focusMessage has some additional handling.. activity Logging and also
      changeObj["profile.focusStart"] = new Date()
      if (fMsg.length > 0)
        logActivity("user.changeFocus", `Focus is now '${fMsg}'`)
      else
        logActivity("user.clearFocus", `Prior focus '${this.props.user.profile.focusMsg}' has been cleared` )
    }
    Meteor.call('User.updateProfile', this.props.user._id, changeObj, (error) => {
      if (error)
        console.log("Could not update profile: ", error.reason)
      else
      {
       // Go through all the keys, log completion tags for each
        _.each(_.keys(changeObj), k => joyrideCompleteTag(`mgbjr-CT-profile-set-field-${k}`))
      }
    })
  },

  render: function() {
    const { user, ownsProfile } = this.props
    if (!user) 
      return <ThingNotFound type="User" />

    return (
      <Segment basic>
        <Grid padded stackable stretched>
          <Helmet
            title={user.profile.name}
            meta={[
                {"name": "description", "content": user.profile.name + "\'s profile"}
            ]}
          />

          { /* User Avatar & Bio */ }
          { this.renderUserInfo(user, ownsProfile, 8) }

          { /* User History ("Activity") */ }
          <UserHistory user={user} width={8}/>     

          { /* User Badges */ }
          <UserProfileBadgeList user={user} className="sixteen wide column" />

          { /* User Games */ }
          <UserProfileGamesList user={user} width={16}/>

          { /* User Showcase (TODO) */ }
          <UserShowcase user={user} />

          { /* User Activity Heatmap (TODO) */ }
          { false &&
            <ActivityHeatmap user={user} className="eight wide column" />
          }

          { /* User Projects */ }
          <UserProjects user={user} width={16} projects={this.data.projects} />

          { /* User Skills */ }
          <Grid.Column width={16} id="mgbjr-profile-skills">
            <Header as='h2'>
              <QLink to={`/u/${user.profile.name}/skilltree`}>Skills</QLink>
            </Header>
            <SkillTreeRoute user={user} ownsProfile={ownsProfile} />
          </Grid.Column>

        </Grid>
      </Segment>
    )
  },

  renderUserInfo: function(user, ownsProfile, width) {
    const { avatar, name, mgb1name, title, bio, focusMsg } = user.profile
    const editsDisabled = !ownsProfile || user.suIsBanned

    return (
      <Grid.Column width={width} id="mgbjr-profile-bioDiv">
        <Segment>
          <Item.Group>
            <Item>

              <ImageShowOrChange
                id='mgbjr-profile-avatar'
                maxWidth="150px"
                imageSrc={avatar}
                header='User Avatar'
                canEdit={ownsProfile}
                canLinkToSrc={true}
                handleChange={(newUrl) => this.handleProfileFieldChanged( { "profile.avatar": newUrl }) } />

              <Item.Content style={{marginLeft: '8px'}}>

                <Item.Header content={name} />
                { user.suIsBanned &&
                  <div><Label size='small' color='red' content='Suspended Account' /></div>
                }
                { user.isDeactivated &&
                  <div><Label size='small' color='purple' content='Deactivated Account' /></div>
                }
                <Item.Meta>
                  <p>
                    <b title="This is the user's name on the old MGBv1 system. There is currently no verification of this claim">
                      MGB1 name:
                    </b>&nbsp;
                  <InlineEdit
                    id='mgbjr-profile-mgb1name-edit'
                    validate={validate.mgb1name}
                    activeClassName="editing"
                    placeholder='(not provided)'
                    text={mgb1name || ""}
                    paramName="profile.mgb1name"
                    change={this.handleProfileFieldChanged}
                    isDisabled={editsDisabled}
                    />
                    
                    { _.isString(mgb1name) && mgb1name.length > 0 && 
                      <Popup
                        on='hover'
                        hoverable
                        positioning='bottom right'
                        trigger={<span>...</span>}
                        mouseEnterDelay={500}
                        >
                        <Popup.Header>
                          Legacy 'MGBv1' account
                        </Popup.Header>
                        <Popup.Content>
                          <div>Prior account in the legacy Flash-based 'MGB1' system from 2007:</div>
                          <br/>
                          <a className="mini image"  href={`http://s3.amazonaws.com/apphost/MGB.html#user=${mgb1name};project=project1`} target="_blank">
                            <img  
                              className="ui centered image" 
                              style={{ maxWidth: "64px", maxHeight: "64px" }}
                              src={`https://s3.amazonaws.com/JGI_test1/${mgb1name}/project1/tile/avatar` } />
                          </a>
                        </Popup.Content>
                      </Popup>
                    }
                  </p>
                </Item.Meta>

                <Item.Description>
                  <p>
                    <b title="About yourself">Bio:</b>&nbsp;
                    <InlineEdit
                      id='mgbjr-profile-userBio-edit'
                      validate={validate.userBio}
                      activeClassName="editing"
                      placeholder='(no description)'
                      text={bio || ""}
                      paramName="profile.bio"
                      change={this.handleProfileFieldChanged}
                      isDisabled={editsDisabled}
                      />
                  </p>
                  <p>
                  <b title="What you are working on right now. This will also show in the top bar as a reminder!">Focus:</b>&nbsp;
                    <InlineEdit
                      id='mgbjr-profile-focusMsg-edit'
                      validate={validate.userFocusMsg}
                      activeClassName="editing"
                      placeholder='(no current focus)'
                      text={focusMsg || ""}
                      paramName="profile.focusMsg"
                      change={this.handleProfileFieldChanged}
                      isDisabled={editsDisabled}
                      />
                  </p>
                </Item.Description>

                <Item.Extra>
                  <Button.Group size='small' vertical>
                    <QLink to={`/u/${name}/assets`} style={{marginBottom: '6px'}}>
                      <Button size='small' icon='pencil' content='Assets' />
                    </QLink>
                    <QLink to={`/u/${name}/projects`} style={{marginBottom: '6px'}}>
                      <Button size='small' icon='sitemap' content='Projects' />
                    </QLink>
                    <QLink to={`/u/${name}/games`} style={{marginBottom: '6px'}}>
                      <Button size='small' icon='game' content='Games' />
                    </QLink>
                  </Button.Group>
                </Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>

          <div title="User's 'title'">
            <Icon name='left quote' color='blue' />
            <InlineEdit
              id='mgbjr-profile-userTitle-edit'
              validate={validate.userTitle}
              activeClassName="editing"
              placeholder='(no title)'
              text={title || ""}
              paramName="profile.title"
              change={this.handleProfileFieldChanged}
              isDisabled={editsDisabled} />
            <Icon name='right quote' color='blue' />
          </div>
          <p>
            <em style={{color: "#888"}}>
              <Icon name='clock' />Joined {moment(user.createdAt).format('MMMM DD, YYYY')}
            </em>
          </p>
        </Segment>
      </Grid.Column>
    )
  }
})
