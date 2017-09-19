import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'

// The Create Project link is always in context of a user since only a user can create a project in their account.

const CreateProjectLinkButton = React.createClass({
  PropTypes: {
    currUser: PropTypes.object, // Currently Logged in user. Can be null
  },

  render() {
    const { currUser } = this.props

    if (!currUser) return null

    const to = `/u/${currUser.profile.name}/projects/create`

    return (
      <div className="ui green tiny button">
        <QLink to={to} className="item" elOverride="div">
          Create New Project
        </QLink>
      </div>
    )
  },
})

export default CreateProjectLinkButton
