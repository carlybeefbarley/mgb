import _ from 'lodash'
import { Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import React from 'react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import UserCard from '../Users/UserCard'
import { Users } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'

const _nowrapStyle = {
  display: 'flex',
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
}

// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

const StudentListGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    studentIds: PropTypes.array.isRequired,
  },

  getMeteorData() {
    const { studentIds } = this.props
    const handleForUsers = Meteor.subscribe('users.getByIdList', studentIds)
    const selector = { _id: { $in: studentIds } }

    return {
      users: Users.find(selector).fetch(),
      loading: !handleForUsers.ready(),
    }
  },

  renderStudents() {
    return _.map(this.data.users, user => (
      <div key={user._id} style={{ margin: '0 1em 1em 0' }}>
        <UserCard narrowItem user={user} style={{ marginBottom: 0 }} />
      </div>
    ))
  },

  render() {
    if (this.data.loading) return <Spinner />

    if (_.isEmpty(this.data.users)) {
      return (
        <Segment tertiary style={{ padding: '6vh 0' }} textAlign="center">
          There are no students enrolled in this class.
        </Segment>
      )
    }

    return <div style={_nowrapStyle}>{this.renderStudents()}</div>
  },
})

export default StudentListGET
