import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Container, Segment, List, Header } from 'semantic-ui-react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { Activity, ActivitySnapshots } from '/imports/schemas'
import ActivityItem from '/client/imports/components/Activities/ActivityItem'

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

    let mergedArray = this.data.activity.concat(this.data.activitySnapshots)
    // Sort by most recent
    mergedArray = _.sortBy(mergedArray, x => {
      return -x.timestamp.getTime()
    })
    mergedArray = _.uniqBy(mergedArray, 'toAssetId') // Remove later duplicate assetIds

    return _.map(mergedArray, activity => <ActivityItem key={activity._id} hideUser activity={activity} />)
  },

  render() {
    const isNp = this.props.styledForNavPanel
    if (isNp)
      return (
        <Container>
          <Segment padded basic>
            <Header as="h2">Activity</Header>
            <Segment padded>
              <List>{this.renderMergedActivities()}</List>
            </Segment>
          </Segment>
        </Container>
      )
    else return <List>{this.renderMergedActivities()}</List>
  },
})

export default NavRecentGET
