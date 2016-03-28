import React, {Component, PropTypes} from 'react';
import reactMixin from 'react-mixin';
import {ReactMeteorData} from 'meteor/react-meteor-data';

import Nav from '../components/Nav/Nav';
import Sidebar from '../components/Sidebar/Sidebar';
import Helmet from "react-helmet";
import {Users, Activity} from '../schemas';

import Spinner from '../components/Spinner/Spinner';
import Toast from '../components/Toast/Toast';

export default App = React.createClass({
  mixins: [ReactMeteorData],
  // static propTypes = {
  //   params: PropTypes.object,
  //   query: PropTypes.object
  // }
    
  getInitialState: function() {
    return {
      initialLoad: true,
      showToast: false,
      toastMsg: '',
      toastType: 'success',
      activityHistoryLimit: 10
    };
  },

  getMeteorData() {
    let handle = Meteor.subscribe("user", this.props.params.id)
    let handleActivity = Meteor.subscribe("activity.public.recent", this.state.activityHistoryLimit) 
    return {
      currUser: Meteor.user(), //putting it here makes it reactive
      user: Meteor.users.findOne(this.props.params.id),
      activity: Activity.find({}, {sort: {timestamp: -1}}).fetch(),
      loading: !handle.ready(),
    };
  },

  render() {
    if (this.data.loading) {
      return (<div><Spinner /></div>);
    }

    const {currUser, user} = this.data

    //Back arrow button in nav menu works by either grabbing "back" props in Route (see index.js in /routes)
    //Or by clearing all params/queries
    const { query, pathname } = this.props.location
    const backLink =
        !_.isEmpty(query) ? pathname :
        this.props.routes[1].back ? this.props.routes[1].back :
        null

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    let isSuperAdmin = false;
    let ownsProfile = false;
    if (currUser) {
      if (user) ownsProfile = currUser._id === user._id
      let permissions = currUser.permissions;
      if (permissions) {
        permissions.map((permission) => {
          if (permission.roles[0] === "super-admin") {
            isSuperAdmin = true;
          }
        })
      }
    }

    return (
      <div>
        <Helmet
          title="MyGameBuilder v2"
          titleTemplate="%s - devlapse.com"
          meta={[
              {"name": "description", "content": "MyGameBuilder v2"}
          ]}
        />

        <Sidebar
          isSuperAdmin={isSuperAdmin}
          user={user}
          currUser={currUser}
          handleToggleSidebar={this.handleToggleSidebar}
          initialLoad={this.state.initialLoad}
          activity={this.data.activity} />

        <div className="pusher" >
            <Nav
              user={currUser}
              handleToggleSidebar={this.handleToggleSidebar}
              name={this.props.routes[1].name}
              back={backLink} />

            {this.state.showToast ?
              <Toast
                content={this.state.toastMsg}
                type={this.state.toastType} />
            : null}

            <div>

              {this.props.children && React.cloneElement(this.props.children, {
                  //Make below props available to all routes.
                  user: user,
                  currUser: currUser,
                  ownsProfile: ownsProfile,
                  isSuperAdmin: isSuperAdmin,
                  showToast: this.showToast,
                })
              }
            </div>
          </div>
      </div>
    );
  },

  showToast(content, type) {
    this.setState({
      showToast: true,
      //toastMsg content is string that accepts HTML
      toastMsg: content,
      //String: 'error' or 'success'
      toastType: type
    });
    window.setTimeout(() => {
      this.closeToast()
    }, 2500);
  },

  closeToast() {
    this.setState({
      showToast: false,
      toastMsg: ''
    });
  },


  handleToggleSidebar() {
    $('.ui.sidebar').sidebar('toggle');
  }
}
)
