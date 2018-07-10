import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Helmet from 'react-helmet'
import { Button, Dropdown, Grid, Header, Icon, Message, Segment } from 'semantic-ui-react'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'
import SpecialGlobals from '/imports/SpecialGlobals'

import { responsiveComponent, withStores, withMeteorData } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'

import { JoyrideRootHelper } from '/client/imports/components/Joyride'

import { getFeedSelector } from '/imports/schemas/activity'
import { Activity, Projects, Settings, Sysvars, Skills, Users } from '/imports/schemas'
import { isSameUser } from '/imports/schemas/users'
import { isUserSuperAdmin } from '/imports/schemas/roles'

import { projectMakeSelector, defaultProjectSorter } from '/imports/schemas/projects'

import { AnnouncementBanner } from '/client/imports/components/Home/AnnouncementBanner'
import AssetCreateNewModal from '/client/imports/components/Assets/NewAsset/AssetCreateNewModal'
import NavBar from '/client/imports/components/Nav/NavBar'
import RelatedAssets from '/client/imports/components/Nav/RelatedAssets'
import NavPanel from '/client/imports/components/SidePanels/NavPanel'
import FlexPanel from '/client/imports/components/SidePanels/FlexPanel'
import NetworkStatusMsg from '/client/imports/routes/Nav/NetworkStatusMsg'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'

import urlMaker from './urlMaker'
import './webkitSmallScrollbars.css'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import { parseChannelName, makeChannelName, ChatChannels } from '/imports/schemas/chats'
import { getLastReadTimestampForChannel, getPinnedChannelNames } from '/imports/schemas/settings-client'

// https://www.npmjs.com/package/react-notifications
import { NotificationContainer } from 'react-notifications'
// Note css is in /client/notifications.css
// Note - also, we copied the fonts this requires to public/fonts/notification.*

import { InitHotjar } from '/client/imports/helpers/hotjar.js'
import SupportedBrowsersContainer from '../components/SupportedBrowsers/SupportedBrowsersContainer'
import VerifyBanner from '/client/imports/components/Users/VerifyBanner'
import { _NO_PROJECT_PROJNAME } from '../components/Assets/ProjectSelector'

let G_localSettings = new ReactiveDict()

// This works because <App> is the first Route in /app/client/imports/routes
const getPagenameFromProps = props => props.routes[1].name
const getPagepathFromProps = props => props.routes[1].path

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

const ACTIVITY_POLL_INITIAL_MS = 3 * 1000
const ACTIVITY_POLL_INTERVAL_MS = 12 * 1000

// FlexPanel numbers
const fpIconColumnWidthInPixels = 60 // The Column of Icons
const fpFlexPanelContentWidthInPixels = 260 // The cool stuff

class AppUI extends Component {
  static propTypes = {
    ...responsiveComponent.propTypes,
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
    // Note React (as of Aug2016) has a bug where shouldComponentUpdate() can prevent a contextValue update. See
    // https://github.com/facebook/react/issues/2517
    return {
      urlLocation: this.props.location,
      settings: this.props.settings, // We pass Settings in context since it will be a huge pain to pass it throughout
      // the component tree as props
      skills: this.props.skills, // We pass Skills in context since it will be a huge pain to pass it throughout the
      // component tree as props
    }
  }

  state = {
    hideHeaders: false, // Show/Hide NavPanel & Some other UI (like Asset Edit Header). This is a bit slow to do in the
    // Navbar, so doing it here */
    // read/unread Chat status. Gathered up here since it used across app, especially for notifications and lists
    chatChannelTimestamps: null, // as defined by Chats.getLastMessageTimestamps RPC
    hazUnreadChats: [], // will contain Array of channel names with unread chats
    // hazUnreadChats is a subset of the data in chatChannelTimestamps, but simplified - just an
    // Array of chat channelNames that have at least one unread message. Note that Global ChatChannels
    // are treated a little specially - if you have never visited a particular global channel you will
    // not get notifications for it. This is so new users don't get spammed to look at chat channels they
    // are not yet interested in. This will always be an array, never null or undefined
    // It is intended to be quick & convenient for generating notification UIs

    hazUnreadActivities: [], // will always contain array even empty one

    currentlyEditingAssetInfo: {
      // This is so that we can pass as subset of the Asset info into some other components
      // like the flexpanels and Nav controls.
      // The AssetEditRoute component is currently the only component expected to set this
      //  value, since that is the layer in the container hierarchy that actually loads
      // assets for the AssetEditors
      kind: null, // null or a string which is a one of assets:AssetKindKeys
      canEdit: false, // true or false. True iff editing an Asset _and_ user has edit permission
      projectNames: [], // Empty array, or array of strings for project names as described in assets.js
      ownerName: '', // The asset.dn_ownerName, human readable name of the asset owner's profile
    },
  }

