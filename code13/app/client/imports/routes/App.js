import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Message } from 'semantic-ui-react'
import { browserHistory } from 'react-router'
import Helmet from 'react-helmet'
import { createContainer } from 'meteor/react-meteor-data'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'
import SpecialGlobals from '/imports/SpecialGlobals'

import { utilPushTo } from '/client/imports/routes/QLink'

import Joyride, { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import '/client/imports/Joyride/react-joyride-compiled.css'

import { makeTutorialAssetPathFromSkillPath } from '/imports/Skills/SkillNodes/SkillNodes'
import { hasSkill, learnSkill } from '/imports/schemas/skills'

import { Activity, Projects, Settings, Sysvars, Skills, Users } from '/imports/schemas'
import { isSameUser } from '/imports/schemas/users'
import { isUserSuperAdmin } from '/imports/schemas/roles'

import { projectMakeSelector, defaultProjectSorter } from '/imports/schemas/projects'

import NavBar from '/client/imports/components/Nav/NavBar'
import NavPanel from '/client/imports/components/SidePanels/NavPanel'
import FlexPanel from '/client/imports/components/SidePanels/FlexPanel'
import NetworkStatusMsg from '/client/imports/routes/Nav/NetworkStatusMsg'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'

import urlMaker from './urlMaker'
import './webkitSmallScrollbars.css'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import { parseChannelName, makeChannelName, ChatChannels } from '/imports/schemas/chats'
import { getLastReadTimestampForChannel, getPinnedChannelNames } from '/imports/schemas/settings-client'

// https://www.npmjs.com/package/react-notifications
import { NotificationContainer, NotificationManager } from 'react-notifications'
// Note css is in /client/notifications.css
// Note - also, we copied the fonts this requires to public/fonts/notification.*

import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'

import { InitHotjar } from '/client/imports/helpers/hotjar.js'
import SupportedBrowsersContainer from '../components/SupportedBrowsers/SupportedBrowsersContainer'
import VerifyBanner from '/client/imports/components/Users/VerifyBanner'

import { hourOfCodeStore } from '/client/imports/stores'

let G_localSettings = new ReactiveDict()

// This works because <App> is the first Route in /app/client/imports/routes
const getPagenameFromProps = props => props.routes[1].name
const getPagepathFromProps = props => props.routes[1].path

let _theAppInstance = null

// we need to detect if user is not logged in and to do it once
// analytics is sent from getMeteorData()
// when analytics is send then change flag to false
let analyticsAnonymousSendFlag = true
// same for sending user logged in data
let analyticsLoggedInSendFlag = true
// init hotjar
let hotjarInitFlag = true

// for now, until we have push notifications for chat
const CHAT_POLL_INITIAL_MS = 3 * 1000
const CHAT_POLL_INTERVAL_MS = 12 * 1000

// Tutorial/Joyride infrastructure support

export const stopCurrentTutorial = () => {
  if (_theAppInstance) _theAppInstance.addJoyrideSteps.call(_theAppInstance, [], { replace: true })
}

export const addJoyrideSteps = (steps, opts) => {
  if (_theAppInstance) _theAppInstance.addJoyrideSteps.call(_theAppInstance, steps, opts)
}

export const joyrideDebugEnable = joyrideDebug => {
  // Disabled for now; it's pretty noisy and mostly useful for debugging joyride itself.
  // if (_theAppInstance)
  //   _theAppInstance.setState( { joyrideDebug } )
  // It may also be nice to do the equivalent of m.jr._ctDebugSpew = joyrideDebug
}

export const startSkillPathTutorial = skillPath => {
  if (_theAppInstance) _theAppInstance.startSkillPathTutorial.call(_theAppInstance, skillPath)
}

// clearPriorPathsForJoyrideCompletionTags() is for making the Completion Tag thing
//  work so it edge triggers only when pages are actually navigated to (rather than
//  every update).
// QLink.js calls this. There may be a better way to do this, but this isn't too
//  terribly factored so is OKish and it gets the job done for now.
// We will revisit this if any issues come up with this approach.
export const clearPriorPathsForJoyrideCompletionTags = () => {
  if (_theAppInstance) {
    _theAppInstance._priorLocationPath = null
    _theAppInstance._priorRouterPath = null
  }
}

// FlexPanel numbers
const fpIconColumnWidthInPixels = 60 // The Column of Icons
const fpFlexPanelContentWidthInPixels = 285 // The cool stuff

// Toast and other warnings
const _toastTypes = {
  error: { funcName: 'error', header: 'Error', delay: 7000 },
  warning: { funcName: 'warning', header: 'Warning', delay: 4000 },
  info: { funcName: 'info', header: 'Info', delay: 4000 },
  success: { funcName: 'success', header: 'Success', delay: 4000 },
}

/**
 * @param {string} content . . If non-null, then display the Notification
 * @param {string} [type='success']
 * @returns {Number} number of Milliseconds the alert will remain for. Can be used for revising _throttle etc. Even returned when content=null
 */
export const showToast = (content, type = 'success') => {
  const useType = _toastTypes[type] || _toastTypes['success']
  if (content) NotificationManager[useType.funcName](content, useType.header, useType.delay)
  return useType.delay
}

class AppUI extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    query: PropTypes.object,
    routes: PropTypes.array,
    location: PropTypes.object,
    children: PropTypes.object,
  }

  static childContextTypes = {
    urlLocation: PropTypes.object,
    settings: PropTypes.object,
    skills: PropTypes.object,
  }

  getChildContext() {
    // Note React (as of Aug2016) has a bug where shouldComponentUpdate() can prevent a contextValue update. See https://github.com/facebook/react/issues/2517
    return {
      urlLocation: this.props.location,
      settings: this.props.settings, // We pass Settings in context since it will be a huge pain to pass it throughout the component tree as props
      skills: this.props.skills, // We pass Skills in context since it will be a huge pain to pass it throughout the component tree as props
    }
  }

  state = {
    hideHeaders: false, // Show/Hide NavPanel & Some other UI (like Asset Edit Header). This is a bit slow to do in the Navbar, so doing it here */
    // read/unread Chat status. Gathered up here since it used across app, especially for notifications and lists
    chatChannelTimestamps: null, // as defined by Chats.getLastMessageTimestamps RPC
    hazUnreadChats: [], // will contain Array of channel names with unread chats
    // hazUnreadChats is a subset of the data in chatChannelTimestamps, but simplified - just an
    // Array of chat channelNames that have at least one unread message. Note that Global ChatChannels
    // are treated a little specially - if you have never visited a particular global channel you will
    // not get notifications for it. This is so new users don't get spammed to look at chat channels they
    // are not yet interested in. This will always be an array, never null or undefined
    // It is intended to be quick & convenient for generating notification UIs

    currentlyEditingAssetInfo: {
      // This is so that we can pass as subset of the Asset info into some other components
      // like the flexpanels and Nav controls.
      // The AssetEditRoute component is currently the only component expected to set this
      //  value, since that is the layer in the container hierarchy that actually loads
      // assets for the AssetEditors
      kind: null, // null or a string which is a one of assets:AssetKindKeys
      canEdit: false, // true or false. True iff editing an Asset _and_ user has edit permission
      projectNames: [], // Empty array, or array of strings for project names as described in assets.js
    },

    // For react-joyride
    joyrideSteps: [],
    joyrideSkillPathTutorial: null, // String with skillPath (e.g code.js.foo) IFF it was started by startSkillPathTutorial -- i.e. it is an OFFICIAL SKILL TUTORIAL
    joyrideCurrentStepNum: 0, // integer with cuurent step number (valid IFF there are steps defined)
    joyrideOriginatingAssetId: null, // Used to support nice EditTutorial button in fpGoals ONLY. Null, or, if set, an object: origAsset: { ownerName: asset.dn_ownerName, id: asset._id }. THIS IS NOT USED FOR LOAD, JUST FOR OTHER UI TO ENABLE A EDIT-TUTORIAL BUTTON
    joyrideDebug: false,
  }

  componentDidMount() {
    this._schedule_requestChatChannelTimestampsNow()
    registerDebugGlobal('app', this, __filename, 'The global App.js instance')
    _theAppInstance = this // This is so we can expose a few things conveniently but safely, and without too much react.context stuff

    window.addEventListener('keydown', this.handleKeyDown)

    if (window.performance) {
      // Gets the number of milliseconds since page load
      const timeSincePageLoad = Math.round(performance.now())
      ga('send', 'timing', 'Page load', 'load', timeSincePageLoad)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const pagepath = getPagepathFromProps(this.props)

    // Fire Completion Tags for the Joyride/Tutorial system. Make sure we only fire when the path has changed, not on every page update
    const newRouterPath = `mgbjr-CT-app-router-path-${pagepath}` // e.g. /u/:username
    if (newRouterPath !== this._priorRouterPath) joyrideCompleteTag(newRouterPath)
    this._priorRouterPath = newRouterPath

    const newLocationPath = `mgbjr-CT-app-location-path-${this.props.location.pathname}` // e.g. /u/dgolds   -- will exclude search/query params
    if (newLocationPath !== this._priorLocationPath) joyrideCompleteTag(newLocationPath)
    this._priorLocationPath = newLocationPath

    // Handle transition from empty to non-empty joyride and start the joyride/tutorial
    if (prevState.joyrideSteps.length === 0 && this.state.joyrideSteps.length > 0)
      this.refs.joyride.start(true)

    // if(this.props.params.assetId){
    //   console.log( this.props.params.assetId, this.state.currentlyEditingAssetInfo)
    // }
  }

  componentWillReceiveProps(nextProps) {
    // We are using https://github.com/okgrow/analytics but it does not automatically log
    // react-router routes, so we need a specific call when the page changes

    // analytics is from the Meteor package okgrow:analytics
    // See https://segment.com/docs/sources/website/analytics.js/#page for the analytics.page() params

    // getPagenameFromProps(nextProps) sometimes doesn't work. For example for /learn page
    const pageName = getPagenameFromProps(nextProps)
    const pathName = window.location.pathname
    const routeName = getPagepathFromProps(nextProps)

    let trackPage = null

    // TODO users routeName returns 'users' instead of '/users'
    if (_.indexOf(['/', '/games', 'users'], routeName) != -1) trackPage = routeName
    else if (pathName == '/') trackPage = '/'
    else if (_.startsWith(routeName, '/learn'))
      // if routeName starts with learn then add all routeName to log
      trackPage = routeName
    else if (nextProps.params.projectId || nextProps.params.projectName)
      // if params has projectId or projectName then we know that it's project details page
      trackPage = '/projectDetails'
    else if (nextProps.params.assetId) {
      // don't track here because we don't know asset type
      // do it in handleSetCurrentlyEditingAssetInfo()
    } else if (_.indexOf(['Games', 'Profile', 'Badges', 'Skills', 'Projects', 'Assets'], pageName) != -1)
      trackPage = '/' + pageName.toLowerCase()
    else trackPage = pathName // for any other untracked page

    if (trackPage) {
      // console.log('#################### ->', trackPage)

      ga('set', 'page', trackPage)
      ga('send', 'pageview', trackPage)
    }
  }

  _schedule_requestChatChannelTimestampsNow = () => {
    // One soon..
    window.setTimeout(this.requestChatChannelTimestampsNow, CHAT_POLL_INITIAL_MS)
    // And the ongoing poll less frequently
    window.setInterval(this.requestChatChannelTimestampsNow, CHAT_POLL_INTERVAL_MS)
  }

  handleKeyDown = kev => {
    if (kev.altKey && kev.shiftKey && kev.which === 72) {
      // alt-shift-h
      this.handleHideHeadersToggle()
      kev.preventDefault()
      kev.stopPropagation()
    }
  }

  handleHideHeadersToggle = () => {
    this.setState({ hideHeaders: !this.state.hideHeaders })
  }

  // TODO: Make this throttled, called when relevant
  requestChatChannelTimestampsNow = () => {
    if (!this.props.currUser) return

    const { settings, currUser, currUserProjects } = this.props
    const { assetId } = this.props.params

    // 0. Make the list of channels we are interested in:
    //       Global, relevantProjects, currentAsset, pinnedChannels.
    // Regarding AssetsChannels, our UX model is that the user should Pin any
    // asset channels they want notification of. We don't want to spam the
    // chat notifications with too much Asset noise

    const chanArray = _.concat(
      [makeChannelName({ scopeGroupName: 'User', scopeId: currUser.username })],
      _.map(ChatChannels.sortedKeys, k => makeChannelName({ scopeGroupName: 'Global', scopeId: k })),
      _.map(currUserProjects, p => makeChannelName({ scopeGroupName: 'Project', scopeId: p._id })),
      getPinnedChannelNames(settings),
    )
    if (assetId) chanArray.push(makeChannelName({ scopeGroupName: 'Asset', scopeId: assetId }))

    // 1. Now ask the server for the last message timestamps for these channels
    Meteor.call('Chats.getLastMessageTimestamps', chanArray, (error, chatChannelTimestamps) => {
      if (error) console.log('unable to invoke Chats.getLastMessageTimestamps()', error)
      else {
        // 2. Now process that list for easy consumption (and store results in state.hazUnreadChats and state.chatChannelTimestamps)
        let hazUnreadChats = []
        _.each(chatChannelTimestamps, cct => {
          const channelName = cct._id
          const lastReadByUser = getLastReadTimestampForChannel(settings, channelName)
          const channelObj = parseChannelName(channelName)
          cct._hazUnreads = Boolean(
            (channelObj && channelObj.scopeGroupName !== 'Global' && !lastReadByUser) || // Non-global chat groups that user has access to but has not looked at
              (lastReadByUser && cct.lastCreatedAt.getTime() > lastReadByUser.getTime()), // Any chat channel user has looked at but has more recent messages
          )
          if (cct._hazUnreads) hazUnreadChats.push(channelName)
        })
        if (
          !_.isEqual(hazUnreadChats, this.state.hazUnreadChats) ||
          !_.isEqual(chatChannelTimestamps, this.state.chatChannelTimestamps)
        )
          this.setState({ chatChannelTimestamps, hazUnreadChats })
      }
    })
  }

  configureTrackJs = () => {
    // TODO: Make reactive for login/logout
    // http://docs.trackjs.com/tracker/tips#include-user-id-version-and-session
    const doTrack = () => {
      const ver = mgbReleaseInfo.releases[0].id
      window.trackJs.configure({
        userId: Meteor.user() ? Meteor.user().profile.name : '(NotLoggedIntoMgb)',
        version: `${ver.ver} ${ver.state} ${ver.iteration}`,
        sessionId: Meteor.default_connection._lastSessionId,
      })
    }
    if (window.trackJs) doTrack()
    else {
      console.log('[tjfallback]') // so it's easier to know when this is happening
      $.getScript(makeCDNLink('/lib/t-r-a-c-k-e-r.js'), doTrack) // fallback to local version because of AdBlocks etc
    }
  }

  handleSetCurrentlyEditingAssetInfo = assetInfo => {
    if (!_.isEqual(this.state.currentlyEditingAssetInfo, assetInfo)) {
      // See comments in state = {} for explanation
      this.setState({ currentlyEditingAssetInfo: assetInfo })

      // guntis - the only place where I can get asset type and send to analytics
      if (_.startsWith(assetInfo.assetVerb, 'View') || _.startsWith(assetInfo.assetVerb, 'Edit')) {
        const path = '/asset/' + assetInfo.kind
        ga('set', 'page', path)
        ga('send', 'pageview', path)
      }
    }
  }

  render = () => {
    const {
      respData,
      respWidth,
      params,
      loading,
      currUser,
      user,
      currUserProjects,
      meteorStatus,
      sysvars,
    } = this.props
    const {
      joyrideDebug,
      currentlyEditingAssetInfo,
      chatChannelTimestamps,
      hazUnreadChats,
      hideHeaders,
    } = this.state
    const { query } = this.props.location
    const isGuest = currUser ? currUser.profile.isGuest : false
    if (!loading) this.configureTrackJs()

    // The Flex Panel is for communications and common quick searches in a right hand margin
    //   (or fixed footer for Phone-size PortraitUI)
    const flexPanelQueryValue = query[urlMaker.queryParams('app_flexPanel')]
    const showFlexPanel = !!flexPanelQueryValue && flexPanelQueryValue[0] !== '-'
    const flexPanelWidthWhenExpanded = respData.fpReservedRightSidebarWidth
      ? `${fpIconColumnWidthInPixels + fpFlexPanelContentWidthInPixels}px`
      : `${fpFlexPanelContentWidthInPixels}px`
    const flexPanelWidth = showFlexPanel ? flexPanelWidthWhenExpanded : respData.fpReservedRightSidebarWidth

    const mainAreaAvailableWidth = respWidth - parseInt(flexPanelWidth)

    // The main Panel:  Outer is for the scroll container; inner is for content
    var mainPanelOuterDivSty = {
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      top: 0,
      bottom: respData.fpReservedFooterHeight,
      left: 0,
      right: `${isGuest ? 0 : flexPanelWidth}`,
      marginBottom: '0px',
      minHeight: '100vh',
      WebkitOverflowScrolling: 'touch', // only works with overflowY: scroll (not auto)
    }

    isGuest ? (mainPanelOuterDivSty.overflow = 'hidden') : (mainPanelOuterDivSty.overflowY = 'scroll')

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    const isSuperAdmin = isUserSuperAdmin(currUser)
    const ownsProfile = isSameUser(currUser, user)

    const hazUnreadAssetChat =
      params.assetId &&
      _.includes(hazUnreadChats, makeChannelName({ scopeGroupName: 'Asset', scopeId: params.assetId }))

    return (
      <div>
        <Helmet
          title="MGB"
          titleTemplate="%s"
          meta={[{ name: 'My Game Builder', content: 'MyGameBuilder' }]}
        />
        <Joyride
          ref="joyride"
          steps={this.state.joyrideSteps}
          showOverlay
          disableOverlay={false}
          showSkipButton
          tooltipOffset={0}
          showStepsProgress
          type="continuous"
          callback={this.handleJoyrideCallback}
          preparePageHandler={this.joyridePreparePageHandler}
          assetId={params.assetId}
          debug={joyrideDebug}
        />
        <div>
          {!isGuest && (
            <FlexPanel
              fpIsFooter={!!respData.footerTabMajorNav}
              joyrideSteps={this.state.joyrideSteps}
              joyrideSkillPathTutorial={this.state.joyrideSkillPathTutorial}
              joyrideCurrentStepNum={this.state.joyrideCurrentStepNum}
              joyrideOriginatingAssetId={this.state.joyrideOriginatingAssetId}
              currUser={currUser}
              chatChannelTimestamps={chatChannelTimestamps}
              hazUnreadChats={hazUnreadChats}
              requestChatChannelTimestampsNow={this.requestChatChannelTimestampsNow}
              currUserProjects={currUserProjects}
              user={user}
              selectedViewTag={flexPanelQueryValue}
              handleFlexPanelToggle={this.handleFlexPanelToggle}
              handleFlexPanelChange={this.handleFlexPanelChange}
              flexPanelWidth={flexPanelWidth}
              flexPanelIsVisible={showFlexPanel}
              activity={this.props.activity}
              isSuperAdmin={isSuperAdmin}
              currentlyEditingAssetInfo={currentlyEditingAssetInfo}
            />
          )}

          <div style={mainPanelOuterDivSty} id="mgb-jr-main-container">
            <SupportedBrowsersContainer />
            {!isGuest && <VerifyBanner currUser={currUser} />}
            {!hideHeaders && <NavPanel currUser={currUser} navPanelAvailableWidth={mainAreaAvailableWidth} />}
            {!isGuest && (
              <NavBar
                currUser={currUser}
                user={user}
                location={this.props.location}
                name={this.props.routes[1].name}
                params={this.props.params}
                flexPanelWidth={flexPanelWidth}
                hideHeaders={hideHeaders}
                onToggleHeaders={this.handleHideHeadersToggle}
                sysvars={sysvars}
                currentlyEditingAssetInfo={currentlyEditingAssetInfo}
              />
            )}

            {currUser &&
            currUser.suIsBanned && (
              <Message
                error
                icon="ban"
                header="Your Account has been suspended by an Admin"
                list={[
                  'You may not edit Assets or Projects',
                  'You may not send Chat messages',
                  'Check your email for details',
                ]}
              />
            )}

            {!loading &&
              this.props.children &&
              React.cloneElement(this.props.children, {
                // Make below props available to all routes.
                user,
                currUser,
                hideHeaders,
                currUserProjects,
                hazUnreadAssetChat,
                ownsProfile,
                isSuperAdmin,
                availableWidth: mainAreaAvailableWidth,
                handleSetCurrentlyEditingAssetInfo: this.handleSetCurrentlyEditingAssetInfo,
                isTopLevelRoute: true, // Useful so routes can be re-used for embedding.  If false, they can turn off toolbars/headings etc as appropriate
              })}
          </div>
        </div>
        <NetworkStatusMsg meteorStatus={meteorStatus} />
        <NotificationContainer />
      </div>
    )
  }

  /**
   * This will show/hide the Flex Panel
   */
  handleFlexPanelToggle = () => {
    const loc = this.props.location
    const qp = urlMaker.queryParams('app_flexPanel')
    let newQ
    if (loc.query[qp]) newQ = _.omit(loc.query, qp)
    else newQ = { ...loc.query, [qp]: NavPanel.getDefaultPanelViewTag() } //TODO: Wrong tag!?
    browserHistory.push({ ...loc, query: newQ })
  }

  closeFlexPanel = () => {
    const loc = this.props.location
    const qp = urlMaker.queryParams('app_flexPanel')
    if (loc.query[qp]) {
      const newQ = _.omit(loc.query, qp)
      browserHistory.push({ ...loc, query: newQ })
    }
  }

  /**
   * @param newFpView {String} the string that will be used for _fp=panel.submparam eg. "chat", or "chat.G_GENERAL_" or "assets" etc
   */
  handleFlexPanelChange = newFpView => {
    const qp = urlMaker.queryParams('app_flexPanel')

    const queryModifier = { [qp]: newFpView }
    const loc = this.props.location
    const newQ = { ...loc.query, ...queryModifier }
    browserHistory.push({ ...loc, query: newQ })
  }

  //
  // TOAST
  //
  startSkillPathTutorial = skillPath => {
    const tutPath = makeTutorialAssetPathFromSkillPath(skillPath, 0)
    this.addJoyrideSteps(tutPath, { replace: true, skillPath })
  }

  handleCompletedSkillTutorial = tutorialSkillPath => {
    console.log('Completed a Skill Tutorial: ', tutorialSkillPath)
    if (!hasSkill(tutorialSkillPath)) {
      showToast(`Tutorial Completed, Skill '${tutorialSkillPath}' gained`)
      learnSkill(tutorialSkillPath)

      // because we don't want award badge now, but wait for next tutorial
      if (tutorialSkillPath != 'getStarted.profile.avatar') {
        Meteor.call('User.refreshBadgeStatus', (err, result) => {
          if (err) console.log('User.refreshBadgeStatus error', err)
          else {
            if (!result || result.length === 0) console.log(`No New badges awarded`)
            else showToast(`New badges awarded: ${result.join(', ')} `)
          }
        })
      }
    }
  }

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
  addJoyrideSteps = (steps, opts = {}) => {
    let joyride = this.refs.joyride

    if (_.isString(steps)) {
      // We interpret this as an asset id, e.g cDutAafswYtN5tmRi, and we expect some JSON..
      const codeUrl = '/api/asset/tutorial/' + (steps.startsWith(':') ? '!vault' + steps : steps)
      console.log(`Loading tutorial: '${steps}' from ${codeUrl}`)
      fetchAssetByUri(codeUrl)
        .then(data => {
          let loadedSteps = null
          try {
            loadedSteps = JSON.parse(data)
          } catch (err) {
            const msg = `Unable to parse JSON for tutorial at '${codeUrl}: ${err.toString()}`
            showToast(msg, 'error')
            console.error(msg)
            loadedSteps = null
          }
          if (loadedSteps) {
            this.addJoyrideSteps(loadedSteps.steps, opts)
          }
          // console.log('started tutorial...', this.state.joyrideSkillPathTutorial)
          // analytics.track('startTutorial', {
          //   title: this.state.joyrideSkillPathTutorial
          //   , category: "Tutorials"
          // })
        })
        .catch(err => {
          showToast(`Unable to start tutorial '${steps}': ${err.toString()}`, 'error')
        })
      return
    }

    if (!Array.isArray(steps)) steps = [steps]

    if (!joyride || (steps.length === 0 && !opts.replace)) return false

    const parsedSteps = joyride.parseSteps(steps)

    this.setState(function(currentState) {
      currentState.joyrideSteps = opts.replace ? parsedSteps : currentState.joyrideSteps.concat(parsedSteps)
      currentState.joyrideSkillPathTutorial = opts.skillPath || null
      if (opts.replace) currentState.joyrideCurrentStepNum = 0
      if (opts.origAssetId) currentState.joyrideOriginatingAssetId = opts.origAssetId // Just to enable a nice edit Tutorial button in fpGoals

      return currentState
    })
  }

  handleJoyrideCallback = func => {
    if (func.type === 'finished') {
      // console.log('finished tutorial...', this.state.joyrideSkillPathTutorial)
      // analytics.track('startTutorial', {
      //   title: this.state.joyrideSkillPathTutorial
      //   , category: "Tutorials"
      // })
      if (this.state.joyrideSkillPathTutorial && func.skipped === false)
        this.handleCompletedSkillTutorial(this.state.joyrideSkillPathTutorial)
      this.setState({
        joyrideSteps: [],
        joyrideSkillPathTutorial: null,
        joyrideCurrentStepNum: 0,
        joyrideOriginatingAssetId: null,
      })
    } else if (func.type === 'step:after') {
      this.setState({ joyrideCurrentStepNum: func.newIndex })
    }
  }
  joyrideHandlers = {
    // !!! these functions must not refer to this or do other funny stuff !!!
    openAsset(type, user, name) {
      // TODO: get location query ???? - or location query should be handled by QLink?
      utilPushTo(null, `/assetEdit/${type}/${user}/${name}`)
    },
    highlightCode(from, to) {
      const evt = new Event('mgbjr-highlight-code')
      evt.data = { from, to }
      window.dispatchEvent(evt)
    },
  }
  // return null for no error, or a string with errors
  joyridePreparePageHandler = actionsString => {
    const errors = []
    if (!actionsString || actionsString === '') return

    // The preparePage string can have multiple actions, each are separated by a comma character
    actionsString.split(',').forEach(act => {
      // defined above in
      const params = act.split(':')
      const action = params.shift()
      if (this.joyrideHandlers[action]) {
        this.joyrideHandlers[action].apply(null, params)
        return
      }

      // Some preparePage actions have a parameter - this is usually colon separated
      const [actText, actParam] = _.split(act, ':')
      switch (actText) {
        case 'openVaultAssetById':
          // we want to open asset !vault:actParam
          utilPushTo(null, `/u/!vault/asset/${actParam}`)
          break

        case 'openVaultAssetByName':
          // utilPushTo(null, `/u/!vault/asset/${actParam}`)
          // break
          throw new Error('@dgolds 2/5/17 debugger: TODO @@@@@ need to actually get id from name')

        case 'navToRelativeUrl':
          utilPushTo(null, actParam)
          break

        case 'openVaultProjectById':
          utilPushTo(null, `/u/!vault/project/${actParam}`)
          break

        case 'openVaultProjectByName':
          utilPushTo(null, `/u/!vault/projects/${actParam}`)
          break

        case 'closeFlexPanel':
          this.closeFlexPanel()
          break

        case 'openFlexPanel':
          this.handleFlexPanelChange(actParam)
          break

        case 'closeNavPanel':
          console.error(
            'joyridePreparePageHandler(closeNavPanel) has been deprecated. Tutorial should be simplified',
          )
          break

        case 'highlightCode':
          console.log('Highlight code', actParam)
          break

        case 'refreshBadgeStatus':
          Meteor.call('User.refreshBadgeStatus', (err, result) => {
            if (err) console.log('User.refreshBadgeStatus error', err)
            else {
              if (!result || result.length === 0) console.log(`No New badges awarded`)
              else showToast(`New badges awarded: ${result.join(', ')} `)
            }
          })
          break

        default:
          errors.push(`Action '${act} not recognized`)
      }
    })

    return errors.length === 0 ? null : errors.join('; ') + '.'
  }
}

