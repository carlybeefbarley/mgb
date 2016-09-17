import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Helmet from 'react-helmet'
import moment from 'moment'

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
import { projectMakeSelector, getProjectAvatarUrl } from '/imports/schemas/projects'

import NavRecentGET from '/client/imports/components/Nav/NavRecentGET'
import QLink from '../QLink'

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
    });
  },


  render: function() {
    const { user, ownsProfile } = this.props

    if (!user)
      return <ThingNotFound type="User" />

    return (
      <div className="ui padded stackable grid">
        <Helmet
          title={user.profile.name}
          meta={[
              {"name": "description", "content": user.profile.name + "\'s profile"}
          ]}
        />
        
        { this.renderUserInfo(user, ownsProfile, "ten wide column") }
        <BadgeGrid user={user} className="six wide column" />

        { this.renderUserShowcase(user, "sixteen wide column") }

        <ActivityHeatmap user={user} className="ten wide column" />        
        { this.renderUserSkills(user, "six wide column" ) }

        { this.renderUserProjects(user, "eight wide column" ) }
        { this.renderUserHistory(user, "eight wide column") }
        
      </div>
    );
  },


  renderUserInfo: function(user, ownsProfile, className) {
    const { avatar, name, mgb1name, title, bio, focusMsg } = user.profile
    const editsDisabled = !ownsProfile

    return (
      <div className={className}>
        <div className="ui items">
          <div className="item">
            
            <ImageShowOrChange
              className="image"
              imageSrc={avatar}
              canEdit={ownsProfile}
              canLinkToSrc={true}
              handleChange={(newUrl) => this.handleProfileFieldChanged( { "profile.avatar": newUrl }) } />

            <div className="content">          

              <div className="header">{name}</div>
              <div className="meta">
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
              </div>

              <div className="ui description">
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
              </div>  
              { /*
                mgb1name && false &&  // Currently not shown - doesn't have good place in layout
                <a className="right floated mini image"  href={`http://s3.amazonaws.com/apphost/MGB.html#user=${mgb1name};project=project1`} target="_blank">
                  <img  style={{ maxWidth: "64px", maxHeight: "64px" }}
                        ref={ (c) => { if (c) c.src=`https://s3.amazonaws.com/JGI_test1/${mgb1name}/project1/tile/avatar` } } />
                </a>
                */
              }

              <div className="ui extra">
                <QLink to={`/u/${name}/assets`}>
                  <div className="ui label">Assets</div>
                </QLink>
                &nbsp;
                <QLink to={`/u/${name}/projects`}>
                  <div className="ui label">Projects</div>
                </QLink>
              </div>
            </div>
          </div>
        </div>
        <div title="User's 'title'">
          <i className="quote left icon blue icon" />
          <InlineEdit
            validate={validate.userTitle}
            activeClassName="editing"
            text={title || "(no title)"}
            paramName="profile.title"
            change={this.handleProfileFieldChanged}
            isDisabled={editsDisabled} />
            <i className="quote right icon blue" />
        </div>
        <p>
          <em style={{color: "#888"}}><i className="clock icon" />Joined {moment(user.createdAt).format('MMMM DD, YYYY')}</em>
        </p>
      </div>
    )
  },


  renderUserShowcase: function(user, className) {
    return ( null
      // <div className="sixteen wide column">
      //   renderUserShowcase
      // </div>
    )
  },



  renderUserSkills: function(user, className) {
    return (
      <SkillGrid user={user} className={className} />
    )
  },


  renderUserProjects: function(user, className) {
    const { projects } = this.data
    return (
      <div className="eight wide column">
      <h2><QLink to={`/u/${user.profile.name}/projects`}>Owned Projects</QLink></h2>
        { this.renderProjects(user, projects, true) }
      <h2><QLink to={`/u/${user.profile.name}/projects`}>Member of</QLink></h2>
        { this.renderProjects(user, projects, false) }
      </div>
    )
  },


  renderProjects(user, projects, ownedFlag)
  {
    const Empty = <p>No projects</p>

    if (!projects)
      return null
      
    if (projects.length === 0)
      return Empty
      
    const retval = projects.map( (project) => {
      const isOwner = (project.ownerId === this.props.user._id)
      const MemberStr = (!project.memberIds || project.memberIds.length === 0) ? "1 Member" : (project.memberIds.length + 1) + " Member"
      const projImg = getProjectAvatarUrl(project)

      return (isOwner !== ownedFlag) ? null : (
        <div className="ui grid" key={project._id}>
          <div className="four wide column">
            <img className="ui fluid image" src={projImg} />
          </div>
          <div className="twelve wide column">
            <h4 className="ui header">
              <QLink to={`/u/${user.profile.name}/project/${project._id}`}>
                {project.name}
              </QLink> 
              &emsp;<small>{isOwner ? "(owner)" : "(member)"}</small>
            </h4>
            <p title="(Plays counter not yet implemented)">{MemberStr}&emsp;<i className="play icon"></i>0,000 Plays</p>
          </div>
        </div>
      )
    })

    return retval.length > 0 ? retval : Empty
  },


  renderUserHistory: function(user, className) {
    return (
      <div className={className}>
      <h2><QLink to={`/u/${user.profile.name}/history`}>History</QLink></h2>
        <NavRecentGET 
          styledForNavPanel={false} 
          currUser={this.props.user}
          showUserActivities={true}
        />
      </div>
    )
  }

})
