import _ from 'lodash'
import React, { PropTypes } from 'react'
import UserList from '/client/imports/components/Users/UserList'

export default class FeaturedUsers extends React.Component {
  static propTypes = {
    users: PropTypes.array,
    limit: PropTypes.number,
  }

  render() {
    if (_.isEmpty(this.props.users)) return null

    const users = _.slice(this.props.users, 0, this.props.limit)
    return <UserList users={users} title={'Featured users'} narrowItem />
  }
}
