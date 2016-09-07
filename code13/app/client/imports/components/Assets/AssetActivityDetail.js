import _ from 'lodash'
import React, { PropTypes } from 'react'
import moment from 'moment'
import Plural from '/client/imports/helpers/Plural'

// This is the  VIEWERS  ui that shows other active viewers

const SESSION_MAGIC_TEXT = "BY_SESSION:" 
const _getCurrUserIdentifier = (currUser) => (currUser ? currUser._id : SESSION_MAGIC_TEXT + Meteor.default_connection._lastSessionId)

export default AssetActivityDetail = React.createClass({

  propTypes: {
    assetId: PropTypes.string.isRequired,        
    activitySnapshots: PropTypes.array,                // Can be empty while being loaded          
    currUser: PropTypes.object                  // currently Logged In user (not always provided)
  },
  
  render() {
    // A list of ActivitySnapshots provided via getMeteorData(), including one by ourself probably
    const { activitySnapshots, currUser } = this.props
    if (!activitySnapshots)
      return null
      
    var currUserId = _getCurrUserIdentifier(currUser)
    let othersActivities =  _.filter(activitySnapshots, a => currUserId !== a.byUserId)                            
    let viewers = _.map(othersActivities, a => { 
      const ago = moment(a.timestamp).fromNow()                   // TODO: Make reactive
      const href = (a.byUserId.indexOf(SESSION_MAGIC_TEXT) !== 0) ? {href:`/u/${a.byUserName}`} : {}  // See http://stackoverflow.com/questions/29483741/rendering-a-with-optional-href-in-react-js
      let detail2 = null
      if (a.toAssetKind === "code")
        detail2 = ` at line ${a.passiveAction.position.line+1}`
      else if (a.toAssetKind === "graphic")
        detail2 = ` at frame #${a.passiveAction.selectedFrameIdx+1}`
      
      return <a className="item" key={a._id} title={ago} {...href}>
              {a.byUserName}{detail2}
              </a>
    })
    
    const viewersCount = viewers.length   // Note this excludes ourselves
    const pointingClass = viewersCount ? "black pointing below" : "grey" 
    
    return (
      <div className={`ui simple dropdown small basic ${pointingClass} label item`} style={{marginBottom: "4px"}}>
        <i className="unhide icon"></i>{Plural.numStr(viewersCount, 'Viewer')}
        <div className="menu">
          { viewers }
        </div>
      </div>
    )
  }
})