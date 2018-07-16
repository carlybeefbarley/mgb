import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'semantic-ui-react'

import QLink from '/client/imports/routes/QLink'

// The Create Project link is always in context of a user since only a user can create a project in their account.

export default class CreateProjectLinkButton extends React.PureComponent{
  static PropTypes = {
    currUser: PropTypes.object, // Currently Logged in user. Can be null
  }

  render() {
    const { currUser } = this.props

    if (!currUser) return null

    const to = `/u/${currUser.profile.name}/projects/create`

    return (
      <Button as={QLink} to={to} color="green" size="tiny">
        Create New Project
      </Button>
    )
  }
}