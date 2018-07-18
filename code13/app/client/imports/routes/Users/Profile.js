import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import {
  Segment,
  Header,
  Button,
  Form,
  Grid,
  Item,
  Icon,
  Label,
  Popup,
  Dropdown,
  Container,
} from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { withTracker } from 'meteor/react-meteor-data'
import Helmet from 'react-helmet'

import mgb1 from '/client/imports/helpers/mgb1'
import UserProjects from '/client/imports/components/Users/UserProjects'
import UserHistory from '/client/imports/components/Users/UserHistory'

import UserLovesList from '/client/imports/components/Users/UserLovesList'

import UserProfileBadgeList from '/client/imports/components/Badges/UserProfileBadgeList'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import SkillTreeRoute from '/client/imports/routes/Users/SkillTreeRoute'
import ActivityHeatmap from '/client/imports/components/Users/ActivityHeatmap'
import FocusDropdown from '/client/imports/components/Users/FocusDropdown'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'

import { Projects, Classrooms } from '/imports/schemas'
import { logActivity } from '/imports/schemas/activity'
import { projectMakeSelector, projectSorters } from '/imports/schemas/projects'

import { makeChannelName } from '/imports/schemas/chats'

import QLink from '../QLink'
import { joyrideStore } from '/client/imports/stores'

import Hotjar from '/client/imports/helpers/hotjar.js'

const UserShowcase = () => null // TODO based on workState

class UserProfileRoute extends React.Component {
  static propTypes = {
    query: PropTypes.object,
    params: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool,
  }

  componentDidMount() {
    // setTimeout just to be sure that everything is loaded
    setTimeout(() => Hotjar('trigger', 'user-profile', this.props.currUser), 200)
  }

  /**
   *   @param changeObj contains { field: value } settings.. e.g "profile.title": "New Title"
   */
  handleProfileFieldChanged = changeObj => {
    const fMsg = changeObj['profile.focusMsg']
    if (fMsg || fMsg === '') {
      // focusMessage has some additional handling.. activity Logging and also
      changeObj['profile.focusStart'] = new Date()
      if (fMsg.length > 0) logActivity('user.changeFocus', `Focus is now '${fMsg}'`)
      else
        logActivity('user.clearFocus', `Prior focus '${this.props.user.profile.focusMsg}' has been cleared`)
    }
    Meteor.call('User.updateProfile', this.props.user._id, changeObj, error => {
      if (error) console.error('Could not update profile:', error.reason)
      else {
        // Go through all the keys, log completion tags for each
        _.each(_.keys(changeObj), k => joyrideStore.completeTag(`mgbjr-CT-profile-set-field-${k}`))
      }
    })
  }

  render() {
    const { isSuperAdmin, user, ownsProfile, currUser, params, projects } = this.props
    if (!user) return <ThingNotFound type="User" id={params.username} />

    return (
      <Container>
        <Grid padded stackable stretched>
          <Helmet
            title={`MGB: @${user.username}`}
            meta={[{ name: 'description', content: user.profile.name + "'s profile" }]}
          />

          {/* User Avatar & Bio */}
          {this.renderUserInfo(user, ownsProfile, 8)}

          {/* User History ("Activity") */}
          <UserHistory user={user} width={8} />

          {/* User Badges*/}
          <Header as="h2" color="grey" id="#mgbjr-profile-badges-header">
            Badges
          </Header>

          <UserProfileBadgeList ownsProfile={ownsProfile} user={user} />

          {/* User Games */}
          <UserProfileGamesList currUser={currUser} user={user} width={16} />

          {/* User Showcase (TODO) */}
          <UserShowcase user={user} />

          {/* User Activity Heatmap (TODO) */}
          {false && <ActivityHeatmap user={user} className="eight wide column" />}
          {/* Users who currUser is projects with -owned and -not-owned use pubsub */}
          <UserColleaguesList user={user} narrowItem projects={projects} />

          {/* User Projects */}
          <UserProjects user={user} width={16} projects={projects} />

          {/* User Skills */}
          <Grid.Column width={16} id="mgbjr-profile-skills">
            <Header as="h2">
              <QLink to={`/u/${user.profile.name}/skilltree`}>Skills</QLink>
            </Header>
            <SkillTreeRoute isSuperAdmin={isSuperAdmin} user={user} ownsProfile={ownsProfile} />
          </Grid.Column>

          <UserLovesList user={user} />
        </Grid>
      </Container>
    )
  }

