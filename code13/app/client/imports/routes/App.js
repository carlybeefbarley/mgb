import _ from 'lodash'
import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'
import Helmet from "react-helmet"
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'
import SpecialGlobals from '/imports/SpecialGlobals'

import Joyride, { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import joyrideStyles from 'react-joyride/lib/styles/react-joyride-compiled.css'

import { makeTutorialAssetPathFromSkillPath } from '/imports/Skills/SkillNodes/SkillNodes'
import { hasSkill, learnSkill } from '/imports/schemas/skills'

import { Users, Activity, Projects, Settings, Sysvars, Skills } from '/imports/schemas'
import { isSameUser } from '/imports/schemas/users'
import { isUserSuperAdmin } from '/imports/schemas/roles'

import { projectMakeSelector } from '/imports/schemas/projects'

import NavBar from '/client/imports/components/Nav/NavBar'
import NavPanel from '/client/imports/components/SidePanels/NavPanel'
import FlexPanel from '/client/imports/components/SidePanels/FlexPanel'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'

import urlMaker from './urlMaker'
import webkitSmallScrollbars from './webkitSmallScrollbars.css'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

// https://www.npmjs.com/package/react-notifications
import { NotificationContainer, NotificationManager } from 'react-notifications'
// Note css is in /client/notifications.css
// Note - also, we copied the fonts this requires to public/fonts/notification.*

import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'

let G_localSettings = new ReactiveDict()

  // This works because <App> is the first Route in /app/client/imports/routes
const getPagenameFromProps = props => props.routes[1].name
const getPagepathFromProps = props => props.routes[1].path

let _theAppInstance = null

// This is for making the Completion Tag thing work so it edge triggers only when pages are actually navigated to (rather than every update).
// QLink.js calls this. There may be a better way to do this, but this isn't too terribly factored so is OKish
// and it gets the job done.
export const clearPriorPathsForJoyrideCompletionTags = () => {
  if (_theAppInstance)
  {
    _theAppInstance._priorLocationPath = null
    _theAppInstance._priorRouterPath = null
  }
}

export const stopCurrentTutorial = () => {
  if (_theAppInstance)
    _theAppInstance.addJoyrideSteps.call(_theAppInstance, [], { replace: true } )

}
export const addJoyrideSteps = (steps, opts) => {
  if (_theAppInstance)
    _theAppInstance.addJoyrideSteps.call(_theAppInstance, steps, opts)
}

export const startSkillPathTutorial = (skillPath) => {
  if (_theAppInstance)
    _theAppInstance.startSkillPathTutorial.call(_theAppInstance, skillPath)
}

export const startSignUpTutorial = () => {
  if (_theAppInstance)
    _theAppInstance.startSignUpTutorial.call(_theAppInstance)

}

const px = someNumber => (`${someNumber}px`)

// NavBar numbers
const navBarReservedHeightInPixels = 32

// FlexPanel numbers
const fpIconColumnWidthInPixels = 60          // The Column of Icons
const fpFlexPanelContentWidthInPixels = 285   // The cool stuff

const _toastTypes = {
  error:    { funcName: 'error',   hdr: 'Error',   delay: 5000 },
  warning:  { funcName: 'warning', hdr: 'Warning', delay: 4000 },
  info:     { funcName: 'info',    hdr: 'Info',    delay: 4000 },
  success:  { funcName: 'success', hdr: 'Success', delay: 4000 }
}

export const showToast = (content, type = 'success') => {
  const useType = _toastTypes[type] || _toastTypes['success']
  NotificationManager[useType.funcName](content, useType.hdr, useType.delay)
}

export const joyrideDebugEnable = joyrideDebug => {
  if (_theAppInstance)
    _theAppInstance.setState( { joyrideDebug } )
  // It may also be nice to do the equivalent of m.jr._ctDebugSpew = joyrideDebug
}

const App = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    params:   PropTypes.object,
    query:    PropTypes.object,
    routes:   PropTypes.array,
    location: PropTypes.object,
    children: PropTypes.object
  },

  childContextTypes: {
    urlLocation:  PropTypes.object,
    settings:     PropTypes.object,
    skills:       PropTypes.object
  },

  getChildContext() {
    // Note React (as of Aug2016) has a bug where shouldComponentUpdate() can prevent a contextValue update. See https://github.com/facebook/react/issues/2517
    return {
      urlLocation:  this.props.location,
      settings:     this.data.settings,  // We pass Settings in context since it will be a huge pain to pass it throughout the component tree as props
      skills:       this.data.skills     // We pass Skills in context since it will be a huge pain to pass it throughout the component tree as props
    }
  },

  componentDidMount: function() {
    registerDebugGlobal( 'app', this, __filename, 'The global App.js instance')
    _theAppInstance = this   // This is so we can expose a few things conveniently but safely, and without too much react.context stuff
  },

  componentDidUpdate: function(prevProps, prevState) {
    const pagepath = getPagepathFromProps(this.props)

    // Fire Completion Tags for the Joyride/Tutorial system. Make sure we only fire when the path has changed, not on every page update
    const newRouterPath = `mgbjr-CT-app-router-path-${pagepath}`                           // e.g. /u/:username
    if (newRouterPath !== this._priorRouterPath)
      joyrideCompleteTag(newRouterPath)
    this._priorRouterPath = newRouterPath

    const newLocationPath = `mgbjr-CT-app-location-path-${this.props.location.pathname}`   // e.g. /u/dgolds   -- will exclude search/query params
    if (newLocationPath !== this._priorLocationPath)
      joyrideCompleteTag(newLocationPath)
    this._priorLocationPath = newLocationPath

    // Handle transition from empty to non-empty joyride and start the joyride/tutorial
    if (prevState.joyrideSteps.length ===0 && this.state.joyrideSteps.length > 0)
      this.refs.joyride.start(true)
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
      activityHistoryLimit: 11,

      // For react-joyride
      joyrideSteps: [],
      joyrideSkillPathTutorial: null,      // String with skillPath (e.g code.js.foo) IFF it was started by startSkillPathTutorial -- i.e. it is an OFFICIAL SKILL TUTORIAL
      joyrideCurrentStepNum: 0,            // integer with cuurent step number (valid IFF there are steps defined)
      joyrideOriginatingAssetId: null,     // Used to support nice EditTutorial button in fpGoals ONLY. Null, or, if set, an object: origAsset: { ownerName: asset.dn_ownerName, id: asset._id }. THIS IS NOT USED FOR LOAD, JUST FOR OTHER UI TO ENABLE A EDIT-TUTORIAL BUTTON
      joyrideDebug: false
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
    const handleForSysvars = Meteor.subscribe('sysvars')

    const handleForSkills = currUserId ? Meteor.subscribe("skills.userId", currUserId) : null
    const skillsReady = handleForSkills === null ? true : handleForSkills.ready()

    const handleForSettings = currUserId ? Meteor.subscribe("settings.userId", currUserId) : null
    const settingsReady = handleForSettings === null ? true : handleForSettings.ready()
    const handleActivity = Meteor.subscribe("activity.public.recent", this.state.activityHistoryLimit)
    const handleForProjects = currUserId ? Meteor.subscribe("projects.byUserId", currUserId) : null
    const projectsReady = handleForProjects === null ? true : handleForProjects.ready()
    const projectSelector = projectMakeSelector(currUserId)

    if (handleForSettings && handleForSettings.ready())
    {
      // There is a very small race where local settings could get replaced
      // if the settings are changed while the debounced save is happening..
      // but it's pretty small, so worry about that another day
      G_localSettings.set(Settings.findOne(currUserId))
    }

    const retval = {
      currUser: currUser ? currUser : null,                 // Avoid 'undefined'. It's null, or it's defined. Currently Logged in user. Putting it here makes it reactive

      currUserProjects: Projects.find(projectSelector).fetch(),
      user:     pathUserName ? Meteor.users.findOne( { "profile.name": pathUserName}) : Meteor.users.findOne(pathUserId),   // User on the url /user/xxx/...
      activity: Activity.find({}, {sort: {timestamp: -1}}).fetch(),     // Activity for any user
      settings: G_localSettings,
      skills:   currUser ? Skills.findOne(currUserId) : null,
      sysvars:  Sysvars.findOne(),
      loading:  !handleForUser.ready()    ||
                !handleForSysvars.ready() ||
                !handleActivity.ready()   ||
                !projectsReady            ||
                !settingsReady            ||
                !skillsReady
    }
    return retval
  },

  configureTrackJs() {
    // TODO: Make reactive for login/logout
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
      $.getScript(makeCDNLink("/lib/t-r-a-c-k-e-r.js"), doTrack)   // fallback to local version because of AdBlocks etc
  },

  render() {
    const { respData, respWidth } = this.props
    const { joyrideDebug } = this.state

    const { loading, currUser, user, currUserProjects, sysvars } = this.data
    const { query } = this.props.location

    if (!loading)
      this.configureTrackJs()

    // TODO: Expose this in settings somehow
    const fFixedTopNavBar = false

    const navBarAreaHeightInPixels = navBarReservedHeightInPixels

    // The Flex Panel is for communications and common quick searches in a right hand margin (or fixed footer for Phone-size PortraitUI)
    const flexPanelQueryValue = query[urlMaker.queryParams("app_flexPanel")]
    const showFlexPanel = !!flexPanelQueryValue && flexPanelQueryValue[0] !== "-"
    const flexPanelWidthWhenExpanded = respData.fpReservedRightSidebarWidth ? px(fpIconColumnWidthInPixels + fpFlexPanelContentWidthInPixels) : px(fpFlexPanelContentWidthInPixels)
    const flexPanelWidth = showFlexPanel ? flexPanelWidthWhenExpanded : respData.fpReservedRightSidebarWidth

    const navPanelAvailableWidth = respWidth-parseInt(flexPanelWidth)

    // The main Panel:  Outer is for the scroll container; inner is for content
    const mainPanelOuterDivSty = {
      position:     "fixed",
      top:          px(fFixedTopNavBar ? navBarAreaHeightInPixels : 0),
      bottom:       respData.fpReservedFooterHeight,
      left:         0,
      right:        flexPanelWidth,
      marginBottom: '0px',
      overflow:     "scroll"
    }

    const mainPanelInnerDivSty = {
      padding:       '0px',
      height:        "auto"
    }

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    const isSuperAdmin = isUserSuperAdmin(currUser)
    const ownsProfile = isSameUser(currUser, user)

    const navbar = (
      <NavBar
        currUser={currUser}
        user={user}
        pathLocation={this.props.location.pathname}
        fFixedTopNavBar={fFixedTopNavBar}
        name={this.props.routes[1].name}
        params={this.props.params}
        flexPanelWidth={flexPanelWidth}
        sysvars={sysvars}
        />
    )

    return (
      <div >

        <Helmet
          title="MGB"
          titleTemplate="%s"
          meta={[
              {"name": "My Game Builder", "content": "MyGameBuilder"}
          ]}
        />
        <Joyride
          ref="joyride"
          steps={this.state.joyrideSteps}
          showOverlay={true}
          disableOverlay={false}
          showSkipButton={true}
          tooltipOffset={0}
          keyboardNavigation={false}
          showStepsProgress={true}
          type="continuous"
          callback={this.handleJoyrideCallback}
          preparePageHandler={this.joyridePreparePageHandler}
          debug={joyrideDebug} />

        <div>

            { fFixedTopNavBar && navbar }

            <FlexPanel
              fpIsFooter={!!respData.footerTabMajorNav}
              joyrideSteps={this.state.joyrideSteps}
              joyrideSkillPathTutorial={this.state.joyrideSkillPathTutorial}
              joyrideCurrentStepNum={this.state.joyrideCurrentStepNum}
              joyrideOriginatingAssetId={this.state.joyrideOriginatingAssetId}
              currUser={currUser}
              currUserProjects={currUserProjects}
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
                <NavPanel
                  currUser={currUser}
                  currUserProjects={currUserProjects}
                  fpReservedRightSidebarWidth={flexPanelWidth}
                  navPanelAvailableWidth={navPanelAvailableWidth}
                />
              
                { !fFixedTopNavBar && navbar }
                {
                  !loading && this.props.children && React.cloneElement(this.props.children, {
                    // Make below props available to all routes.
                    user: user,
                    currUser: currUser,
                    currUserProjects: currUserProjects,
                    ownsProfile: ownsProfile,
                    isSuperAdmin: isSuperAdmin,
                    isTopLevelRoute: true // Useful so routes can be re-used for embedding.  If false, they can turn off toolbars/headings etc as appropriate
                  })
                }
              </div>
            </div>

          </div>
          <NotificationContainer/> {/* This is for the top-right toast messages */}
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
      newQ = {...loc.query, [qp]:NavPanel.getDefaultPanelViewTag()}   //TODO: Wrong tag!?
    browserHistory.push( {  ...loc,  query: newQ })
  },

  closeFlexPanel: function()
  {
    const loc = this.props.location
    const qp = urlMaker.queryParams("app_flexPanel")
    if (loc.query[qp])
    {
      const newQ = _.omit(loc.query, qp)
      browserHistory.push( {  ...loc,  query: newQ })
    }
  },

  handleFlexPanelChange: function(newFpView)
  {
    const qp = urlMaker.queryParams("app_flexPanel")

    const queryModifier = {[qp]: newFpView}
    const loc = this.props.location
    const newQ = {...loc.query, ...queryModifier }
    browserHistory.push( {  ...loc,  query: newQ })
  },

  //
  // TOAST
  //

  startSignUpTutorial()
  {
    if (this.currUser)
    {
      console.error('startSignUpTutorial() but user is already logged-in')
      return
    }
    const tutPath = ':' + SpecialGlobals.skillsModelTrifecta.signupTutorialName
    this.addJoyrideSteps(tutPath, { replace: true } )
  },

  startSkillPathTutorial(skillPath)
  {
    const tutPath = makeTutorialAssetPathFromSkillPath(skillPath, 0)
    this.addJoyrideSteps(tutPath, { replace: true, skillPath: skillPath } )
  },

  handleCompletedSkillTutorial(tutorialSkillPath) {
    console.log( 'Completed a Skill Tutorial: ', tutorialSkillPath )
    if (!hasSkill( tutorialSkillPath )) {
      showToast( `Tutorial Completed, Skill '${tutorialSkillPath}' gained` )
      learnSkill( tutorialSkillPath )
    }
  },

  //
  // React-Joyride
  //


  // This is the React-joyride (user tours) support
  // See https://github.com/gilbarbara/react-joyride for background
  // See /DeveloperDocs/ReactJoyrideTours.md for our rules/conventions
  //     for using it in our codebase

  // addJoyrideSteps()
  //   opts.skillPath  -- used by startSkillPathTutorial()
  //   opts.replace    -- if true, then replace current tutorial
  //   opts.origAssetId    -- If set, an object: origAsset: { ownerName: asset.dn_ownerName, id: asset._id }. THIS IS NOT USED FOR LOAD, JUST FOR OTHER UI TO ENABLE A EDIT-TUTORIAL BUTTON
  addJoyrideSteps: function (steps, opts = {}) {
    let joyride = this.refs.joyride

    if (_.isString(steps))
    {
      // We interpret this as an asset id, e.g cDutAafswYtN5tmRi, and we expect some JSON..
      const codeUrl = '/api/asset/tutorial/' + ( steps.startsWith(':') ? '!vault' + steps : steps)
      console.log(`Loading tutorial: '${steps}' from ${codeUrl}`)
      fetchAssetByUri(codeUrl)
        .then(  data => {
          let loadedSteps = null
          try {
            loadedSteps = JSON.parse(data)
          }
          catch (err)
          {
            const msg = `Unable to parse JSON for tutorial at '${codeUrl}: ${err.toString()}`
            showToast(msg, 'error')
            console.error(msg)
            loadedSteps = null
          }
          if (loadedSteps)
          {
            this.addJoyrideSteps(loadedSteps.steps, opts)
          }
          // console.log('started tutorial...', this.state.joyrideSkillPathTutorial)
          analytics.track('startTutorial', {
            title: this.state.joyrideSkillPathTutorial
            , category: "Tutorials"
          })
        })
        .catch( err => {
          showToast(`Unable to start tutorial '${steps}': ${err.toString()}`, 'error')
        } )
      return
    }


    if (!Array.isArray(steps))
      steps = [steps]

    if (!joyride || (steps.length === 0 && !opts.replace))
      return false

    const parsedSteps = joyride.parseSteps(steps)

    this.setState(function(currentState) {
      currentState.joyrideSteps = opts.replace ? parsedSteps : currentState.joyrideSteps.concat(parsedSteps)
      currentState.joyrideSkillPathTutorial = opts.skillPath || null
      if (opts.replace)
        currentState.joyrideCurrentStepNum = 0
      if (opts.origAssetId)
        currentState.joyrideOriginatingAssetId = opts.origAssetId  // Just to enable a nice edit Tutorial button in fpGoals

      return currentState
    })
  },

  addJoyrideTooltip(data) {
    this.refs.joyride.addTooltip(data)
  },

  handleJoyrideCallback( func ) {
    if (func.type === 'finished') {
      // console.log('finished tutorial...', this.state.joyrideSkillPathTutorial)
          analytics.track('startTutorial', {
            title: this.state.joyrideSkillPathTutorial
            , category: "Tutorials"
          })
      if (this.state.joyrideSkillPathTutorial && func.skipped === false)
        this.handleCompletedSkillTutorial( this.state.joyrideSkillPathTutorial )
      this.setState(
        {
          joyrideSteps: [],
          joyrideSkillPathTutorial: null,
          joyrideCurrentStepNum: 0,
          joyrideOriginatingAssetId: null
        }
      )
    } else if (func.type === 'step:after')
    {
      this.setState( { joyrideCurrentStepNum: func.newIndex } )
    }
  },

  // return null for no error, or a string with errors
  joyridePreparePageHandler( actionsString ) {
    const errors = []
    if (!actionsString || actionsString === '')
      return

    actionsString.split(',').forEach( act => {
      switch (act) {
      case 'closeFlexPanel':
        this.closeFlexPanel()
        break

      case 'closeNavPanel':
        console.error("closeNavPanel preparePage action is no longer needed/supported. Tutorial should be simplified")
        break


      case 'refreshBadgeStatus':
        Meteor.call('User.refreshBadgeStatus', (err, result) => {
          if (err)
            console.log('User.refreshBadgeStatus error', err)
          else
          {
            if (!result || result.length === 0)
              console.log(`No New badges awarded`)
            else
              showToast(`New badges awarded: ${result.join(', ')} `)
          }
        })
        break

      default:
        errors.push(`Action '${act} not recognized`)
      }
    } )

    return errors.length === 0 ? null : errors.join('; ') + '.'
  }

})

App.responsiveRules = {
  'portraitPhoneUI': {
    maxWidth: 420,
    respData: {
      footerTabMajorNav: true,        // |__| flexPanel as footer
      fpReservedFooterHeight:      '60px',
      fpReservedRightSidebarWidth: '0px'
    }
  },
  'desktopUI': {
    minWidth: 421,
    respData: {
      footerTabMajorNav: false,        //  flexPanel as right sidebar =|
      fpReservedFooterHeight:       '0px',
      fpReservedRightSidebarWidth:  px(fpIconColumnWidthInPixels)
    }
  }
}

import ResponsiveComponent from '/client/imports/ResponsiveComponent'
export default ResponsiveComponent(App)
