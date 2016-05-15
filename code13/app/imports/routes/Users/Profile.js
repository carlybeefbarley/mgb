import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import Helmet from 'react-helmet';

import UserCard from '../../components/Users/UserCard';
import {Link} from 'react-router';
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
    let handleActivity = Meteor.subscribe("activity.public.recent.userId", this.props.params.id, 10) 

    return {
      activitySnapshots: ActivitySnapshots.find({ byUserId: this.props.params.id }).fetch(),
      activity: Activity.find({ byUserId: this.props.params.id }, {sort: {timestamp: -1}}).fetch(),
      loading: !handleActivity.ready() && !handleForActivitySnapshots.ready()
    };
  },
  
  
  // TODO find a way to share code with the Sidebar activity renderer
  renderActivities()
  {
    if (!this.data.activity || this.data.activity.length === 0)
      return null
    
    let activityContent = this.data.activity.map((act, i) => { 
      let iconClass = "ui " + ActivityTypes.getIconClass(act.activityType)
      
      if (act.activityType.startsWith("user.")) {
        return <Link to={"/user/" + act.byUserId}  className="item" key={i}>
                <i className={iconClass}></i>{act.description}
              </Link>
      }
      else if (act.activityType.startsWith("asset.")) {
        const assetKindIconClassName = AssetKinds.getIconClass(act.toAssetKind);

        return  <Link to={"/assetEdit/" + act.toAssetId}  className="item" key={i}>
                <i className={iconClass}></i><i className={assetKindIconClassName}></i>{act.description}: '{act.toAssetName}'  
              </Link>
      } 
      else if (act.activityType.startsWith("project.")) {
        return <Link to={"/user/" + act.byUserId}  className="item" key={i}>
                <i className={iconClass}></i> {act.description}
              </Link>
      }
      //else...
      return <div className="item" key={i}>{act.activityType} not in Profile code</div>              
    })
        
    return  <div className="ui fluid vertical menu">{activityContent}</div>
  },
  
  
  renderActivitySnapshots() 
  {
    // A list of ActivitySnapshots provided via getMeteorData(), 
    let { activitySnapshots } = this.data;
    if (!activitySnapshots)
      return null;
      
    let viewed = _.map(activitySnapshots, a => { 
      let detail2 = ""
      const assetKindIconClassName = AssetKinds.getIconClass(a.toAssetKind);

      if (a.toAssetKind === "code")
        detail2 = ` at line ${a.passiveAction.position.line+1}`
      else if (a.toAssetKind === "graphic")
        detail2 = ` at frame #${a.passiveAction.selectedFrameIdx+1}`
      
      return <Link to={"/assetEdit/" + a.toAssetId} className="item" key={a._id}>
              <i className="ui eye grey icon"></i><i className={assetKindIconClassName}></i>View {a.toAssetKind} "{a.toAssetName || '<unnamed>'}"{detail2}
              </Link>
    })
    
    return  <div className="ui fluid vertical menu">
              {viewed}
            </div>    
  },

  
  render: function() {
    const {user, ownsProfile, currUser} = this.props;

    //Checks for edit query on route
    const { query } = this.props.location
    const edit = query && query.edit == "true"

    //if id params don't link to a user...
    if (!user) {
      return (
        <div>No user found at this address</div>
      );
    }

    const email = user.emails && user.emails[user.emails.length - 1].address ?
                    user.emails[user.emails.length - 1].address
                  : 'None@none.com';



    //if user is looking at their own profile and edit query is on on route
    if (edit && ownsProfile) {
      return (
        <EditProfile user={currUser} email={email} />
      )
    }

    //if user doesn't own profile but is trying to edit it...
    if (edit) {
      return (
        <div>You don't have permission to edit {user.profile.name}'s profile.</div>
      )
    }

    return (
      <div className="ui padded grid">
        <Helmet
          title={user.profile.name}
          meta={[
              {"name": "description", "content": user.profile.name + "\'s profile"}
          ]}
        />

        <div className="ui row">
          <div className="ui column">
            <h1>User: {user.profile.name}</h1>
          </div>
        </div>
        <div className="four wide column">
          <h2>Profile</h2>
          <UserCard
            user={user}
            name={user.profile.name}
            avatar={user.profile.avatar}
            title={user.profile.title}
            bio={user.profile.bio}
            createdAt={user.createdAt}
            email={email} />

          <Link to={`/user/${user._id}/assets`}  >
            <button>See Assets</button>
          </Link>
        </div>
        
        <div className="six wide column">
          <h2>Recent edits</h2>
          { this.renderActivities() }
        </div>
        
        <div className="six wide column">
          <h2 title="(Activity within last five minutes)">Recently viewed</h2>
          { this.renderActivitySnapshots() }
        </div>
        
      </div>
    );
  }
})