  renderUserInfo = (user, ownsProfile, width) => {
    const { avatar, name, mgb1name, title, bio, focusMsg } = user.profile
    const editsDisabled = !ownsProfile || user.suIsBanned
    const channelName = makeChannelName({ scopeGroupName: 'User', scopeId: name })

    const firstMgb1name = mgb1name && mgb1name.length > 0 ? mgb1name.split(',')[0] : null
    return (
      <Grid.Column width={width} id="mgbjr-profile-bioDiv" style={{ textAlign: 'center' }}>
        <Segment raised color="blue">
          <ImageShowOrChange
            id="mgbjr-profile-avatar"
            maxHeight="8em"
            maxWidth="auto"
            imageSrc={avatar}
            header="User Avatar"
            canEdit={ownsProfile}
            canLinkToSrc
            handleChange={newUrl => this.handleProfileFieldChanged({ 'profile.avatar': newUrl })}
          />
          <Header style={{ marginTop: 0, marginBottom: '8px' }} size="large" content={name} />
          {user.suIsBanned && (
            <div>
              <Label size="small" color="red" content="Suspended Account" />
            </div>
          )}
          {user.isDeactivated && (
            <div>
              <Label size="small" color="purple" content="Deactivated Account" />
            </div>
          )}
          <div title="User's 'title'" style={{ opacity: 0.6 }}>
            <Icon size="tiny" name="quote left" />
            <InlineEdit
              id="mgbjr-profile-userTitle-edit"
              validate={validate.userTitle}
              activeClassName="editing"
              placeholder="(Title) "
              text={title || ''}
              paramName="profile.title"
              change={this.handleProfileFieldChanged}
              isDisabled={editsDisabled}
            />
            <Icon size="tiny" name="quote right" />
          </div>
          <p>
            <UX.UserWhenJoined when={user.createdAt} />
          </p>
          <p>
            <b title="About yourself">Bio:</b>&nbsp;
            <InlineEdit
              id="mgbjr-profile-userBio-edit"
              validate={validate.userBio}
              activeClassName="editing"
              placeholder="(Tell us a bit about yourself)"
              text={bio || ''}
              paramName="profile.bio"
              change={this.handleProfileFieldChanged}
              isDisabled={editsDisabled}
            />
          </p>
          <b title="What you are working on right now. This will also show in the top bar as a reminder!">
            Focus:{' '}
          </b>&nbsp;
          {ownsProfile ? <FocusDropdown user={user} /> : user.profile.focusMsg}
          <br />
          <p>
            <b title="This is the user's name on the prior flash-based MGBv1 system. ">MGB1 name:</b>
            &nbsp;
            <InlineEdit
              id="mgbjr-profile-mgb1name-edit"
              validate={validate.mgb1name}
              activeClassName="editing"
              placeholder="(not provided)"
              text={mgb1name || ''}
              paramName="profile.mgb1name"
              change={this.handleProfileFieldChanged}
              isDisabled={editsDisabled}
            />
            &nbsp;
            {_.isString(mgb1name) &&
            mgb1name.length > 0 && (
              <Popup
                on="hover"
                hoverable
                position="bottom right"
                trigger={<img className="ui avatar image" src={mgb1.getUserAvatarUrl(firstMgb1name)} />}
                mouseEnterDelay={500}
              >
                <Popup.Header>Legacy 'MGBv1' account</Popup.Header>
                <Popup.Content>
                  <div>Prior account in the legacy Flash-based 'MGB1' system from 2007:</div>
                  <br />
                  <a className="mini image" href={mgb1.getEditPageUrl(firstMgb1name)} target="_blank">
                    <img
                      className="ui centered image bordered"
                      style={{ maxWidth: '64px', maxHeight: '64px' }}
                      src={mgb1.getUserAvatarUrl(firstMgb1name)}
                    />
                  </a>
                  <br />
                  <QLink to={`/u/${user.username}/projects/import/mgb1`}>MGBv1 Project Importer...</QLink>
                </Popup.Content>
              </Popup>
            )}
          </p>
          <div style={{ clear: 'both', right: 'auto', left: 'auto' }}>
            <QLink to={`/u/${name}/assets`} style={{ marginBottom: '6px' }}>
              <UX.Button2 basic icon="pencil" content="Assets" />
            </QLink>
            <QLink to={`/u/${name}/projects`} style={{ marginBottom: '6px' }}>
              <UX.Button2 basic icon="sitemap" content="Projects" />
            </QLink>
            <QLink to={`/u/${name}/games`} style={{ marginBottom: '6px' }}>
              <UX.Button2 basic icon="game" content="Games" />
            </QLink>
            <QLink query={{ _fp: `chat.${channelName}` }} style={{ marginBottom: '6px' }}>
              <UX.Button2 basic icon="chat" content="Wall" />
            </QLink>
          </div>
        </Segment>
      </Grid.Column>
    )
  }
}

export default withTracker(props => {
  const userId = props.user && props.user._id ? props.user._id : null
  let findOpts = {
    sort: projectSorters['createdNewest'],
  }
  const handleForProjects = Meteor.subscribe('projects.byUserId', userId)
  const projectSelector = projectMakeSelector(userId)

  const handleForClassrooms = Meteor.subscribe('classrooms.all')

  return {
    classrooms: Classrooms.find({}),
    projects: Projects.find(projectSelector, findOpts).fetch(),
    loading: userId && !handleForProjects.ready(),
  }
})(UserProfileRoute)