const App = createContainer(({ params, location }) => {
  const pathUserName = params.username // This is the username (profile.name) on the url /u/xxxx/...
  const pathUserId = params.id // LEGACY ROUTES - This is the userId on the url /user/xxxx/...
  const currUser = Meteor.user()
  const currUserId = currUser && currUser._id
  const handleForUser = pathUserName
    ? Meteor.subscribe('user.byName', pathUserName)
    : Meteor.subscribe('user', pathUserId) // LEGACY ROUTES
  const handleForSysvars = Meteor.subscribe('sysvars')

  // skills stuff
  const handleForSkills = currUserId ? Meteor.subscribe('skills.userId', currUserId) : null
  const skillsReady = handleForSkills === null ? true : handleForSkills.ready()

  // settings stuff
  const handleForSettings = currUserId ? Meteor.subscribe('settings.userId', currUserId) : null
  const settingsReady = handleForSettings === null ? true : handleForSettings.ready()

  // activity? if useful..
  const flexPanelQueryValue = location.query[urlMaker.queryParams('app_flexPanel')]
  const getActivity = currUser || flexPanelQueryValue === 'activity'
  const handleActivity = getActivity
    ? Meteor.subscribe('activity.public.recent', SpecialGlobals.activity.activityHistoryLimit)
    : null

  // projects stuff
  const handleForProjects = currUserId ? Meteor.subscribe('projects.byUserId', currUserId) : null
  const projectsReady = handleForProjects === null ? true : handleForProjects.ready()
  const projectSelector = projectMakeSelector(currUserId)

  if (handleForSettings && handleForSettings.ready()) {
    //console.log("Update Settings Reactive.Dict object from Meteor")
    // There is a very small race where local settings could get replaced
    // if the settings are changed while the debounced save is happening..
    // but it's pretty small, so worry about that another day
    G_localSettings.set(Settings.findOne(currUserId))
  }

  // send analytics data if user is not logged in and do it only once!
  if (typeof currUser !== 'undefined' && currUser === null && analyticsAnonymousSendFlag) {
    // analytics.page('/notLoggedIn')
    ga('send', 'pageview', '/notLoggedIn')
    analyticsAnonymousSendFlag = false
  }
  // set various analytics params when user logs in
  if (currUser && analyticsLoggedInSendFlag) {
    // dimension1 = user id dimension (trick google to show individual id's)
    ga('set', 'dimension1', currUser._id)
    // superAdmin or tester user - need to filter them out in reports
    if (isUserSuperAdmin(currUser) || currUser._id === 'AJ8jrFjxSYJATzscA') ga('set', 'dimension2', 'admin')

    // tell google that this is user and all session need to connect to this data point
    ga('set', 'userId', currUser._id)
    analyticsLoggedInSendFlag = false
  }

  if (typeof currUser !== 'undefined' && hotjarInitFlag) {
    InitHotjar(currUser)
    hotjarInitFlag = false
  }

  return {
    currUser: currUser ? currUser : null, // Avoid 'undefined'. It's null, or it's defined. Currently Logged in user. Putting it here makes it reactive

    currUserProjects: !handleForProjects
      ? []
      : Projects.find(projectSelector, { sort: defaultProjectSorter }).fetch(),
    user: pathUserName ? Users.findOne({ 'profile.name': pathUserName }) : Users.findOne(pathUserId), // User on the url /user/xxx/...
    activity: getActivity ? Activity.find({}, { sort: { timestamp: -1 } }).fetch() : [], // Activity for any user
    settings: G_localSettings,
    meteorStatus: Meteor.status(),
    skills: currUser ? Skills.findOne(currUserId) : null,
    sysvars: Sysvars.findOne(),
    loading:
      !handleForUser.ready() ||
      !handleForSysvars.ready() ||
      !(!handleActivity || handleActivity.ready()) ||
      !projectsReady ||
      !settingsReady ||
      !skillsReady,
  }
}, AppUI)

App.responsiveRules = {
  portraitPhoneUI: {
    maxWidth: 420,
    respData: {
      footerTabMajorNav: true, // |__| flexPanel as footer
      fpReservedFooterHeight: '60px',
      fpReservedRightSidebarWidth: '0px',
    },
  },
  desktopUI: {
    minWidth: 421,
    respData: {
      footerTabMajorNav: false, //  flexPanel as right sidebar =|
      fpReservedFooterHeight: '0px',
      fpReservedRightSidebarWidth: `${fpIconColumnWidthInPixels}px`,
    },
  },
}

import ResponsiveComponent from '/client/imports/ResponsiveComponent'

export default ResponsiveComponent(App)
