import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Segment, List, Header, Icon } from 'semantic-ui-react'
import FeedItem from './FeedItem'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import SpecialGlobals from '/imports/SpecialGlobals'
import { Activity } from '/imports/schemas'
import { getFeedSelector } from '/imports/schemas/activity'

const FeedSegment = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser: PropTypes.object,
  },

  getMeteorData: function() {
    const handleActivity = Meteor.subscribe(
      'activity.private.feed.recent.userId',
      this.props.currUser._id,
      this.props.currUser.profile.name,
      SpecialGlobals.activity.feedLimit,
    )

    return {
      activities: Activity.find(getFeedSelector(this.props.currUser._id, this.props.currUser.profile.name), {
        sort: { timestamp: -1 },
      }).fetch(),
      loading: !handleActivity.ready(),
    }
  },

  render: function() {
    if (this.data.loading) return <Icon loading />

    return (
      <Segment>
        <Header as="h3">Your Feed</Header>
        <div>
          <List>
            {_.map(this.data.activities, activity => (
              <FeedItem key={activity._id} activity={activity} currUser={this.props.currUser} />
            ))}
          </List>
        </div>
      </Segment>
    )
  },
})

export default FeedSegment
