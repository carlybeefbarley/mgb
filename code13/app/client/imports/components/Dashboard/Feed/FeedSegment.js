import _ from 'lodash'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import React from 'react'
import { Segment, List, Header, Icon } from 'semantic-ui-react'

import SpecialGlobals from '/imports/SpecialGlobals'
import { Activity } from '/imports/schemas'
import { getFeedSelector } from '/imports/schemas/activity'

import FeedItem from './FeedItem'

const segmentStyle = {
  maxHeight: '20em',
  overflowY: 'auto',
}

const FeedSegment = React.createClass({
  propTypes: {
    activities: PropTypes.array,
    currUser: PropTypes.object,
    loading: PropTypes.bool,
  },

  render: function() {
    const { activities, currUser, loading } = this.props

    if (loading) return <Icon loading />

    return (
      <div>
        <Header as="h3" color="grey" textAlign="center" content="Activity" />
        <Segment style={segmentStyle}>
          {
            <List>
              {_.isEmpty(activities) ? (
                <List.Item content="Your feed is empty right now" />
              ) : (
                _.map(activities, activity => (
                  <FeedItem key={activity._id} activity={activity} currUser={currUser} />
                ))
              )}
            </List>
          }
        </Segment>
      </div>
    )
  },
})

export default createContainer(({ currUser }) => {
  const handleActivity = Meteor.subscribe(
    'activity.private.feed.recent.userId',
    currUser._id,
    currUser.profile.name,
    SpecialGlobals.activity.feedLimit,
  )

  return {
    activities: Activity.find(getFeedSelector(currUser._id, currUser.profile.name), {
      sort: { timestamp: -1 },
    }).fetch(),
    currUser,
    loading: !handleActivity.ready(),
  }
}, FeedSegment)
