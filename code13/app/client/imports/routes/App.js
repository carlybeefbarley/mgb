import _ from 'lodash'
import React, { PropTypes } from 'react'
import Joyride from 'react-joyride'

import { browserHistory } from 'react-router'
import Helmet from "react-helmet"

import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'

import { isSameUser } from '/imports/schemas/users'
import { isUserSuperAdmin } from '/imports/schemas/roles'

import { Users, Activity, Projects, Settings } from '/imports/schemas'
import { projectMakeSelector } from '/imports/schemas/projects'

import NavBar from '/client/imports/components/Nav/NavBar'
import Toast from '/client/imports/components/Nav/Toast'
import Spinner from '/client/imports/components/Nav/Spinner'
import NavPanel from '/client/imports/components/SidePanels/NavPanel'
import FlexPanel from '/client/imports/components/SidePanels/FlexPanel'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'

import urlMaker from './urlMaker'
import webkitSmallScrollbars from './webkitSmallScrollbars.css'


import joyrideStyles from 'react-joyride/lib/styles/react-joyride-compiled.css'
let G_localSettings = new ReactiveDict()

const getPagenameFromProps = function(props)
{
  // This works because <App> is the first Route in /app/client/imports/routes
  return props.routes[1].name
}

const npColumn1Width = "60px"

