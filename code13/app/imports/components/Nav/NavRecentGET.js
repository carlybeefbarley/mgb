import React, {Component, PropTypes} from 'react';
import QLink from '../../routes/QLink';
import reactMixin from 'react-mixin';
import {Activity, ActivitySnapshots} from '../../schemas';
import {AssetKinds} from '../../schemas/assets';
import moment from 'moment';


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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
    if (!this.props.user || this.data.loading)
      return null      
      
    let mergedArray = this.data.activity.concat(this.data.activitySnapshots)
    mergedArray = _.sortBy(mergedArray, x => { return -x.timestamp.getTime()})  // Sort by most recent
    mergedArray = _.uniqBy(mergedArray, 'toAssetId')    // Remove later duplicate assetIds
    let retval = []

    _.each(mergedArray, a => {
      const ago = moment(a.timestamp).fromNow()                   // TODO: Make reactive
      if (a.toAssetId)
      {
        // We only add Asset activities so far - not profile views etc
        const assetKindIconClassName = AssetKinds.getIconClass(a.toAssetKind)
        const assetKindCap = capitalizeFirstLetter(a.toAssetKind)
        const assetThumbnailUrl = "/api/asset/thumbnail/png/" + a.toAssetId
        const dataHtml = `<img src="${assetThumbnailUrl}" />`
        //  title={ago} 
        retval.push( 
          <div className="ui item hazRecentPopup"  key={a._id}  data-html={dataHtml} data-position="right center" >
            <QLink to={"/assetEdit/" + a.toAssetId} >
              <i className={assetKindIconClassName}></i>{assetKindCap} '{a.toAssetName || "<unnamed>"}'
            </QLink>
          </div> 
        )
      }           
    })
     
    return retval
  },
  
  
  render: function() 
  {
    return (
        <div className="ui fluid inverted small vertical menu">
          <div className="item">
            <h3 className="ui inverted header" style={{textAlign: "center"}}>
              <i className="time icon" />
              My Recents
            </h3>
          </div>
          { this.renderMergedActivities() }
        </div>
    )
  }
})