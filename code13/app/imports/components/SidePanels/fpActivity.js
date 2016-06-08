import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';
import {ActivityTypes} from '../../schemas/activity.js';
import {AssetKinds} from '../../schemas/assets';
import moment from 'moment';

export default fpActivity = React.createClass({
    
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },


  wrapActivity: function (key, ago, labelIconClass, labelExtraIconClass, uName, uId, actJSX) {
    return  <div className="event" key={key}>
              <div className="label">
                <i className={labelIconClass}></i>
              </div>
              <div className="content">
                <div className="summary">
                  <QLink to={"/user/" + uId}>
                    { uName }
                  </QLink>
                  <div className="date">
                    <small>{ago}</small>
                  </div>
                </div>
                <div className="extra text">
                  { labelExtraIconClass && <i className={labelExtraIconClass}></i> }
                  { actJSX }
                </div>                
              </div>             
            </div>
  },


  renderOneActivity: function(act, idx) {
    const iconClass = "ui " + ActivityTypes.getIconClass(act.activityType)
    const ago = moment(act.timestamp).fromNow()         // TODO: Make reactive

    if (act.activityType.startsWith("user.")) {
      return  this.wrapActivity(idx, ago, iconClass, null, act.byUserName, act.byUserId,
                <span>{act.description}</span>
      )
    }
    else if (act.activityType.startsWith("asset.")) {
      const assetKindIconClassName = AssetKinds.getIconClass(act.toAssetKind)
      const assetName = act.toAssetName || `(untitled ${AssetKinds.getName(act.toAssetKind)})`

      return  this.wrapActivity(idx, ago, iconClass, assetKindIconClassName, act.byUserName, act.byUserId, 
                <small>
                  <QLink to={"/assetEdit/" + act.toAssetId}>
                    {assetName}
                  </QLink>
                  <br></br>
                  &nbsp;{act.description}
                </small>
      )
    } 
    else if (act.activityType.startsWith("project.")) {
      return  this.wrapActivity(idx, ago, iconClass, null,  act.byUserName, act.byUserId,
                <span>
                  {act.description}
                </span>
      )
    }
    //else...
    return this.wrapActivity(idx, ago, iconClass, act.byUserName, act.byUserId,
                <div>{act.activityType} not known in this version</div>)             
  },


  renderActivityContent: function (activities) {
    let activityContent = activities.map((act, idx) => { 
      return this.renderOneActivity(act, idx)
    })
    return activityContent
  },

   
  render: function () {    
    return  <div className="ui feed">
              { this.renderActivityContent(this.props.activity) }
            </div>
  }
  
})