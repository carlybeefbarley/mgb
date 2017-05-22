import React, { PropTypes } from 'react'
import { Grid, List, Header } from "semantic-ui-react";
import { createContainer } from 'meteor/react-meteor-data'
import { Activity } from '/imports/schemas'
import moment from 'moment'
import _ from 'lodash'

const UserLovesListUI = props => (
  <div>
  <Header as="h2" content="Your asset love history"/>
  {_.map(props.loveAct, a => {
    const ago = moment(a.timestamp).fromNow()
    return (
    <div key={a._id} >
    <span>You loved {a.toAssetName} by </span>
        <QLink to={`/u/${a.byOwnerName}`}>
          {a.toOwnerName}
        </QLink>
        <small style={{color: '#c8c8c8'}}>&ensp;{ago}</small>
    </div>
    )
  })}
  </div>
)
UserLovesListUI.PropTypes = {
  user:       PropTypes.object,
  loveAct:    PropTypes.array
}

const UserLovesList = createContainer ((props)=> {
  let userId = props.user._id ? props.user._id : null
  if(userId){
    let handleActivity = Meteor.subscribe("activity.public.recent.userId")
    let selector = { byUserId: userId, activityType: "asset.userLoves" }
    let findOpts = {sort : {timestamp: -1} }
    return {
      loveAct: Activity.find(selector, findOpts).fetch(),
      loading: !handleActivity.ready()
    };
  }
}, UserLovesListUI);
export default UserLovesList