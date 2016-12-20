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
import Toast from '/client/imports/components/Nav/Toast'
import Spinner from '/client/imports/components/Nav/Spinner'
import NavPanel from '/client/imports/components/SidePanels/NavPanel'
import FlexPanel from '/client/imports/components/SidePanels/FlexPanel'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'

import urlMaker from './urlMaker'
import webkitSmallScrollbars from './webkitSmallScrollbars.css'

import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'

let G_localSettings = new ReactiveDict()

  // This works because <App> is the first Route in /app/client/imports/routes
const getPagenameFromProps = props => props.routes[1].name
const getPagepathFromProps = props => props.routes[1].path

const npColumn1Width = "60px"

let _theAppInstance = null

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


export const joyrideDebugEnable = joyrideDebug => {
  if (_theAppInstance) 
    _theAppInstance.setState( { joyrideDebug } )
  // It may also be nice to do the equivalent of m.jr._ctDebugSpew = joyrideDebug
}

export default App = React.createClass({
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

  togglePanelsKeyHandler: function(e) {
    e = e || window.event
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.handleDualPaneToggle()
    }
  },

  componentDidMount: function() {

    window.onkeyup = this.togglePanelsKeyHandler
    registerDebugGlobal( 'app', this, __filename, 'The global App.js instance')
    _theAppInstance = this   // This is so we can expose a few things conveniently but safely, and without too much react.context stuff
  },

  componentDidUpdate: function(prevProps, prevState) {
    const pagepath = getPagepathFromProps(this.props)
    joyrideCompleteTag(`mgbjr-CT-app-router-path-${pagepath}`)                // e.g. /u/:username
    joyrideCompleteTag(`mgbjr-CT-app-location-path-${this.props.location.pathname}`)    // e.g. /u/dgolds   -- will exclude search/query params

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
      showToast: false,
      toastMsg: '',
      toastType: 'success',
      fNavPanelIsOverlay: true,    // Could make this initial value based on screen size, but that might be odd
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
      $.getScript("/lib/tracker.js", doTrack)   // fallback to local version because of AdBlocks etc
  },

  render() {

    const { fNavPanelIsOverlay, showToast, toastMsg, toastType, joyrideDebug } = this.state
    const { loading, currUser, user, currUserProjects, sysvars } = this.data
    const { query } = this.props.location

    if (!loading)
      this.configureTrackJs()

    // The NavPanel (left), NavBar (top) and FlexPanel (right) are fixed/absolute positioned so we need to account for that

    // ProjectScopeLock is an optional 2nd row of the NavBar. It is used to show the height of the 
    const projectScopeLockValue = query[urlMaker.queryParams("app_projectScopeLock")]
    const showProjectScopeLock = !!projectScopeLockValue
    const navBarHeight = showProjectScopeLock ? '80px' : '40px'

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
      top:      navBarHeight,
      bottom:   "0px",
      left:     navPanelReservedWidth,
      right:    flexPanelWidth,
      overflow: "auto",
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
          title="MGB"
          titleTemplate="%s"
          meta={[
              {"name": "My Game Builder", "content": "MyGameBuilder"}
          ]}
        />

        <Joyride 
          ref="joyride" 
          steps={this.state.joyrideSteps} 
          showOverlay={false}
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
              pathLocation={this.props.location.pathname}
              name={this.props.routes[1].name}
              params={this.props.params}
              flexPanelWidth={flexPanelWidth}
              navPanelWidth={navPanelReservedWidth}
              navPanelIsVisible={showNavPanel}
              conserveSpace={conserveSpace}
              projectScopeLock={projectScopeLockValue}
              sysvars={sysvars}
              />


            <FlexPanel
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

            <div
              style={mainPanelOuterDivSty}
              className={conserveSpace ? "conserveSpace noScrollbarDiv" : "noScrollbarDiv"}>
              <div style={mainPanelInnerDivSty}>
                { showToast &&
                  <Toast content={toastMsg} type={toastType} />
                }
                {
                  !loading && this.props.children && React.cloneElement(this.props.children, {
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

            { (fNavPanelIsOverlay && showNavPanel) &&   // Overlay to catch clicks when Overlay NavPanel is up.
              <div 
                  onClick={ () => this.handleNavPanelToggle() } 
                  style={ { 
                    position: "fixed",
                    zIndex: 200,
                    top:      "0px",
                    bottom:   "0px",
                    left:     navPanelWidth,
                    right:    flexPanelWidth,
                    backgroundColor: "rgba(0,0,0,0.2)",
                    overflow: "scroll",
                    marginBottom: "0px"} } />
            }
            
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


  handleNavPanelChange: function(newFpView, fForceNavPanelIsNotOverlay)
  {
    const qp = urlMaker.queryParams("app_navPanel")

    const queryModifier = {[qp]: newFpView}
    const loc = this.props.location
    const newQ = {...loc.query, ...queryModifier }
    
    if (fForceNavPanelIsNotOverlay)
      this.setState( { "fNavPanelIsOverlay": false })
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

  //
  // TOAST
  //

  showToast(content, type = 'success') {
    this.setState({
      showToast: true,
      toastMsg: content,    // toastMsg content is string that accepts HTML
      toastType: type       // type is a string: 'error' or 'success'
    })
    window.setTimeout(() => { this.closeToast() }, 2500)
  },

  closeToast() {
    this.setState( { showToast: false, toastMsg: '' } )
  },

  startSignUpTutorial() 
  {
    if (this.currUser)
    {
      console.error('startSignUpTutorial() but user is already loggedin')
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
      this.showToast( 'Tutorial Completed, Skill gained :' + tutorialSkillPath )
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
            alert(msg)
            console.error(msg)
            loadedSteps = null
          }
          if (loadedSteps)
          {
            this.addJoyrideSteps(loadedSteps.steps, opts)
          }
        })
        .catch( err => {
          alert(`Unable to start tutorial '${steps}': ${err.toString()}`) 
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

      case 'refreshBadgeStatus':
        Meteor.call('User.refreshBadgeStatus', (err, result) => {
          if (err)
            console.log(err)
          else
            console.log(`${result} Additional badges awarded`)
        })
        break

      // case 'closeNavPanel':
      //   this.closeNavPanel()
      //   break
        
      default:
        errors.push(`Action '${act} not recognized`)
      }
    } )

    return errors.length === 0 ? null : errors.join('; ') + '.'
  }
 
})
