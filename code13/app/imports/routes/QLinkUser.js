import React, { PropTypes } from 'react';
import QLink from './QLink';

// This is designed primarily for the 'extra content' section of Cards

export default QLinkUser = React.createClass({

  propTypes: {
    targetUser: PropTypes.object
  },


  render: function () {
    const u = this.props.targetUser
    if (!u) return null

    return (
      <QLink to={`/user/${u._id}`}>
        <div className="right floated author">
          <img 
            className="ui avatar image" 
            src={u.profile.avatar}></img> {u.profile.name}
        </div>
      </QLink>
    )
  }
})