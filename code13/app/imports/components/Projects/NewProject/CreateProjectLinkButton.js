import React, { PropTypes } from 'react';
import QLink from '/imports/routes/QLink';

// The Create Project link is always in context of a user since only a user can create a project in their account. 

export default CreateProjectLinkButton = React.createClass({
  PropTypes: {
    currUser: PropTypes.object            // Currently Logged in user. Can be null
  },

  render: function() {
    const { currUser } = this.props

    if (!currUser)
      return null

    const to=`/u/${currUser.profile.name}/projects/create`

    return (
      <div className="ui green compact tiny inverted menu">
        <QLink to={to} className="item">
          Create New Project
          </QLink>
      </div>
    )
  }

})