import _ from 'lodash'
import { Button, Icon, Segment } from 'semantic-ui-react'
import React, { PropTypes } from 'react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import UserCard from '../Users/UserCard'

const _nowrapStyle = {
  display: 'flex',
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
}

const _buttonStyle = {
  width: '116px', // This should match the narrow UserCard width
}

// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

const ProjectMembersGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    project: PropTypes.object.isRequired, // A project record from the DB. See projects.js
    enableRemoveButton: PropTypes.bool, // If provided, then show a remove button
    handleRemove: PropTypes.func, // If provided, then this is the remove callback
    enableLeaveButton: PropTypes.string, // If not undefined/null/"", then show a remove button for the userID that matches this string (basically currUser)
    handleLeave: PropTypes.func, // If provided, then this is the callback for the currentlyLoggedIn user to Leave the project. For super-paranoia, consider also passing in the username (but this is a matter of taste).
  },

  getMeteorData() {
    const project = this.props.project
    let idArray = project.memberIds.slice()
    const handleForUsers = Meteor.subscribe('users.getByIdList', idArray)
    const selector = { _id: { $in: idArray } }

    return {
      users: Meteor.users.find(selector).fetch(),
      loading: !handleForUsers.ready(),
    }
  },

  renderMembers() {
    const { enableLeaveButton, enableRemoveButton } = this.props

    return _.map(this.data.users, user => (
      <Segment basic key={user._id} style={{ marginTop: 0 }}>
        <UserCard narrowItem user={user} style={{ paddingBottom: 0 }} />
        <div className="ui bottom attached buttons">
          {enableLeaveButton && enableLeaveButton === user._id ? (
            <Button
              style={_buttonStyle}
              onClick={this.handleLeave.bind(this, user)}
              icon={{ name: 'sign out', color: 'red' }}
              content="Leave"
            />
          ) : enableRemoveButton ? (
            <Button
              style={_buttonStyle}
              onClick={this.handleRemove.bind(this, user)}
              icon={{ name: 'remove', color: 'red' }}
              content="Remove"
            />
          ) : null}
        </div>
      </Segment>
    ))
  },

  handleRemove(user) {
    var handler = this.props.handleRemove
    handler && handler(user._id, user.profile.name)
  },

  handleLeave(user) {
    var handler = this.props.handleLeave
    handler && handler(user._id, user.profile.name)
  },

  render() {
    if (this.data.loading) return null

    return <div style={_nowrapStyle}>{this.renderMembers()}</div>
  },
})

export default ProjectMembersGET
