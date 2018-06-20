import _ from 'lodash'
import { Button, Segment, List } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import React from 'react'
import { ReactMeteorData } from 'meteor/react-meteor-data'

import { Users } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'

// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

const StudentListGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    assignment: PropTypes.object.isRequired, // A assignment record from the DB. See assignments.js
  },

  getMeteorData() {
    const assignment = this.props.assignment
    let idArray = assignment.memberIds.slice()
    const handleForUsers = Meteor.subscribe('users.getByIdList', idArray)
    const selector = { _id: { $in: idArray } }

    return {
      users: Users.find(selector).fetch(),
      loading: !handleForUsers.ready(),
    }
  },

  renderCompletedList() {
    return _.map(this.data.users, user => (
      <List.Item key={user._id}>
        <List.Header as="a">{user.profile.name}</List.Header>
        <List.Description>
          Assignment completed on {new Date(2018, 6, Math.floor(Math.random() * 21) + 15).toDateString()}
        </List.Description>
      </List.Item>
    ))
  },

  renderIncompleteList() {
    return _.map(this.data.users, user => (
      <List.Item key={user._id}>
        <List.Header as="a">{user.name}</List.Header>
        <List.Description>2/3 assets complete</List.Description>
      </List.Item>
    ))
  },

  render() {
    if (this.data.loading) return <Spinner />

    if (_.isEmpty(this.data.users)) {
      return (
        <Segment tertiary style={{ padding: '6vh 0' }} textAlign="center">
          Add some members to get started.
        </Segment>
      )
    }

    return (
      <List relaxed divided style={{ paddingBottom: '1em !important' }}>
        {this.renderCompletedList()}
      </List>
    )
  },
})

export default StudentListGET
