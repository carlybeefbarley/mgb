import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Helmet from 'react-helmet'
import moment from 'moment'

import UserProjects from '/client/imports/components/Users/UserProjects'
import UserHistory from '/client/imports/components/Users/UserHistory'
import BadgeGrid from '/client/imports/components/Users/BadgeGrid'
import SkillGrid from '/client/imports/components/Users/SkillGrid'
import ActivityHeatmap from '/client/imports/components/Users/ActivityHeatmap'
import SkillsMap from '/client/imports/components/Controls/SkillsMap/SkillsMap'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'

import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'

import { Projects } from '/imports/schemas'
import { logActivity } from '/imports/schemas/activity'
import { projectMakeSelector } from '/imports/schemas/projects'

import QLink from '../QLink'
import { Container, Grid, Header, Image, Item, Icon } from 'semantic-ui-react'

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
    })
  },

  render: function() {
    const { user, ownsProfile } = this.props
    if (!user) return <ThingNotFound type="User" />

    return (
      <Container className="slim">
        <Grid padded stackable>
          <Helmet
            title={user.profile.name}
            meta={[
                {"name": "description", "content": user.profile.name + "\'s profile"}
            ]}
          />
          
          { this.renderUserInfo(user, ownsProfile) }
          <BadgeGrid user={user} className="five wide column" />
          <UserShowcase user={user} />
          { false && 
            <ActivityHeatmap user={user} className="ten wide column" />
          }
          { false && 
            <SkillGrid user={user} className='six wide column' />
          }
          <UserProjects user={user} projects={this.data.projects} />
          <UserHistory user={user} />
        </Grid>
      </Container>
    )
  },

  renderUserInfo: function(user, ownsProfile) {
    const { avatar, name, mgb1name, title, bio, focusMsg } = user.profile
    const editsDisabled = !ownsProfile

    return (
      <Grid.Column width={11}>
        <Item.Group>
          <Item>
            
            <ImageShowOrChange
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
                  validate={validate.mgb1name}
                  activeClassName="editing"
                  text={mgb1name || "(not provided)"}
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
                    validate={validate.userBio}
                    activeClassName="editing"
                    text={bio || "(no description)"}
                    paramName="profile.bio"
                    change={this.handleProfileFieldChanged}
                    isDisabled={editsDisabled}
                    />
                </p>
                <p>
                <b title="What you are working on right now. This will also show in the top bar as a reminder!">Focus:</b>&nbsp;
                  <InlineEdit
                    validate={validate.userFocusMsg}
                    activeClassName="editing"
                    text={focusMsg || "(no current focus)"}
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
                <div className="ui small vertical buttons">
                  <QLink to={`/u/${name}/assets`} style={{marginBottom: '6px'}}>
                    <div className="ui small button">Assets</div>
                  </QLink>
                  <QLink to={`/u/${name}/projects`} style={{marginBottom: '6px'}}>
                    <div className="ui small button">Projects</div>
                  </QLink>
                  <QLink to={`/u/${name}/games`} style={{marginBottom: '6px'}}>
                    <div className="ui small button">Games</div>
                  </QLink>
                </div>
              </Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>

        <div title="User's 'title'">
          <Icon name='left quote' color='blue' />
          <InlineEdit
            validate={validate.userTitle}
            activeClassName="editing"
            text={title || "(no title)"}
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
      </Grid.Column>
    )
  }
})