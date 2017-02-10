import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Helmet from 'react-helmet'
import moment from 'moment'

import UserProjects from '/client/imports/components/Users/UserProjects'
import UserHistory from '/client/imports/components/Users/UserHistory'
import BadgeGrid from '/client/imports/components/Users/BadgeGrid'
import UserGamesRoute from '/client/imports/routes/Users/UserGamesRoute'
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


import { Container, Segment, Header, Button, Grid, Item, Icon } from 'semantic-ui-react'

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
    if (!user) return <ThingNotFound type="User" />

    return (
      <Container className='slim' style={{minWidth: '400px'}}>
        <Grid padded stackable stretched>
          <Helmet
            title={user.profile.name}
            meta={[
                {"name": "description", "content": user.profile.name + "\'s profile"}
            ]}
          />

          { this.renderUserInfo(user, ownsProfile) }
          <BadgeGrid user={user} className="eight wide column" />
          <UserShowcase user={user} />
          { false &&
            <ActivityHeatmap user={user} className="eight wide column" />
          }
          <Grid.Column width={8} id="mgbjr-profile-skills">
            <Segment>
              <Header as='h2'>
                <QLink to={`/u/${user.profile.name}/skilltree`}>
                  Skills
                </QLink>
              </Header>
              <SkillTreeRoute user={user} ownsProfile={ownsProfile} />
            </Segment>
          </Grid.Column>
          <UserHistory user={user} />
          <UserGamesRoute user={user} />
          <UserProjects user={user} projects={this.data.projects} />
        </Grid>
      </Container>
    )
  },

  renderUserInfo: function(user, ownsProfile) {
    const { avatar, name, mgb1name, title, bio, focusMsg } = user.profile
    const editsDisabled = !ownsProfile


    return (
      <Grid.Column width={8} id="mgbjr-profile-bioDiv">
        <Segment>
          <Item.Group>
            <Item>

              <ImageShowOrChange
                id='mgbjr-profile-avatar'
                className="image"
                imageSrc={avatar}
                canEdit={ownsProfile}
                canLinkToSrc={true}
                handleChange={(newUrl) => this.handleProfileFieldChanged( { "profile.avatar": newUrl }) } />

              <Item.Content>

                <Item.Header content={name} />
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
                { /*
                  mgb1name && false &&  // Currently not shown - doesn't have good place in layout
                  <a className="right floated mini image"  href={`http://s3.amazonaws.com/apphost/MGB.html#user=${mgb1name};project=project1`} target="_blank">
                    <img  style={{ maxWidth: "64px", maxHeight: "64px" }}
                          ref={ (c) => { if (c) c.src=`https://s3.amazonaws.com/JGI_test1/${mgb1name}/project1/tile/avatar` } } />
                  </a>
                  */
                }

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
