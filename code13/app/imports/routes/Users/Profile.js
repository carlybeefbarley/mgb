import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import Helmet from 'react-helmet';
import moment from 'moment';

import UserCard from '../../components/Users/UserCard';
import QLink from '../QLink';
import EditProfile from '../../components/Users/EditProfile';
import {Activity, ActivitySnapshots} from '../../schemas';
import {ActivityTypes} from '../../schemas/activity.js';
import {AssetKinds} from '../../schemas/assets';


export default UserProfileRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    query: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  },
  
  
  getMeteorData: function() {
    let handleForActivitySnapshots = Meteor.subscribe("activitysnapshots.userId", this.props.params.id);
    let handleActivity = Meteor.subscribe("activity.public.recent.userId", this.props.params.id) 

    return {
      activitySnapshots: ActivitySnapshots.find({ byUserId: this.props.params.id }).fetch(),
      activity: Activity.find({ byUserId: this.props.params.id }, {sort: {timestamp: -1}}).fetch(),
      loading: !handleActivity.ready() || !handleForActivitySnapshots.ready()
    };
  },
  
  
  /**
   *   @param changeObj contains { field: value } settings.. e.g "profile.title": "New Title"
   */
  handleProfileFieldChanged: function(changeObj)
  {
    Meteor.call('User.updateProfile', this.props.user._id, changeObj, (error) => {
      if (error) 
        console.log("Could not update profile: ", error.reason)      
    });
  },
  
  
  // TODO find a way to share code with the Sidebar activity renderer and NavRecent.js
  renderActivities()
  {
    if (!this.data.activity || this.data.activity.length === 0)
      return null
    
    let activityContent = this.data.activity.map((act, i) => { 
      
      const ago = moment(act.timestamp).fromNow()                   // TODO: Make reactive
    
      let iconClass = "ui " + ActivityTypes.getIconClass(act.activityType)
      
      if (act.activityType.startsWith("user.")) {
        return <QLink to={"/user/" + act.byUserId}  className="item" key={i} title={ago}>
                <i className={iconClass}></i>{act.description}
              </QLink>
      }
      else if (act.activityType.startsWith("asset.")) {
        const assetKindIconClassName = AssetKinds.getIconClass(act.toAssetKind);

        return  <QLink to={"/assetEdit/" + act.toAssetId}  className="item" key={i} title={ago}>
                <i className={iconClass}></i><i className={assetKindIconClassName}></i>{act.description} '{act.toAssetName}'  
              </QLink>
      } 
      else if (act.activityType.startsWith("project.")) {
        return <QLink to={"/user/" + act.byUserId}  className="item" key={i}> title={ago}
                <i className={iconClass}></i> {act.description}
              </QLink>
      }
      //else...
      return <div className="item" key={i}>!error! {act.activityType} activityType not in Profile code</div>              
    })
        
    return  <div className="ui small fluid vertical menu">{activityContent}</div>
  },
  
  
  renderActivitySnapshots() 
  {
    // A list of ActivitySnapshots provided via getMeteorData(), 
    let { activitySnapshots } = this.data;
    if (!activitySnapshots)
      return null;
      
    let viewed = _.map(_.sortBy(activitySnapshots, 'timestamp'), a => { 
      const ago = moment(a.timestamp).fromNow()                   // TODO: Make reactive
      let detail2 = ""
      const assetKindIconClassName = AssetKinds.getIconClass(a.toAssetKind);

      if (a.toAssetKind === "code")
        detail2 = ` at line ${a.passiveAction.position.line+1}`
      else if (a.toAssetKind === "graphic")
        detail2 = ` at frame #${a.passiveAction.selectedFrameIdx+1}`
      
      return <QLink to={"/assetEdit/" + a.toAssetId} className="item" key={a._id} title={ago}>
              <i className="ui eye grey icon"></i><i className={assetKindIconClassName}></i>View {a.toAssetKind} '{a.toAssetName || "<unnamed>"}'{detail2}
              </QLink>
    })
    
    return  <div className="ui small fluid vertical menu">
              {viewed.length > 0 ? viewed : <a className="ui disabled item">No activity within last 5 minutes...</a> }
            </div>    
  },

  
  render: function() {
    const {user, ownsProfile} = this.props;

    //if id params don't link to a user...
    if (!user) {
      return (
        <div className="ui segment">
          <div className="ui error message">
            <div className="header">
              User not found
            </div>
            <p>This user does not exist. Weird.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="ui padded grid">
        <Helmet
          title={user.profile.name}
          meta={[
              {"name": "description", "content": user.profile.name + "\'s profile"}
          ]}
        />
        
        <div className="six wide column" style={{minWidth: "250px"}}>
          <h2>User: {user.profile.name}</h2>
          <UserCard
            user={user}
            canEditProfile={ownsProfile}
            handleProfileFieldChanged={this.handleProfileFieldChanged}
            />


          <QLink to={`/user/${user._id}/assets`} className="ui button" >
            Assets
          </QLink>
          <QLink to={`/user/${user._id}/projects`}  className="ui button" >
            Projects
          </QLink>
        </div>
        
        <div className="eight wide column">
          <h2 title="(Activity within last five minutes)">Recent views</h2>
          { this.renderActivitySnapshots() }
          <h2 title="List of recent actions by this user. This list typically has several weeks of history">Recent edits</h2>
          { this.renderActivities() }
        </div>
        
      </div>
    );
  }
})
