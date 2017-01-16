import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import reactMixin from 'react-mixin'
import {Activity, ActivitySnapshots} from '/imports/schemas'
import { AssetKinds } from '/imports/schemas/assets'
import { ActivityTypes } from '/imports/schemas/activity.js'
import moment from 'moment'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// GET - because this is a component that GETs it's own data via getMeteorData() callback

export default NavRecentGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:            PropTypes.object,           // Currently Logged in user. Can be null/undefined
    styledForNavPanel:   PropTypes.bool.isRequired,  // True if we want the NavPanel style (inverted etc)
    navPanelIsOverlay:   PropTypes.bool,             // If true, we must close NavPanel when links are clicked.. we do this with a QLink option    
    showUserActivities:  PropTypes.bool.isRequired
  },

  getDefaultProps: function()
  {
    return {
      showUserActivities: false
    }
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

  componentWillUnmount()
  {
    $(".hazRecentPopup").popup('destroy')
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

    const isNp = this.props.styledForNavPanel

    let mergedArray = this.data.activity.concat(this.data.activitySnapshots)
    mergedArray = _.sortBy(mergedArray, x => { return -x.timestamp.getTime()})  // Sort by most recent
    mergedArray = _.uniqBy(mergedArray, 'toAssetId')    // Remove later duplicate assetIds
    let retval = { justNow: [], today: [], older: []}

    const { navPanelIsOverlay } = this.props


    _.each(mergedArray, a => {
      const isSnapshot = a.hasOwnProperty("currentUrl")
      const mTime = moment(a.timestamp)
      const ago = (isSnapshot ? "Viewed" : ActivityTypes.getDescription(a.activityType)) + " - " + mTime.fromNow()                   // TODO: Make reactive
      const basicDataHtml = `<div><small>${ago}</small></div>`
      let item = null
      if (this.props.showUserActivities && a.activityType && a.activityType.startsWith("user.")) {

        item = (
          <QLink 
              to={`/u/${a.byUserName}`} 
              closeNavPanelOnClick={navPanelIsOverlay}
              className="ui item" 
              key={a._id}  
              data-html={basicDataHtml} 
              data-position="right center" >
            <i className={"ui " + ActivityTypes.getIconClass(a.activityType)}></i>
            {a.description}
          </QLink>
        )
      }
      else if (a.toAssetId)
      {
        // We only add Asset activities so far - not profile views etc
        const assetKindIconClassName = AssetKinds.getIconClass(a.toAssetKind)
        const assetKindColor = AssetKinds.getColor(a.toAssetKind)
        const assetActivityIconClass = isSnapshot ? "grey unhide icon" : ActivityTypes.getIconClass(a.activityType)
        const assetKindCap = capitalizeFirstLetter(a.toAssetKind)
        const assetNameTruncated = (this.props.styledForNavPanel && a.toAssetName && a.toAssetName.length > 19) ? a.toAssetName.substring(0, 19) + "..." : a.toAssetName
        const dataHtml = `<div><p>${assetKindCap}: ${a.toAssetName}</p><small><p>${ago}</p></small><Thumbnail style="max-width: 240px;" id={a.toAssetId}  expires={60}/><small><p>Owner: ${a.toOwnerName}</p></small></div>`
        // Note that this uses the old /assetEdit route since I'd not originally stored the .toOwnerId id. Oh well, we'll take a redirect for now in those cases
        const linkTo = a.toOwnerId ?
                        `/u/${a.toOwnerName}/asset/${a.toAssetId}` :   // New format as of Jun 8 2016
                        `/assetEdit/${a.toAssetId}`                    // Old format. (LEGACY ROUTES for VERY old activity records). TODO: Nuke these and the special handlers
        item = (
          <QLink 
              to={linkTo} 
              closeNavPanelOnClick={navPanelIsOverlay}
              className="ui item hazRecentPopup"  
              key={a._id}  
              data-html={dataHtml} 
              data-position="right center" >
            <span>
              <i className={assetKindColor + ' ' + assetKindIconClassName} />{assetNameTruncated || "(unnamed)"}
            </span>
            <i className={assetActivityIconClass}></i>
          </QLink>
        )
      }
      else if (a.activityType.startsWith("project.")) {
        item = (
          <QLink 
              to={`/u/${a.byUserName}/projects`} 
              closeNavPanelOnClick={navPanelIsOverlay}
              className="ui item" 
              key={a._id}  
              data-html={basicDataHtml} 
              data-position="right center" >
            <i className={"ui " + ActivityTypes.getIconClass(a.activityType)}></i>
            {a.description}
          </QLink>
        )
      }

      if (item)
      {
        if (moment(a.timestamp).add(24, 'hours').isBefore())
          retval.older.push(item)
        else if ((moment(a.timestamp).add(6, 'minutes').isBefore()))
          retval.today.push(item)
        else
          retval.justNow.push(item)
      }
    })

    var retvalJsx = []

    const hdrSty = isNp ? {} : {marginTop: "8px"}
    _.each([ "justNow/Just Now", "today/Today", "older/Before today"], v => {
      const [k, txt] = v.split("/")
      if (retval[k].length > 0)
        retvalJsx.push(
          <div className="header item" style={hdrSty} key={"_H"+k}>{txt}</div>,
          <div className="menu" key={"_M"+k}>{retval[k]}</div>
        )
    })

    return retvalJsx
  },


  render: function()
  {
    const isNp = this.props.styledForNavPanel
    const inverted = isNp ? "inverted" : "borderless fitted "
    const menuSty = isNp ? { backgroundColor: "transparent" } : { boxShadow: "none", border: "none"}
    // TODO: use site.less for styling inverted menu
    return (
        <div className={"ui fluid " + inverted + " vertical menu"} style={menuSty}>
          <div className="item">
            { isNp &&
              <h3 className={"ui " + inverted + "header"} style={{textAlign: "center"}}>
                <i className="history icon" />
                History
              </h3>
            }
          </div>
          { this.renderMergedActivities() }
        </div>
    )
  }
})
