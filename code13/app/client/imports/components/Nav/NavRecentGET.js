import React, {Component, PropTypes} from 'react';
import QLink from '/client/imports/routes/QLink';
import reactMixin from 'react-mixin';
import {Activity, ActivitySnapshots} from '/imports/schemas';
import { AssetKinds } from '/imports/schemas/assets';
import { ActivityTypes } from '/imports/schemas/activity.js';
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
        const dataHtml = `<div><small><p>${ago}</p></small><img src="${assetThumbnailUrl}" /><small><p>Owner: ${a.toOwnerName}</p></small></div>`
        // Note that this uses the old /assetEdit route since I'd not originally stored the .toOwnerId id. Oh well, we'll take a redirect for now in those cases
        const linkTo = a.toOwnerId ? 
                        `/u/${a.toOwnerName}/asset/${a.toAssetId}` :   // New format as of Jun 8 2016
                        `/assetEdit/${a.toAssetId}`                     // Old format. (LEGACY ROUTES for VERY old activity records). TODO: Nuke these and the special handlers
        const item = ( 
          <QLink to={linkTo} className="ui item hazRecentPopup"  key={a._id}  data-html={dataHtml} data-position="right center" >
            <i className={assetKindIconClassName}></i>
            <i className={assetActivityIconClass}></i>
            {assetKindCap} '{a.toAssetName || "<unnamed>"}'
          </QLink>
        )
        if (moment(a.timestamp).add(24, 'hours').isBefore())
          retval.older.push(item)
        else if ((moment(a.timestamp).add(6, 'minutes').isBefore()))
          retval.today.push(item)
        else
          retval.justNow.push(item)
      }           
    })
     

    return [<div className="header item" key="_justNow">Just Now</div>,
            <div className="menu" key="_justNow2">{retval.justNow}</div>,

            <div className="header item" key="_today">Today</div>,
            <div className="menu" key="_today2">{retval.today}</div>,

            <div className="header item" key="_older">Older</div>,
            <div className="menu" key="_older2">{retval.older}</div>
            ]
  },
  
  
  render: function() 
  {
    return (
        <div className="ui fluid inverted  vertical menu">
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