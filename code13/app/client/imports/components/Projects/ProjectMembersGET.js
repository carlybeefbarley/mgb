import _ from 'lodash'
import { Button, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import React from 'react'
import { withTracker } from 'meteor/react-meteor-data'

import { Users } from '/imports/schemas'
import UserCard from '../Users/UserCard'
import Spinner from '/client/imports/components/Nav/Spinner'

const _nowrapStyle = {
  display: 'flex',
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
}

// ...GET - because this is a component that GETs it's own data via withTracker() HoC

class ProjectMembersGET extends React.PureComponent{

  static propTypes = {
    project: PropTypes.object.isRequired, // A project record from the DB. See projects.js
    enableRemoveButton: PropTypes.bool, // If provided, then show a remove button
    handleRemove: PropTypes.func, // If provided, then this is the remove callback
    enableLeaveButton: PropTypes.string, // If not undefined/null/"", then show a remove button for the userID that matches this string (basically currUser)
    handleLeave: PropTypes.func, // If provided, then this is the callback for the currentlyLoggedIn user to Leave the project. For super-paranoia, consider also passing in the username (but this is a matter of taste).
  }

  renderMembers = () => {
    const { enableLeaveButton, enableRemoveButton, users } = this.props

    return _.map(users, user => (
      <div key={user._id} style={{ margin: '0 1em 1em 0' }}>
        <UserCard narrowItem user={user} style={{ marginBottom: 0 }} />
        {enableLeaveButton && enableLeaveButton === user._id ? (
          <Button
            fluid
            onClick={() => {this.handleLeave(user)}}
            icon={{ name: 'sign out', color: 'red' }}
            content="Leave"
          />
        ) : enableRemoveButton ? (
          <Button
            fluid
            onClick={() => {this.handleRemove(user)}}
            icon={{ name: 'remove', color: 'red' }}
            content="Remove"
          />
        ) : null}
      </div>
    ))
  }

  handleRemove = (user) => {
    const handler = this.props.handleRemove
    handler && handler(user._id, user.profile.name)
  }

  handleLeave = (user) => {
    const handler = this.props.handleLeave
    handler && handler(user._id, user.profile.name)
  }

  render() {
    if (this.props.loading) return <Spinner />

    if (_.isEmpty(this.props.users)) {
      return (
        <Segment tertiary style={{ padding: '6vh 0' }} textAlign="center">
          Add some members to get started.
        </Segment>
      )
    }

    return <div style={_nowrapStyle}>{this.renderMembers()}</div>
  }
}

export default withTracker(props => {
  const project = props.project
    const idArray = project.memberIds.slice()
    const handleForUsers = Meteor.subscribe('users.getByIdList', idArray)
    const selector = { _id: { $in: idArray } }

    return {
      ...props,
      users: Users.find(selector).fetch(),
      loading: !handleForUsers.ready(),
    }
})(ProjectMembersGET)