  componentDidMount() {
    this._schedule_requestChatChannelTimestampsNow()
    this._schedule_requestUnreadActivities()
    registerDebugGlobal('app', this, __filename, 'The global App.js instance')

    window.addEventListener('keydown', this.handleKeyDown)

    if (window.performance) {
      // Gets the number of milliseconds since page load
      const timeSincePageLoad = Math.round(performance.now())
      ga('send', 'timing', 'Page load', 'load', timeSincePageLoad)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const pagepath = getPagepathFromProps(this.props)

    // Fire Completion Tags for the Joyride/Tutorial system. Make sure we only fire when the path has changed, not on
    // every page update
    const newRouterPath = `mgbjr-CT-app-router-path-${pagepath}` // e.g. /u/:username
    if (newRouterPath !== this._priorRouterPath) joyrideStore.completeTag(newRouterPath)
    this._priorRouterPath = newRouterPath

    const newLocationPath = `mgbjr-CT-app-location-path-${this.props.location.pathname}` // e.g. /u/dgolds   -- will
    // exclude search/query params
    if (newLocationPath !== this._priorLocationPath) joyrideStore.completeTag(newLocationPath)
    this._priorLocationPath = newLocationPath
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

  _schedule_requestUnreadActivities = () => {
    window.setTimeout(this.requestUnreadActivities, ACTIVITY_POLL_INITIAL_MS)
    window.setInterval(this.requestUnreadActivities, ACTIVITY_POLL_INTERVAL_MS)
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
        // 2. Now process that list for easy consumption (and store results in state.hazUnreadChats and
        // state.chatChannelTimestamps)
        let hazUnreadChats = []
        _.each(chatChannelTimestamps, cct => {
          const channelName = cct._id
          const lastReadByUser = getLastReadTimestampForChannel(settings, channelName)
          const channelObj = parseChannelName(channelName)
          cct._hazUnreads = Boolean(
            (channelObj && channelObj.scopeGroupName !== 'Global' && !lastReadByUser) || // Non-global chat groups that user has
              // access to but has not looked at
              (lastReadByUser && cct.lastCreatedAt.getTime() > lastReadByUser.getTime()), // Any chat channel user has
            // looked at but has more
            // recent messages
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

  requestUnreadActivities = () => {
    Meteor.call('Activity.getUnreadLog', (error, activities) => {
      if (error) console.warn(error)
      else {
        this.setState({ hazUnreadActivities: activities })
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

      const $script = document.createElement('script')
      $script.setAttribute('src', makeCDNLink('/lib/t-r-a-c-k-e-r.js')) // fallback to local version because of
      // AdBlocks etc
      $script.setAttribute('onload', doTrack)
      document.currentScript &&
        document.currentScript.parentNode.insertBefore($script, document.currentScript)
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
    const { location } = this.props
    const queryParams = urlMaker.queryParams('app_flexPanel')

    if (location.query[queryParams]) {
      browserHistory.push({
        ...location,
        query: _.omit(location.query, queryParams),
      })
    }
  }

  render() {
    const {
      currUser,
      currUserProjects,
      joyride,
      loading,
      meteorStatus,
      params,
      responsive,
      sysvars,
      user,
    } = this.props
    const {
      currentlyEditingAssetInfo,
      chatChannelTimestamps,
      hazUnreadActivities,
      hazUnreadChats,
      hideHeaders,
    } = this.state
    const { query } = this.props.location
    const isGuest = currUser ? currUser.profile.isGuest : false
    const isHocRoute = window.location.pathname === '/hour-of-code'
    const announcement = ''
    if (!loading) this.configureTrackJs()

    // The Flex Panel is for communications and common quick searches in a right hand margin
    //   (or fixed footer for Phone-size PortraitUI)
    const flexPanelQueryValue = query[urlMaker.queryParams('app_flexPanel')]
    const showFlexPanel = !!flexPanelQueryValue && flexPanelQueryValue[0] !== '-'
    const flexPanelWidthWhenExpanded = responsive.data.fpReservedRightSidebarWidth
      ? `${fpIconColumnWidthInPixels + fpFlexPanelContentWidthInPixels}px`
      : `${fpFlexPanelContentWidthInPixels}px`
    const flexPanelWidth = showFlexPanel
      ? flexPanelWidthWhenExpanded
      : responsive.data.fpReservedRightSidebarWidth

    const mainAreaAvailableWidth = responsive.width - parseInt(flexPanelWidth)

    // The main Panel:  Outer is for the scroll container; inner is for content
    var mainPanelOuterDivSty = {
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      top: 0,
      bottom: responsive.data.fpReservedFooterHeight,
      left: 0,
      right: `${isGuest || isHocRoute ? 0 : flexPanelWidth}`,
      marginBottom: '0px',
      height: '100vh',
      overflow: isGuest || isHocRoute ? 'hidden' : 'auto',
      WebkitOverflowScrolling: 'touch', // only works with overflowY: scroll (not auto)
    }

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    const isSuperAdmin = isUserSuperAdmin(currUser)
    const ownsProfile = isSameUser(currUser, user)

    const hazUnreadAssetChat =
      params.assetId &&
      _.includes(hazUnreadChats, makeChannelName({ scopeGroupName: 'Asset', scopeId: params.assetId }))

    const projectName = [params.projectName, _.get(location, 'query.project')]
      .concat(currentlyEditingAssetInfo.projectNames)
      .filter(
        name =>
          // remove falsey values
          !!name &&
          // there is a weird case where the query param for "no project" is actually ?project=_
          // make sure we don't show that in the breadcrumb :/ fix that someday...
          name !== _NO_PROJECT_PROJNAME,
      )[0]

    const routeComponent =
      !loading &&
      this.props.children &&
      React.cloneElement(this.props.children, {
        // Make below props available to all routes.
        user,
        currUser,
        hideHeaders,
        currentlyEditingAssetInfo,
        currUserProjects,
        hazUnreadAssetChat,
        ownsProfile,
        isSuperAdmin,
        availableWidth: mainAreaAvailableWidth,
        handleSetCurrentlyEditingAssetInfo: this.handleSetCurrentlyEditingAssetInfo,
        isTopLevelRoute: true, // Useful so routes can be re-used for embedding.  If false, they can turn off
        // toolbars/headings etc as appropriate
      })

    return (
      <div>
        <Helmet
          title="MGB"
          titleTemplate="%s"
          meta={[{ name: 'My Game Builder', content: 'MyGameBuilder' }]}
        />
        <JoyrideRootHelper currUser={currUser} />
        {!isGuest &&
        !isHocRoute && (
          <FlexPanel
            fpIsFooter={!!responsive.data.footerTabMajorNav}
            currUser={currUser}
            chatChannelTimestamps={chatChannelTimestamps}
            hazUnreadChats={hazUnreadChats}
            requestChatChannelTimestampsNow={this.requestChatChannelTimestampsNow}
            currUserProjects={currUserProjects}
            user={user}
            selectedViewTag={flexPanelQueryValue}
            handleFlexPanelToggle={this.handleFlexPanelToggle}
            flexPanelWidth={flexPanelWidth}
            flexPanelIsVisible={showFlexPanel}
            isSuperAdmin={isSuperAdmin}
            currentlyEditingAssetInfo={currentlyEditingAssetInfo}
            fpIconColumnWidthInPixels={fpIconColumnWidthInPixels}
            fpFlexPanelContentWidthInPixels={fpFlexPanelContentWidthInPixels}
          />
        )}

        <div style={mainPanelOuterDivSty} id="mgb-jr-main-container">
          <SupportedBrowsersContainer />
          {!isGuest && !isHocRoute && <VerifyBanner currUser={currUser} />}
          {announcement && <AnnouncementBanner text={announcement} />}
          {!hideHeaders && (
            <NavPanel
              currUser={currUser}
              navPanelAvailableWidth={mainAreaAvailableWidth}
              activity={this.props.activity}
              hazUnreadActivities={hazUnreadActivities}
            />
          )}
          {!isGuest &&
          !isHocRoute && (
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

          {/*
            Just render the route unless we're editing a project asset
            Project assets need to wrap the asset edit route in the project tabs UI layout
          */}
          {routeComponent}
        </div>
        <NetworkStatusMsg meteorStatus={meteorStatus} />
        <NotificationContainer />
      </div>
    )
  }
}

export default _.flow(
  withMeteorData(({ params, location }) => {
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
    let handleActivity = null
    if (currUser) {
      handleActivity = Meteor.subscribe(
        'activity.private.feed.recent.userId',
        currUser._id,
        currUser.profile.name,
        SpecialGlobals.activity.feedLimit,
      )
    }

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
      currUser: currUser ? currUser : null, // Avoid 'undefined'. It's null, or it's defined. Currently Logged in user.
      // Putting it here makes it reactive

      currUserProjects: !handleForProjects
        ? []
        : Projects.find(projectSelector, { sort: defaultProjectSorter }).fetch(),
      user: pathUserName
        ? Users.findOne({ 'profile.name': pathUserName })
        : pathUserId ? Users.findOne(pathUserId) : null, // User on the url /user/xxx/...
      activity: currUser
        ? Activity.find(getFeedSelector(currUser._id, currUser.profile.name), {
            sort: { timestamp: -1 },
          }).fetch()
        : [],
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
  }),
  withStores({
    joyride: joyrideStore,
  }),
  responsiveComponent({
    portraitPhoneUI: {
      maxWidth: 420,
      data: {
        footerTabMajorNav: true, // |__| flexPanel as footer
        fpReservedFooterHeight: '60px',
        fpReservedRightSidebarWidth: '0px',
      },
    },
    desktopUI: {
      minWidth: 421,
      data: {
        footerTabMajorNav: false, //  flexPanel as right sidebar =|
        fpReservedFooterHeight: '0px',
        fpReservedRightSidebarWidth: `${fpIconColumnWidthInPixels}px`,
      },
    },
  }),
)(AppUI)
