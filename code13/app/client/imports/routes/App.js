import _ from 'lodash';
import React, {Component, PropTypes} from 'react';
import { browserHistory } from 'react-router';
import Helmet from "react-helmet";

import reactMixin from 'react-mixin';
import { ReactMeteorData } from 'meteor/react-meteor-data';

import { isSameUser } from '/imports/schemas/users'
import { isUserSuperAdmin } from '/imports/schemas/roles'

import { Users, Activity, Projects } from '/imports/schemas';
import { projectMakeSelector } from '/imports/schemas/projects';

import NavBar from '/client/imports/components/Nav/NavBar';
import Toast from '/client/imports/components/Nav/Toast';
import Spinner from '/client/imports/components/Nav/Spinner';
import NavPanel from '/client/imports/components/SidePanels/NavPanel';
import FlexPanel from '/client/imports/components/SidePanels/FlexPanel';
import mgbReleaseInfo from '/client/imports/components/Nav/mgbReleaseInfo';

import urlMaker from './urlMaker';
import webkitSmallScrollbars from './webkitSmallScrollbars.css';

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
      activityHistoryLimit: 11
    };
  },

  getMeteorData() {
    const pathUserName = this.props.params.username      // This is the username (profile.name) on the url /u/xxxx/...
    const pathUserId = this.props.params.id              // LEGACY ROUTES - This is the userId on the url /user/xxxx/...
    const currUser = Meteor.user()
    const currUserId = currUser && currUser._id
    const handleForUser = pathUserName ? 
                             Meteor.subscribe("user.byName", pathUserName) 
                           : Meteor.subscribe("user", pathUserId)   // LEGACY ROUTES
    const handleActivity = Meteor.subscribe("activity.public.recent", this.state.activityHistoryLimit) 
    const handleForProjects = Meteor.subscribe("projects.byUserId", currUserId)
    const projectSelector = projectMakeSelector(currUserId)
    return {
      currUser: currUser,                           // Currently Logged in user. Putting it here makes it reactive
      currUserProjects: Projects.find(projectSelector).fetch(),
      user:     pathUserName ? Meteor.users.findOne( { "profile.name": pathUserName}) : Meteor.users.findOne(pathUserId),   // User on the url /user/xxx/...
      activity: Activity.find({}, {sort: {timestamp: -1}}).fetch(),     // Activity for any user
      loading:  !handleForUser.ready() || !handleActivity.ready() || !handleForProjects.ready
    };
  },

  configureTrackJs() {
    // http://docs.trackjs.com/tracker/tips#include-user-id-version-and-session
    const doTrack = () => {
      const ver = mgbReleaseInfo.releases[0].id
      trackJs.configure({
        userId: (Meteor.user() ? Meteor.user().profile.name : "(NotLoggedIntoMgb)"),
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
    const flexPanelWidth = showFlexPanel ? "280px" : "48px"    // The 225px width works well with default vertical menu size and padding=8px 

    // The main Panel:  Outer is for the scroll container; inner is for content
    const mainPanelOuterDivSty = { 
      position: "fixed",
      top:      "40px",
      bottom:   "0px",
      left:     navPanelWidth, 
      right:    flexPanelWidth, 
      overflow: "scroll",
      marginBottom: "0px"      
    }

    const mainPanelInnerDivSty = { 
      padding:       "0px",
      paddingBottom: "24px",
      height:        "auto" 
    }

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    const isSuperAdmin = isUserSuperAdmin(currUser)
    const ownsProfile = isSameUser(currUser, user)

    // This is a flag used for some mid-colume elements (NavBar and Maybe page) to hint they should be 
    // space conservative because the Nav and Flex panels are both being displayed. 
    // Most things can be done reactively or with CSS, but this is useful for some extra cases
    // This is probably not a long term solution - but is helpful for now
    const conserveSpace = showNavPanel && showFlexPanel

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
            
            <NavBar
              currUser={currUser}
              user={user}              
              name={this.props.routes[1].name}
              params={this.props.params}
              flexPanelWidth={flexPanelWidth}
              navPanelWidth={navPanelWidth}
              navPanelIsVisible={showNavPanel} 
              conserveSpace={conserveSpace}
              />


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

            <div style={mainPanelOuterDivSty} className="noScrollbarDiv">
              <div style={mainPanelInnerDivSty}>
                { this.state.showToast && 
                  <Toast content={this.state.toastMsg} type={this.state.toastType} /> 
                }
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
      newQ = {...loc.query, [qp]:NavPanel.getDefaultPanelViewTag()}
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
      newQ = {...loc.query, [qp]:FlexPanel.getDefaultPanelViewTag()}
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
  
  /**
   * This hides/shows both Nav and FlexPanels. Press ESC for this
   * Note that it takes a lot of care to preserve deep url state, but also discard url query params that are defaults 
   */
  handleDualPaneToggle: function()
  {
    const loc = this.props.location
    const qpNp = urlMaker.queryParams("app_navPanel")    // Query Param for NavPanel (e.g "_np")
    const qpFp = urlMaker.queryParams("app_flexPanel")   // Query Param for FlexPanel (e.g "_fp")
    const qvNp = loc.query[qpNp]                         // Query Value for NavPanel
    const qvFp = loc.query[qpFp]                         // Query Value for FlexPanel
    const aPanelIsVisible = urlMaker.isQueryEnabled(qvNp) || urlMaker.isQueryEnabled(qvFp)

    let newQ
    if (aPanelIsVisible)
    {
      const new_qvNp = urlMaker.disableQuery(qvNp, NavPanel.getDefaultPanelViewTag())
      const new_qvFp = urlMaker.disableQuery(qvFp, FlexPanel.getDefaultPanelViewTag())
      newQ = { ..._.omit(loc.query, [qpNp, qpFp]) }
      if (new_qvNp) newQ[qpNp] = new_qvNp
      if (new_qvFp) newQ[qpFp] = new_qvFp
    }
    else
    {
      newQ = {
        ...loc.query, 
        [qpNp]:urlMaker.enableQuery(qvNp, NavPanel.getDefaultPanelViewTag() ), 
        [qpFp]:urlMaker.enableQuery(qvFp, FlexPanel.getDefaultPanelViewTag() )
      }
    }
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
