import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Popup } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { Activity, ActivitySnapshots } from '/imports/schemas'
import { AssetKinds } from '/imports/schemas/assets'
import { ActivityTypes } from '/imports/schemas/activity.js'
import moment from 'moment'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// GET - because this is a component that GETs it's own data via getMeteorData() callback

const NavRecentGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    styledForNavPanel: PropTypes.bool.isRequired, // True if we want the NavPanel style (inverted etc)   //TOD(@dgolds remove this old feature)
    showUserActivities: PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      showUserActivities: false,
    }
  },

  getMeteorData() {
    if (!this.props.currUser) return {}

    let uid = this.props.currUser._id
    let handleForActivitySnapshots = Meteor.subscribe('activitysnapshots.userId', uid)
    let handleActivity = Meteor.subscribe('activity.public.recent.userId', uid)

    return {
      activitySnapshots: ActivitySnapshots.find({ byUserId: uid }).fetch(),
      activity: Activity.find({ byUserId: uid }, { sort: { timestamp: -1 } }).fetch(),
      loading: !handleActivity.ready() || !handleForActivitySnapshots.ready(),
    }
  },

  renderMergedActivities() {
    // merge and sort by timestamp.. assets only? idk
    if (!this.props.currUser || this.data.loading) return null

    const isNp = this.props.styledForNavPanel

    let mergedArray = this.data.activity.concat(this.data.activitySnapshots)
    mergedArray = _.sortBy(mergedArray, x => {
      return -x.timestamp.getTime()
    }) // Sort by most recent
    mergedArray = _.uniqBy(mergedArray, 'toAssetId') // Remove later duplicate assetIds
    let retval = { justNow: [], today: [], older: [] }

    _.each(mergedArray, a => {
      const isSnapshot = a.hasOwnProperty('currentUrl')
      const mTime = moment(a.timestamp)
      const ago =
        (isSnapshot ? 'Viewed' : ActivityTypes.getDescription(a.activityType)) + ' - ' + mTime.fromNow() // TODO: Make reactive
      const basicDataElement = (
        <div>
          <small>{ago}</small>
        </div>
      )
      let item = null
      if (this.props.showUserActivities && a.activityType && a.activityType.startsWith('user.')) {
        item = (
          <Popup key={a._id} position="right center">
            trigger={
              <QLink to={`/u/${a.byUserName}`} className="ui item">
                <i className={'ui ' + ActivityTypes.getIconClass(a.activityType)} />
                {a.description}
              </QLink>
            }
            {basicDataElement}
          </Popup>
        )
      } else if (a.toAssetId) {
        // We only add Asset activities so far - not profile views etc
        const assetKindIconName = AssetKinds.getIconName(a.toAssetKind)
        const assetKindColor = AssetKinds.getColor(a.toAssetKind)
        const assetActivityIconClass = isSnapshot
          ? 'grey unhide icon'
          : ActivityTypes.getIconClass(a.activityType)
        const assetKindCap = capitalizeFirstLetter(a.toAssetKind)
        const assetNameTruncated =
          this.props.styledForNavPanel && a.toAssetName && a.toAssetName.length > 19
            ? a.toAssetName.substring(0, 19) + '...'
            : a.toAssetName
        const assetThumbnailUrl = Thumbnail.getLink(a.toAssetId, 60)
        const dataElement = (
          <div>
            <p>
              {assetKindCap}: {a.toAssetName}
            </p>
            <small>
              <p>{ago}</p>
            </small>
            <img style={{ maxWidth: '240px' }} src={assetThumbnailUrl} />
            <small>
              <p>Owner: {a.toOwnerName}</p>
            </small>
          </div>
        )
        // Note that this uses the old /assetEdit route since I'd not originally stored the .toOwnerId id. Oh well, we'll take a redirect for now in those cases
        const linkTo = a.toOwnerId
          ? `/u/${a.toOwnerName}/asset/${a.toAssetId}` // New format as of Jun 8 2016
          : `/assetEdit/${a.toAssetId}` // Old format. (LEGACY ROUTES for VERY old activity records). TODO: Nuke these and the special handlers
        item = (
          <Popup
            key={a._id}
            position="right center"
            trigger={
              <QLink to={linkTo} className="ui item">
                <span>
                  <Icon color={assetKindColor} name={assetKindIconName} />
                  {assetNameTruncated || '(unnamed)'}
                </span>
                <i className={assetActivityIconClass} />
              </QLink>
            }
          >
            {dataElement}
          </Popup>
        )
      } else if (a.activityType.startsWith('project.')) {
        item = (
          <Popup
            key={a._id}
            position="right center"
            trigger={
              <QLink to={`/u/${a.byUserName}/projects`} className="ui item">
                <i className={'ui ' + ActivityTypes.getIconClass(a.activityType)} />
                {a.description}
              </QLink>
            }
          >
            {basicDataElement}
          </Popup>
        )
      }

      if (item) {
        if (
          moment(a.timestamp)
            .add(24, 'hours')
            .isBefore()
        )
          retval.older.push(item)
        else if (
          moment(a.timestamp)
            .add(6, 'minutes')
            .isBefore()
        )
          retval.today.push(item)
        else retval.justNow.push(item)
      }
    })

    var retvalJsx = []

    const headerSty = isNp ? {} : { marginTop: '8px' }
    _.each(['justNow/Just Now', 'today/Today', 'older/Before today'], v => {
      const [k, txt] = v.split('/')
      if (retval[k].length > 0)
        retvalJsx.push(
          <div className="header item" style={headerSty} key={'_H' + k}>
            {txt}
          </div>,
          <div className="menu" key={'_M' + k}>
            {retval[k]}
          </div>,
        )
    })

    return retvalJsx
  },

  render() {
    const isNp = this.props.styledForNavPanel
    const inverted = isNp ? 'inverted' : 'borderless fitted '
    const menuSty = isNp ? { backgroundColor: 'transparent' } : { boxShadow: 'none', border: 'none' }
    // TODO: use site.less for styling inverted menu
    return (
      <div className={'ui fluid ' + inverted + ' vertical menu'} style={menuSty}>
        <div className="item">
          {isNp && (
            <h3 className={'ui ' + inverted + 'header'} style={{ textAlign: 'center' }}>
              <i className="history icon" />
              History
            </h3>
          )}
        </div>
        {this.renderMergedActivities()}
      </div>
    )
  },
})

export default NavRecentGET
