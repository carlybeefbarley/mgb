import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Header } from 'semantic-ui-react'

import UserList from '/client/imports/components/Users/UserList'

export default class FeaturedUsers extends React.Component {
  static propTypes = {
    inverted: PropTypes.bool,
    users: PropTypes.array,
  }

  render() {
    const { inverted, users } = this.props

    if (_.isEmpty(users)) return null

    return (
      <div>
        <Header as="h3" inverted={inverted} color={!inverted ? 'grey' : null} content="Featured Users" />
        <UserList users={users} narrowItem />
      </div>
    )
  }
}
