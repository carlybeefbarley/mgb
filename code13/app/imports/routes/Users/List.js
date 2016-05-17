import React, {Component, PropTypes} from 'react';
import reactMixin from 'react-mixin';
import {ReactMeteorData} from 'meteor/react-meteor-data';

import {Users} from '../../schemas';
import UserCard from '../../components/Users/UserCard';
import Spinner from '../../components/Nav/Spinner';
import UserList from '../../components/Users/UserList';

export default UserListRoute = React.createClass({
  mixins: [ReactMeteorData],
  propTypes : {
    query: PropTypes.object
  },

  getInitialState: function() {
    return {
      userLimit: 10
    }
  },
  
  getMeteorData() {
    let handle = Meteor.subscribe("users", this.state.userLimit);
    return {
      users: Meteor.users.find().fetch(),
      loading: !handle.ready()
    };
  },

  // TODO: Pagination is simplistic. Needs work to append users instead of refreshing whole list

  render() {
    if (this.data.loading) {
      return (<div><Spinner /></div>);
    }

    return (
      <div className="ui padded segment">
        <h1>{this.data.users.length} Users</h1>

        <div className="ui segment">
            <UserList users={this.data.users} />
        </div>
        <button onClick={this.handleLoadMore} className="ui button">Load more</button>
      </div>
    )
  },

  handleLoadMore() {
    this.setState({userLimit: this.state.userLimit + 3})
  }
})
