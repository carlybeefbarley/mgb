import _ from 'lodash';
import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import NavRecentGET from '/client/imports/components/Nav/NavRecentGET.js';

export default UserHistoryRoute = React.createClass({

  propTypes: {
    query: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  },
  

  renderUserNotFound: function() {
    return (
      <div className="ui segment">
        <div className="ui error message">
          <div className="header">
            User not found
          </div>
          <p>This user does not exist. Weird.</p>
        </div>
      </div>
    );
  },


  render: function() {
    const { user } = this.props

    if (!user)
      return this.renderUserNotFound()

    return (
      <div className="ui padded grid">
        <Helmet
          title={user.profile.name}
          meta={[
              {"name": "description", "content": user.profile.name + "\'s history"}
          ]}
        />
        <NavRecentGET styledForNavPanel={false} currUser={user}/>
      </div>
    )
  }

})