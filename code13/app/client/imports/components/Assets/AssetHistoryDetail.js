import _ from 'lodash'
import React, { PropTypes } from 'react'
import moment from 'moment'
import Plural from '/client/imports/helpers/Plural'

const SESSION_MAGIC_TEXT = "BY_SESSION:" 
const _getCurrUserIdentifier = (currUser) => (currUser ? currUser._id : SESSION_MAGIC_TEXT + Meteor.default_connection._lastSessionId)

const ACTIVE_OTHER_PERSON_EDITING_HIGHLIGHT_MS = 1000 * 30    // Highlight if another person changed this in last N seconds

export default AssetHistoryDetail = React.createClass({

  propTypes: {
    assetId:       PropTypes.string.isRequired,        
    assetActivity: PropTypes.array,             // Can be empty while being loaded          
    currUser:      PropTypes.object                  // currently Logged In user (not always provided)
  },
  
  render() {
    // A list of Activity records for an Asset provided via getMeteorData()
    let { assetActivity, currUser } = this.props
    if (!assetActivity)
      return null

    let now = new Date()
    var currUserId = _getCurrUserIdentifier(currUser)
    let numRecentOtherEdits = _.filter(assetActivity, a => (currUserId !== a.byUserId && (now - a.timestamp) < ACTIVE_OTHER_PERSON_EDITING_HIGHLIGHT_MS) ).length

    let changes = _.map(assetActivity, a => { 
      const ago = moment(a.timestamp).fromNow()                   // TODO: Make reactive
      const href = (a.byUserId.indexOf(SESSION_MAGIC_TEXT) !== 0) ? {href:`/u/${a.byUserName}`} : {}  // See http://stackoverflow.com/questions/29483741/rendering-a-with-optional-href-in-react-js
      
      return (
        <a className="item" key={a._id} title={ago} {...href}>
          {a.byUserName}: {a.description}
        </a>
      )
    })
    
    let changesCount = changes.length   // Note this excludes ourselves
    let highlightClass = numRecentOtherEdits > 0 ? "black" : "grey"
    
    return (
      <div className={`ui simple dropdown small basic ${highlightClass} pointing below label item`}>
        <i className="icon lightning"></i>{Plural.numStr(changesCount, 'Change')}
        <div className="menu">
        { changes }
        </div>
      </div>
    )
  }
})