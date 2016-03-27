import React, { Component, PropTypes } from 'react';
import UserCard from '../../components/Users/UserCard';
import {Link} from 'react-router';
import EditProfile from '../../components/Users/EditProfile';
import Helmet from 'react-helmet';

export default UserProfileRoute = React.createClass({
  propTypes: {
    query: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  },
  
  render: function() {
    const {user, ownsProfile, currUser} = this.props;

    //Checks for edit query on route
    const { query } = this.props.location
    const edit = query && query.edit == "true"

    //if id params don't link to a user...
    if (!user) {
      return (
        <div>No user found at this address</div>
      );
    }

    const email = user.emails && user.emails[user.emails.length - 1].address ? user.emails[user.emails.length - 1].address : 'None@none.com';

    //if user is looking at their own profile and edit query is on on route
    if (edit && ownsProfile) {
      return (
        <EditProfile user={currUser} email={email} />
      )
    }

    //if user doesn't own profile but is trying to edit it...
    if (edit) {
      return (
        <div>You don't have permission to edit {user.profile.name}'s profile.</div>
      )
    }

    return (
      <div className="ui padded segment">
        <Helmet
          title={user.profile.name}
          meta={[
              {"name": "description", "content": user.profile.name + "\'s profile"}
          ]}
        />

        <h1>{user.profile.name}</h1>
        <div>
          <div>
            <UserCard
              user={user}
              name={user.profile.name}
              avatar={user.profile.avatar}
              title={user.profile.title}
              bio={user.profile.bio}
              createdAt={user.createdAt}
              email={email} />

              <Link to={`/user/${user._id}/assets`}  >
                <button>See Assets</button>
              </Link>
           </div>
         </div>
      </div>
    );
  }
})
