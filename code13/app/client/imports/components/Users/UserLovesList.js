import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Header } from "semantic-ui-react"
import { createContainer } from 'meteor/react-meteor-data'
import { Activity } from '/imports/schemas'
import moment from 'moment'

const UserLovesListUI = ( { user, loveAct } ) => (
  <div>
    <Header as="h2" content={`${user ? user.username : '???'}'s asset love history`}/>
    { _.map(loveAct, a => (
      <div key={a._id} >
        <span>You loved </span>
        <QLink to={`/u/${a.byOwnerName}/asset/${a.toAssetId}`}>
          {a.toAssetName}
        </QLink>
        <span> by </span>
        <QLink to={`/u/${a.byOwnerName}`}>
          {a.toOwnerName}
        </QLink>
        <small style={{color: '#c8c8c8'}}>&ensp;{moment(a.timestamp).fromNow()}</small>
      </div>
      )
    ) }
  </div>
)

UserLovesListUI.PropTypes = {
  user:       PropTypes.object,
  loveAct:    PropTypes.array
}

const UserLovesList = createContainer( props => {
  const userId = props.user._id ? props.user._id : null
  if (userId) {
    let handleActivity = Meteor.subscribe("activity.public.recent.userId")
    let selector = {
      byUserId: userId, 
      activityType: "asset.userLoves" 
    }
    let findOpts = {sort : { timestamp: -1 } }
    return {
      loveAct: Activity.find(selector, findOpts).fetch(),
      loading: !handleActivity.ready()
    }
  }
}, UserLovesListUI)
export default UserLovesList