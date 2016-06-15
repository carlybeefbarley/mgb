import React, {Component, PropTypes} from 'react';
import QLink from '../../routes/QLink';
import reactMixin from 'react-mixin';
import {Activity, ActivitySnapshots} from '../../schemas';
import { AssetKinds } from '../../schemas/assets';
import { ActivityTypes } from '../../schemas/activity.js';
import moment from 'moment';


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// GET - because this is a component that GETs it's own data via getMeteorData() callback

export default NavRecentGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:     PropTypes.object        // Currently Logged in user. Can be null/undefined  
  },
  
  getMeteorData: function() {
    if (!this.props.currUser)
      return {}
      
    let uid = this.props.currUser._id
    let handleForActivitySnapshots = Meteor.subscribe("activitysnapshots.userId", uid);
    let handleActivity = Meteor.subscribe("activity.public.recent.userId", uid) 

    return {
      activitySnapshots: ActivitySnapshots.find({ byUserId: uid }).fetch(),
      activity: Activity.find({ byUserId: uid }, {sort: {timestamp: -1}}).fetch(),
      loading: !handleActivity.ready() || !handleForActivitySnapshots.ready()
    }
  },

  enablePopups()
  {
    $(".hazRecentPopup").popup()
  },

  destroyPopups()
  {
     $(".hazRecentPopup").popup('destroy')
  },

  componentWillUnmount()
  {
    this.destroyPopups()
  },

  componentDidMount()
  {
    this.enablePopups()
  },

  componentDidUpdate()
  {
    this.enablePopups()
  },
  
  renderMergedActivities()   // merge and sort by timestamp.. assets only? idk
  {
    if (!this.props.currUser || this.data.loading)
      return null      
      
    let mergedArray = this.data.activity.concat(this.data.activitySnapshots)
    mergedArray = _.sortBy(mergedArray, x => { return -x.timestamp.getTime()})  // Sort by most recent
    mergedArray = _.uniqBy(mergedArray, 'toAssetId')    // Remove later duplicate assetIds
    let retval = { justNow: [], today: [], older: []}

    _.each(mergedArray, a => {
      if (a.toAssetId)
      {
        // We only add Asset activities so far - not profile views etc
        const isSnapshot = a.hasOwnProperty("currentUrl")
        const assetKindIconClassName = AssetKinds.getIconClass(a.toAssetKind)
        const assetActivityIconClass = isSnapshot ? "grey unhide icon" : ActivityTypes.getIconClass(a.activityType)

        const assetKindCap = capitalizeFirstLetter(a.toAssetKind)
        const assetThumbnailUrl = "/api/asset/thumbnail/png/" + a.toAssetId
        const mTime = moment(a.timestamp)
        const ago = (isSnapshot ? "Viewed" : ActivityTypes.getDescription(a.activityType)) + " - " + mTime.fromNow()                   // TODO: Make reactive
        const dataHtml = `<div><img src="${assetThumbnailUrl}" /><p><small style="text-align: center;">${ago}</small></p></div>`
        // Note that this uses the old /assetEdit route since I'd not originally stored the .toOwnerId id. Oh well, we'll take a redirect for now in those cases
        const linkTo = a.toOwnerId ? 
                        `/user/${a.toOwnerId}/asset/${a.toAssetId}` :   // New format as of Jun 8 2016
                        `/assetEdit/${a.toAssetId}`                     // Old format
        const item = ( 
          <div className="ui item hazRecentPopup"  key={a._id}  data-html={dataHtml} data-position="right center" >
            <i className={assetKindIconClassName}></i>
            <i className={assetActivityIconClass}></i>
            <QLink to={linkTo}>
              {assetKindCap} '{a.toAssetName || "<unnamed>"}'
            </QLink>
          </div> 
        )
        if (moment(a.timestamp).add(24, 'hours').isBefore())
          retval.older.push(item)
        else if ((moment(a.timestamp).add(6, 'minutes').isBefore()))
          retval.today.push(item)
        else
          retval.justNow.push(item)
      }           
    })
     

    return [<div className="item" key="_justNow">
              <div className="header">Just Now</div>
              <div className="menu">{retval.justNow}</div>
            </div>,
            <div className="item" key="_today">
              <div className="header">Today</div>
              <div className="menu">{retval.today}</div>
            </div>,
            <div className="item" key="_older">
              <div className="header">Older</div>
              <div className="menu">{retval.older}</div>
            </div>]
  },
  
  
  render: function() 
  {
    return (
        <div className="ui fluid inverted small vertical menu">
          <div className="item">
            <h3 className="ui inverted header" style={{textAlign: "center"}}>
              <i className="history icon" />
              History
            </h3>
          </div>
          { this.renderMergedActivities() }
        </div>
    )
  }
})