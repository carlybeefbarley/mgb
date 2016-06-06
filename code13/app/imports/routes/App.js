import React, {Component, PropTypes} from 'react';
import {Link, browserHistory} from 'react-router';

import reactMixin from 'react-mixin';
import {ReactMeteorData} from 'meteor/react-meteor-data';

import Nav from '../components/Nav/Nav';
import Sidebar from '../components/Nav/Sidebar';
import Helmet from "react-helmet";
import {Users, Activity} from '../schemas';

import Spinner from '../components/Nav/Spinner';
import Toast from '../components/Nav/Toast';
import FlexPanel from '../components/FlexPanel/FlexPanel';

import urlMaker from './urlMaker';


export default App = React.createClass({
  mixins: [ReactMeteorData],
  // static propTypes = {
  //   params: PropTypes.object,
  //   query: PropTypes.object
  // }
    

  toggleFlexPanelKeyHandler: function(e) {
    e = e || window.event;
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.handleFlexPanelToggle();
    }
  },

  componentDidMount: function() {
    window.onkeydown = this.toggleFlexPanelKeyHandler;
  },

  getInitialState: function() {
    return {
      initialLoad: true,
      showToast: false,
      toastMsg: '',
      toastType: 'success',
      activityHistoryLimit: 20
    };
  },

  getMeteorData() {
    let handle = Meteor.subscribe("user", this.props.params.id) // BUGBUG - no such param in some cases (like AssetEdit)
    let handleActivity = Meteor.subscribe("activity.public.recent", this.state.activityHistoryLimit) 
    return {
      currUser: Meteor.user(), //putting it here makes it reactive
      user: Meteor.users.findOne(this.props.params.id),
      activity: Activity.find({}, {sort: {timestamp: -1}}).fetch(),
      loading: !handle.ready()
    };
  },

  render() {
    if (this.data.loading) {
      return (<div><Spinner /></div>);
    }

    const {currUser, user} = this.data

    // TODO(dgolds): clean up this back nav - proposal is to have a breadcrumb bar instead
    //Back arrow button in nav menu works by either grabbing "back" props in Route (see index.js in /routes)
    //Or by clearing all params/queries
    const { query, pathname } = this.props.location
    const backLink =
        !_.isEmpty(query) ? pathname :
        this.props.routes[1].back ? this.props.routes[1].back :
        null

    // The Flex Panel is for communications and common quick searches in a right hand margin (TBD what it is for mobile)
    const flexPanelQueryValue = query[urlMaker.queryParams("app_flexPanel")]
    const showFlexPanel = !!flexPanelQueryValue
    const flexPanelWidth = showFlexPanel ? "225px" : "0px"    // The 226px width works well with default vertical menu size and padding=8px 
    const mainPanelDivSty = showFlexPanel ? { marginRight: flexPanelWidth} : {}

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    let isSuperAdmin = false;
    let ownsProfile = false;
    if (currUser) {
      if (user) 
        ownsProfile = (currUser._id === user._id) // This isn't very useful and needs to be cleaned up.. TODO: cleanup the permissions model and get rid of this strange userprofile==currentuser concept
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
      <div >
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
          />

        <div className="pusher">
            <Nav
              user={currUser}
              handleToggleSidebar={this.handleToggleSidebar}
              name={this.props.routes[1].name}
              handleFlexPanelToggle={this.handleFlexPanelToggle}
              flexPanelWidth={flexPanelWidth}
              flexPanelIsVisible={showFlexPanel}
              back={backLink} />

            {this.state.showToast ?
              <Toast
                content={this.state.toastMsg}
                type={this.state.toastType} />
            : null}

            { showFlexPanel && 
              <FlexPanel 
                currUser={currUser}
                user={user}
                handleFlexPanelToggle={this.handleFlexPanelToggle}  
                flexPanelIsVisible={showFlexPanel}
                flexPanelWidth={flexPanelWidth} 
                selectedViewTag={flexPanelQueryValue}
                handleFlexPanelChange={this.handleFlexPanelChange}
                activity={this.data.activity} 
                /> 
            }
            <div style={mainPanelDivSty}>
              {
                this.props.children && React.cloneElement(this.props.children, {
                  // Make below props available to all routes.
                  user: user,
                  currUser: currUser,
                  ownsProfile: ownsProfile,
                  isSuperAdmin: isSuperAdmin,
                  showToast: this.showToast
                })
              }
            </div>
          </div>
      </div>
    );
  },


  /** 
   * This will show/hide the Flex Panel
   */
  handleFlexPanelToggle: function()
  {
    const loc = this.props.location
    const qp = urlMaker.queryParams("app_flexPanel")
    let newQ
    if (loc.query[qp])
      newQ = _.omit(loc.query, qp)
    else
      newQ = {...loc.query, [qp]:"1"}
    browserHistory.push( {  ...loc,  query: newQ })
  },


  handleFlexPanelChange: function(newFpView)
  {
    const qp = urlMaker.queryParams("app_flexPanel")

    const queryModifier = {[qp]: newFpView}
    const loc = this.props.location
    const newQ = {...loc.query, ...queryModifier }
    browserHistory.push( {  ...loc,  query: newQ })
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
