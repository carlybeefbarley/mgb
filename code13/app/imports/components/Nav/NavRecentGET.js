import React, {Component, PropTypes} from 'react';
import QLink from '../../routes/QLink';
import reactMixin from 'react-mixin';
import {Activity, ActivitySnapshots} from '../../schemas';
import {AssetKinds} from '../../schemas/assets';
import moment from 'moment';


// GET - becuase this is a component that GETs it's own data via getMeteorData() callback

export default NavRecentGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    user: PropTypes.object        // Can be null 
  },
  
  getMeteorData: function() {
    if (!this.props.user)
      return {}
      
    let uid = this.props.user._id
    let handleForActivitySnapshots = Meteor.subscribe("activitysnapshots.userId", uid);
    let handleActivity = Meteor.subscribe("activity.public.recent.userId", uid, 10) 

    return {
      activitySnapshots: ActivitySnapshots.find({ byUserId: uid }).fetch(),
      activity: Activity.find({ byUserId: uid }, {sort: {timestamp: -1}}).fetch(),
      loading: !handleActivity.ready() && !handleForActivitySnapshots.ready()
    }
  },
  
  renderMergedActivities()   // merge and sort by timestamp.. assets only? idk
  {
    let mergedArray = this.data.activity.concat(this.data.activitySnapshots)
    mergedArray = _.sortBy(mergedArray, x => { return -x.timestamp.getTime()})  // Sort by most recent
    mergedArray = _.uniqBy(mergedArray, 'toAssetId')    // Remove later duplicate assetIds
    let retval = []

    _.each(mergedArray, a => {
      const ago = moment(a.timestamp).fromNow()                   // TODO: Make reactive
      if (a.toAssetId)
      {
        // We only add Asset activities so far - not profile views etc
        const assetKindIconClassName = AssetKinds.getIconClass(a.toAssetKind);
        retval.push( <QLink to={"/assetEdit/" + a.toAssetId} className="item" key={a._id} title={ago}>
                      <i className={assetKindIconClassName}></i>{a.toAssetKind} '{a.toAssetName || "<unnamed>"}'
                    </QLink> )
      }           
    })
     
    return retval
  },
  
  
  render: function() 
  {
    if (!this.props.user)
      return null

    if (this.data.loading)
      return null      
      
    return (
        <div className="ui fluid inverted small vertical menu">
          <div className="item">
            <h3 className="ui inverted header" style={{textAlign: "center"}}>
              <i className="time icon" />
              Recently Edited
            </h3>
          </div>
          { this.renderMergedActivities() }
        </div>
    )
  }
})