export default App = React.createClass({
  mixins: [ReactMeteorData],
  // static propTypes = {
  //   params: PropTypes.object,
  //   query: PropTypes.object
  // }

  childContextTypes: {
    urlLocation:        PropTypes.object,
    settings:           PropTypes.object
  },

  getChildContext() {
    // Note React (as of Aug2016) has a bug where shouldComponentUpdate() can prevent a contextValue update. See https://github.com/facebook/react/issues/2517
    return {
      urlLocation:        this.props.location,
      settings:           this.data.settings   // We pass Settings in context since it will be a huge pain to pass it throughout the component tree
    }
  },

  togglePanelsKeyHandler: function(e) {
    e = e || window.event
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.handleDualPaneToggle()
    }
  },

  componentDidMount: function() {
    window.onkeyup = this.togglePanelsKeyHandler
  },


  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.joyrideSteps.length ===0 && this.state.joyrideSteps.length > 0)
    {
      console.log("starting joyride tour. Wheeee!")
      this.refs.joyride.start()
    }
  },


  componentWillReceiveProps: function(nextProps) {
    // We are using https://github.com/okgrow/analytics but it does not automatically log
    // react-router routes, so we need a specific call when the page changes

    // analytics is from the Meteor package okgrow:analytics

    // See https://segment.com/docs/sources/website/analytics.js/#page for the analytics.page() params
    analytics.page(getPagenameFromProps(nextProps), {
      path: nextProps.location.pathname
    })
  },

  getInitialState: function() {
    return {
      initialLoad: true,
      showToast: false,
      toastMsg: '',
      toastType: 'success',
      fNavPanelIsOverlay: true,    // Could make this inital value based on screen size, but that might be odd
      activityHistoryLimit: 11,

      // For react-joyride
      joyrideSteps: []
      
    }
  },


  getMeteorData() {
    const pathUserName = this.props.params.username      // This is the username (profile.name) on the url /u/xxxx/...
    const pathUserId = this.props.params.id              // LEGACY ROUTES - This is the userId on the url /user/xxxx/...
    const currUser = Meteor.user()
    const currUserId = currUser && currUser._id
    const handleForUser = pathUserName ?
                             Meteor.subscribe("user.byName", pathUserName)
                           : Meteor.subscribe("user", pathUserId)   // LEGACY ROUTES
    const handleForSettings = currUserId ? Meteor.subscribe("settings.userId", currUserId) : null
    const settingsReady = handleForSettings === null ? true : handleForSettings.ready()
    const handleActivity = Meteor.subscribe("activity.public.recent", this.state.activityHistoryLimit)
    const handleForProjects = currUserId ? Meteor.subscribe("projects.byUserId", currUserId) : null
    const projectsReady = handleForProjects === null ? true : handleForProjects.ready()
    const projectSelector = projectMakeSelector(currUserId)

    return {
      currUser: currUser,                           // Currently Logged in user. Putting it here makes it reactive
      currUserProjects: Projects.find(projectSelector).fetch(),
      user:     pathUserName ? Meteor.users.findOne( { "profile.name": pathUserName}) : Meteor.users.findOne(pathUserId),   // User on the url /user/xxx/...
      activity: Activity.find({}, {sort: {timestamp: -1}}).fetch(),     // Activity for any user
      settings: handleForSettings === null ? G_localSettings : Settings.findOne(currUserId),
      loading:  !handleForUser.ready() ||
                !handleActivity.ready() ||
                !projectsReady ||
                !settingsReady
    }
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

    const { fNavPanelIsOverlay, showToast, toastMsg, toastType } = this.state
    const { currUser, user, currUserProjects } = this.data
    const { query } = this.props.location

    // The NavPanel (left), NavBar (top) and FlexPanel (right) are fixed/absolute positioned so we need to account for that

    // The Nav Panel is on the left and is primarily navigation-oriented
    const navPanelQueryValue = query[urlMaker.queryParams("app_navPanel")]
    const showNavPanel = !!navPanelQueryValue && navPanelQueryValue[0] !== "-"
    const navPanelWidth = showNavPanel ? "268px" : npColumn1Width     // Available width to render
    const navPanelReservedWidth = fNavPanelIsOverlay ? npColumn1Width : navPanelWidth    // Space main page area cannot use

    // The Flex Panel is for communications and common quick searches in a right hand margin (TBD what it is for mobile)
    const flexPanelQueryValue = query[urlMaker.queryParams("app_flexPanel")]
    const showFlexPanel = !!flexPanelQueryValue && flexPanelQueryValue[0] !== "-"
    const flexPanelWidth = showFlexPanel ? "345px" : "60px"    // The 225px width works well with default vertical menu size and padding=8px

    // The main Panel:  Outer is for the scroll container; inner is for content
    const mainPanelOuterDivSty = {
      position: "fixed",
      top:      "40px",
      bottom:   "0px",
      left:     navPanelReservedWidth,
      right:    flexPanelWidth,
      overflow: "scroll",
      marginBottom: "0px"
    }

    const mainPanelInnerDivSty = {
      padding:       "0px",
      height:        "auto"
    }

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    const isSuperAdmin = isUserSuperAdmin(currUser)
    const ownsProfile = isSameUser(currUser, user)

    // This is a flag used for some mid-column elements (NavBar and Maybe page) to hint they should be
    // space conservative because the Nav and Flex panels are both being displayed.
    // Most things can be done reactively or with CSS, but this is useful for some extra cases
    // This is probably not a long term solution - but is helpful for now
    const conserveSpace = showNavPanel && showFlexPanel && !fNavPanelIsOverlay

    return (
      <div >
      
        <Helmet
          title="MGB2"
          titleTemplate="%s"
          meta={[
              {"name": "description", "content": "MyGameBuilder v2"}
          ]}
        />

        <Joyride 
          ref="joyride" 
          steps={this.state.joyrideSteps} 
          showOverlay={true}
          showSkipButton={true}
          showStepsProgress={true}
          type="continuous"
          callback={this.handleJoyrideCallback}
          debug={false} />

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
              navPanelIsOverlay={fNavPanelIsOverlay}
            />

            { showNavPanel && 
              <i 
                title={!fNavPanelIsOverlay ? 
                   `The Navigation Panel is locked, so it will not auto-hide when used. Clicking this icon will unlock it and enable auto-hide`
                 : `The Navigation Panel is unlocked, so it auto-hides when used. Clicking this icon will lock it and disable auto-hide` }
                className={`ui grey ${fNavPanelIsOverlay ? "unlock":"lock"} icon`} 
                onClick={() => this.setState( { "fNavPanelIsOverlay": !fNavPanelIsOverlay } ) }
                style={{position: "fixed", bottom: "8px", left: npColumn1Width, zIndex: 200}} />
            }

            <NavBar
              currUser={currUser}
              user={user}
              name={this.props.routes[1].name}
              params={this.props.params}
              flexPanelWidth={flexPanelWidth}
              navPanelWidth={navPanelReservedWidth}
              navPanelIsVisible={showNavPanel}
              conserveSpace={conserveSpace}
              />


            <FlexPanel
              addJoyrideSteps={this.addJoyrideSteps}
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

            <div
              style={mainPanelOuterDivSty}
              className={conserveSpace ? "conserveSpace noScrollbarDiv" : "noScrollbarDiv"}>
              <div style={mainPanelInnerDivSty}>
                { showToast &&
                  <Toast content={toastMsg} type={toastType} />
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
    )
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
    })
    window.setTimeout(() => { this.closeToast() }, 2500)
  },


  closeToast() {
    this.setState({ showToast: false, toastMsg: '' })
  },

// React-Joyride stuff (user tour support). See https://github.com/gilbarbara/react-joyride

  addJoyrideSteps: function (steps, opts = {}) {
    let joyride = this.refs.joyride

    if (!Array.isArray(steps)) 
      steps = [steps]

    if (steps.length === 0 && !opts.replace)
      return false

    const parsedSteps = joyride.parseSteps(steps)

    this.setState(function(currentState) {
      currentState.joyrideSteps = opts.replace ? parsedSteps : currentState.joyrideSteps.concat(parsedSteps)
      return currentState
    })
  },

  addJoyrideTooltip(data) {
    this.refs.joyride.addTooltip(data)
  },

  handleJoyrideCallback( func ) {
    if (func.type === 'finished')
      this.setState( {  joyrideSteps: [] })
  }

})
