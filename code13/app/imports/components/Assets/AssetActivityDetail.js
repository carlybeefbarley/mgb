import React, { PropTypes } from 'react';
import {ActivitySnapshots} from '../../schemas';
import reactMixin from 'react-mixin';

export default AssetActivityDetail = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    assetId: PropTypes.string.isRequired,                  
    currUser: PropTypes.object                  // currently Logged In user (not always provided)
  },
  
  getMeteorData: function() {
    let handle = Meteor.subscribe("activitysnapshots.assetid", this.props.assetId);

    return {
      // activities: ActivitySnapshots.find({ toAssetId: this.props.assetId} ).fetch(),
      activities: ActivitySnapshots.find().fetch(),
      loading: !handle.ready()
    };
  },
  

  render() {
    // A list of ActivitySnapshots provided via getMeteorData(), including one by ourself probably
    let activities = this.data.activities;
    if (this.data.loading)
      return null;
      
    var currUserId = this.props.currUser ? this.props.currUser._id : "BY_SESSION:" + Meteor.default_connection._lastSessionId
    let othersActivities =  _.filter(activities, a => currUserId !== a.byUserId)                            
    let viewers = _.map(othersActivities, a => { 
      let detail2 = ""
      if (a.toAssetKind === "code")
        detail2 = ` at line ${a.passiveAction.position.line}`
      else if (a.toAssetKind === "graphic")
        detail2 = ` at frame #${a.passiveAction.selectedFrameIdx+1}`
      
      return <a className="item" key={a._id}>
              {a.byUserName}{detail2}
              </a>
    })
    
    let viewersCount = viewers.length   // Note this excludes ourselves

    return (
          <div className="ui compact menu">
            <div className="ui simple dropdown item">
              <i className="icon users"></i> Viewers<i className="dropdown icon"></i>
              <div className={"floating ui " + (viewersCount ? "orange" : "grey") +  " label"}>
                { viewersCount }
              </div>
              <div className="menu">
              { viewers }
              </div>
            </div>
          </div>
      );
  }

  
})