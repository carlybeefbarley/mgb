import React, {Component, PropTypes} from 'react';
import { browserHistory } from 'react-router';

import reactMixin from 'react-mixin';
import { ReactMeteorData } from 'meteor/react-meteor-data';

import { Users, Activity, Projects } from '../schemas';
import { projectMakeSelector } from '../schemas/projects';

import Nav from '../components/Nav/Nav';
import Toast from '../components/Nav/Toast';
import Helmet from "react-helmet";
import Spinner from '../components/Nav/Spinner';
import NavPanel from '../components/SidePanels/NavPanel';
import FlexPanel from '../components/SidePanels/FlexPanel';
import mgbReleaseInfo from '../components/Nav/mgbReleaseInfo.js';

import urlMaker from './urlMaker';


export default App = React.createClass({
  mixins: [ReactMeteorData],
  // static propTypes = {
  //   params: PropTypes.object,
  //   query: PropTypes.object
  // }
    
  childContextTypes: {
    urlLocation: React.PropTypes.object    
  },

  getChildContext() {
    return { urlLocation: this.props.location }
  },

  togglePanelsKeyHandler: function(e) {
    e = e || window.event;
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.handleDualPaneToggle()
    }
  },

  componentDidMount: function() {
    window.onkeydown = this.togglePanelsKeyHandler;
  },

  getInitialState: function() {
    return {
      initialLoad: true,
      showToast: false,
      toastMsg: '',
      toastType: 'success',
      activityHistoryLimit: 31
    };
  },

  getMeteorData() {
    const pathUserId = this.props.params.id           // This is the userId on the url /user/xxxx/...
    const currUser = Meteor.user()
    const currUserId = currUser && currUser._id
    const handleForUser = Meteor.subscribe("user", pathUserId) // BUGBUG - no such param in rare cases (like the deprecated /assetEdit route)
    const handleActivity = Meteor.subscribe("activity.public.recent", this.state.activityHistoryLimit) 
    const handleForProjects = Meteor.subscribe("projects.byUserId", currUserId)
    const projectSelector = projectMakeSelector(currUserId)
    return {
      currUser: currUser,                           // Currently Logged in user. Putting it here makes it reactive
      currUserProjects: Projects.find(projectSelector).fetch(),
      user:     Meteor.users.findOne(pathUserId),   // User on the url /user/xxx/...
      activity: Activity.find({}, {sort: {timestamp: -1}}).fetch(),     // Activity for any user
      loading:  !handleForUser.ready() || !handleActivity.ready() || !handleForProjects.ready
    };
  },

  configureTrackJs() {
    // http://docs.trackjs.com/tracker/tips#include-user-id-version-and-session
    const doTrack = () => {
      const ver = mgbReleaseInfo.releases[0].id
      trackJs.configure({
        userId: (Meteor.user() ? Meteor.user().profile.name : ""),
        version: `${ver.ver} ${ver.state} ${ver.iteration}`,
        sessionId: Meteor.default_connection._lastSessionId
      })
    }
    if (window.trackJs) 
      doTrack()
    else
      $.getScript("/lib/tracker.js", doTrack)   // fallback to local version because of AdBlocks etc
  },

  render() {
    
    if (this.data.loading)
      return <Spinner />

    this.configureTrackJs()

    const { currUser, user, currUserProjects } = this.data
    const { query } = this.props.location

    // The NavPanel (left), NavBar (top) and FlexPanel (right) are fixed/absolute positioned so we need to account for that

    // The Nav Panel is on the left and is primarily navigation-oriented
    const navPanelQueryValue = query[urlMaker.queryParams("app_navPanel")]
    const showNavPanel = !!navPanelQueryValue && navPanelQueryValue[0] !== "-"
    const navPanelWidth = showNavPanel ? "290px" : "60px"

    // The Flex Panel is for communications and common quick searches in a right hand margin (TBD what it is for mobile)
    const flexPanelQueryValue = query[urlMaker.queryParams("app_flexPanel")]
    const showFlexPanel = !!flexPanelQueryValue && flexPanelQueryValue[0] !== "-"
    const flexPanelWidth = showFlexPanel ? "270px" : "45px"    // The 225px width works well with default vertical menu size and padding=8px 

    // The main Panel:  Outer is for the scroll container; inner is for content
    let mainPanelOuterDivSty = { 
      position: "fixed",
      top:      "40px",
      bottom:   "0px",
      left:     navPanelWidth, 
      right:    flexPanelWidth, 
      overflow: "scroll",
      marginBottom: "0px"      
    }

    let mainPanelInnerDivSty = { 
      padding:       "0px",
      paddingBottom: "24px",
      height:        "auto" 
    }

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


        <div>
        
            <NavPanel 
              currUser={currUser}
              currUserProjects={currUserProjects}
              user={user}
              selectedViewTag={navPanelQueryValue}
              handleNavPanelToggle={this.handleNavPanelToggle}
              handleNavPanelChange={this.handleNavPanelChange}
              navPanelWidth={navPanelWidth}
              navPanelIsVisible={showNavPanel}
              isSuperAdmin={isSuperAdmin}              
            />
            
            <Nav
              currUser={currUser}
              user={user}              
              name={this.props.routes[1].name}
              params={this.props.params}
              flexPanelWidth={flexPanelWidth}
              navPanelWidth={navPanelWidth}
              navPanelIsVisible={showNavPanel} 
              />

            {this.state.showToast ?
              <Toast
                content={this.state.toastMsg}
                type={this.state.toastType} />
            : null}

            <FlexPanel 
              currUser={currUser}
              user={user}
              selectedViewTag={flexPanelQueryValue}
              handleFlexPanelToggle={this.handleFlexPanelToggle}  
              handleFlexPanelChange={this.handleFlexPanelChange}
              flexPanelWidth={flexPanelWidth} 
              flexPanelIsVisible={showFlexPanel}
              activity={this.data.activity} 
              isSuperAdmin={isSuperAdmin}
              /> 

            <div style={mainPanelOuterDivSty}>
              <div style={mainPanelInnerDivSty}>
                {
                  this.props.children && React.cloneElement(this.props.children, {
                    // Make below props available to all routes.
                    user: user,
                    currUser: currUser,
                    currUserProjects: currUserProjects,
                    ownsProfile: ownsProfile,
                    isSuperAdmin: isSuperAdmin,
                    showToast: this.showToast
                  })
                }
              </div>
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


  /** 
   * This will show/hide the Nav Panel
   */
  handleNavPanelToggle: function()
  {
    const loc = this.props.location
    const qp = urlMaker.queryParams("app_navPanel")
    let newQ
    if (loc.query[qp])
      newQ = _.omit(loc.query, qp)
    else
      newQ = {...loc.query, [qp]:"1"}
    browserHistory.push( {  ...loc,  query: newQ })
  },


  handleNavPanelChange: function(newFpView)
  {
    const qp = urlMaker.queryParams("app_navPanel")

    const queryModifier = {[qp]: newFpView}
    const loc = this.props.location
    const newQ = {...loc.query, ...queryModifier }
    browserHistory.push( {  ...loc,  query: newQ })
  },
  
  handleDualPaneToggle: function()
  {
    const loc = this.props.location
    const qpNp = urlMaker.queryParams("app_navPanel")
    const qpFp = urlMaker.queryParams("app_flexPanel")
    let newQ
    if (loc.query[qpNp] || loc.query[qpFp])
      newQ = _.omit(loc.query, [qpNp, qpFp])
    else
      newQ = {...loc.query, [qpNp]:"1", [qpFp]:"1"}
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
  }

})
