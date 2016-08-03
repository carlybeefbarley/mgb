import _ from 'lodash'
import React, { PropTypes } from 'react'
import moment from 'moment'
import Plural from '/client/imports/helpers/Plural'

export default AssetHistoryDetail = React.createClass({

  propTypes: {
    assetId:       PropTypes.string.isRequired,        
    assetActivity: PropTypes.array,             // Can be empty while being loaded          
    currUser:      PropTypes.object                  // currently Logged In user (not always provided)
  },
  
  render() {
    // A list of Activity records for an Asset provided via getMeteorData()
    let { assetActivity } = this.props
    if (!assetActivity)
      return null
      
    let changes = _.map(assetActivity, a => { 
      const ago = moment(a.timestamp).fromNow()                   // TODO: Make reactive
      const href = (a.byUserId.indexOf("BY_SESSION") !== 0) ? {href:`/u/${a.byUserName}`} : {}  // See http://stackoverflow.com/questions/29483741/rendering-a-with-optional-href-in-react-js
      
      return <a className="item" key={a._id} title={ago} {...href}>
              {a.byUserName}: {a.description}
              </a>
    })
    
    let changesCount = changes.length   // Note this excludes ourselves

    return (
      <div className="ui simple dropdown small label item">
        <i className="icon lightning"></i>{Plural.numStr(changesCount, 'Change')}
        <div className="menu">
        { changes }
        </div>
      </div>
    )
  }
})