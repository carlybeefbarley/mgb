/*
 README:
 this module wraps up navigation for mobile version.
 it is responsible for tab and bottom button rendering

 Tabs are made as independent components which loads desired component
 (e.g. HOC wrapper around real component)

 All links should be handled by QLink (otherwise they simply won't work)
 links will open RouterWrap component - which loads url in the popup
 if tab param is given to the QLink component
 then it will load that link in the tab specified instead of routerWrap
 (see TAB at the bottom of this file for available tabs)


 */

import React from 'react'
import { Grid, Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'

import SwipeableViews from 'react-swipeable-views'
import elementResizeDetectorMaker from 'element-resize-detector'

import fpAssets from '../components/SidePanels/fpAssets'

import HomeRoute from '../routes/Home'
import BrowseGamesRoute from '../routes/BrowseGamesRoute'

import fpChat from '../components/SidePanels/fpChat'

import RouterWrap from './RouterWrap'

import { utilReplaceTo, utilPushTo } from '/client/imports/routes/QLink'

import { Link, browserHistory } from 'react-router'

import './MobileNav.css'

const NUMBER_OF_BUTTONS_IN_THE_BOTTOM_NAVIGATION = 5

const AllButtons = p =>
  <div className="mobile-nav-all-buttons">
    {p.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName] && index >= p.from && index < p.to)
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        return (
          <a
            className="mobile-nav-item item"
            name={bName}
            key={index}
            onClick={() => p.mobileNav.onClickMoreContent(b, index)}
            style={{ color: b.disabled ? 'grey' : '' }}
          >
            <Icon name={b.icon || 'question'} size="large" />
            <p>
              {b.title}
            </p>
          </a>
        )
      })}
  </div>

const doLogout = () => {
  Meteor.logout()
  window.setTimeout(() => {
    window.location = '/'
  }, 100)
}

const NotReady = () =>
  <div style={{ textAlign: 'center' }}>
    <h1>Work in progress,</h1>
    <h2>come back later</h2>
  </div>

// make use of this
let cache = {}
class MobileNav extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object,
  }

  constructor() {
    super()
    this.buttons = [
      'home',
      'play',
      'chat',
      'assets',
      'more',

      'profile',
      'news',
      'roadmap',

      'users',
      'feed',
      'dailies',

      'badges',
      'projects',
      'competitions', // jams?

      'feedback',
      'notifications',
      'learn',

      'help',
      'settings',
      'logout',
    ]
    this.state = cache.state || {
      index: 0,
      location: {},
      maxItems: {},
    }

    this.cache = cache.cache || {
      views: [],
      location: [],
    }
    this.tabs = {}

    this.handleChangeIndex = this.handleChangeIndex.bind(this)
  }

  setState(newState, callback = null) {
    super.setState(newState, () => {
      cache.state = this.state
      callback && callback()
    })
  }

  componentDidMount() {
    this.erd = elementResizeDetectorMaker({
      strategy: 'scroll', //<- For ultra performance.
    })
    this.onresize = () => {
      this.forceUpdate()
    }
    this.erd.listenTo(document.body, this.onresize)
  }

  componentWillUnmount() {
    this.erd.removeListener(document.body, this.onresize)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  /*componentDidUpdate() {
   console.log("PROPS:", this.props.location.pathname, this.props)
   }*/

  setLocation(location, tab) {
    console.log('setLocation Location:', location)
    const stateLocation = this.state.location

    if (tab !== -1) {
      if (tab) {
        this.handleChangeIndex(tab, this.state.index, location)
        return
      }
      const index = tab && tab !== -1 ? tab : this.state.index
      stateLocation[index] = location
    }

    this.setState({ location: stateLocation, time: Date.now() })

    if (typeof location === 'string') this.context.router.push(location)
    else browserHistory.push(location)
  }

  onClick(button, index) {
    this.handleChangeIndex(index, this.state.index)
  }

  onClickMoreContent(button, index) {
    button.action && button.action(this)
  }

  handleChangeIndex(index, currentIndex, location) {
    if (location) this.cache.location[index] = location

    this.setState({ index }, () => {
      // this is here because this is much faster than react re-rendering
      // seems that slow re-rendering is caused by meteor get data - not React itself
      $('.mobile-nav-button.active', this.refs.mobileNav).removeClass('active')
      $('#mobile-nav-button-' + index, this.refs.mobileNav).addClass('active')

      const route = location || this.state.location[index] || this.cache.location[index] || '/'

      if (cache.lastRoute !== route) {
        this.context.router.push(route)
        cache.lastRoute = this.state.location[index] || '/'
      }
    })
  }

  getMaxItems() {
    return NUMBER_OF_BUTTONS_IN_THE_BOTTOM_NAVIGATION
  }

  render() {
    return (
      <div className="mobile-nav-main" ref="mobileNav">
        <SwipeableViews
          index={this.state.index}
          ref="swipeable"
          animateTransitions={false}
          style={{ zIndex: 9 }}
          onChangeIndex={this.handleChangeIndex}
        >
          {this.renderView()}
        </SwipeableViews>

        {this.renderButtons()}
      </div>
    )
  }

  renderButtons() {
    if (this._tmpButtons) return this._tmpButtons

    const max = this.getMaxItems()
    this._tmpButtons = (
      <div className="mobile-nav">
        {this.buttons
          .filter((bName, index) => !!MobileNav.availableButtons[bName] && index < max)
          .map(this.renderButton, this)}
      </div>
    )
    return this._tmpButtons
  }

  renderView() {
    const max = this.getMaxItems()
    for (let i = 0; i < max; i++) {
      if (i !== this.state.index && this.cache.views[i]) continue

      const index = i
      const bName = this.buttons[index]
      let tabView = null

      if (!this.state.location[index]) {
        const b = MobileNav.availableButtons[bName]
        const props = b.getProps ? b.getProps(this) : null
        tabView = <b.Component title={bName} isMobile {...this.props} {...props} />
      }
      console.log('Rendering tab no', index)
      this.cache.views[i] = (
        <div key={index}>
          {/*{bName} + {this.state.index}*/}
          {this.state.index === index &&
            this.state.location[index] &&
            <RouterWrap
              {...this.props}
              onClose={() => {
                console.log('Closing router wrap..')
                const stateLocation = this.state.location
                stateLocation[index] = null
                // force Redraw
                this.context.router.push('/')
                this.setState({ location: stateLocation })
              }}
              location={this.state.location[index]}
              key={index * 10000}
            />}
          {tabView}
        </div>
      )
    }

    cache.cache = this.cache
    return this.cache.views
  }

  renderButton(bName, index) {
    const b = MobileNav.availableButtons[bName]
    // a - leaves :hover on PC and that makes to appear as there would be
    // multiple active tabs
    return (
      <span
        className={'mobile-nav-button item' + (index === this.state.index ? ' active' : '')}
        name={bName}
        key={index}
        id={'mobile-nav-button-' + index}
        onClick={() => this.onClick(b, index)}
      >
        <Icon name={b.icon || 'question'} size="large" />
        <p>
          {b.title}
        </p>
      </span>
    )
  }

  static availableButtons = {
    home: {
      title: 'Home',
      Component: HomeRoute, ///HomeWrap,
      getProps: mobileNav => ({
        flexPanelWidth: '0',
      }),
      icon: 'home',
    },
    assets: {
      title: 'Assets',
      Component: fpAssets, //BlankPage,
      getProps: mobileNav => ({
        allowDrag: false,
        panelWidth: '0',
      }),
      icon: 'search',
    },
    play: {
      title: 'Play',
      Component: BrowseGamesRoute,

      icon: 'game',
    },
    chat: {
      data: {},
      title: 'Chat',
      Component: fpChat, // BlankPage,
      getProps: mobileNav => {
        // manually parse channel
        const subNav =
          mobileNav.props.location && mobileNav.props.location.query ? mobileNav.props.location.query._fp : ''
        const subNavParam = (subNav ? subNav.split('.') : []).length > 0 ? subNav.split('.').pop() : ''
        return {
          panelWidth: '0',
          // TODO: save and restore
          subNavParam: subNavParam || localStorage.getItem('chat:subNavParam') || 'A_NDe2wYSgj9piosiqG_',
          handleChangeSubNavParam: function(newSubNavParamStr) {
            localStorage.setItem('chat:subNavParam', newSubNavParamStr)
            utilPushTo(mobileNav.context.location, mobileNav.context.location, {
              _fp: 'chat.' + newSubNavParamStr,
            })
            mobileNav.forceUpdate()
          },
        }
      },
      icon: 'chat',
    },
    more: {
      title: 'More',
      icon: 'horizontal ellipsis',
      Component: AllButtons,
      getProps: mobileNav => {
        return { buttons: mobileNav.buttons, mobileNav: mobileNav, from: 5, to: Infinity }
      },
    },

    // TODO: use some sort of map / names for routes instead of hardcoded strings?
    profile: {
      title: 'Profile',
      action: mobnav => {
        if (Meteor.user()) mobnav.setLocation(`/u/${Meteor.user().username}`)
        else mobnav.setLocation(`/login`)
      },
      icon: 'user',
    },
    news: {
      title: "What's new",
      action: mobnav => {
        mobnav.setLocation(`/whatsnew`)
      },
      icon: 'bullhorn',
    },
    roadmap: {
      title: 'Roadmap',
      action: mobnav => {
        mobnav.setLocation(`/roadmap`)
      },
      icon: 'map',
    },

    users: {
      title: 'Users',
      icon: 'users',
      action: mobnav => {
        mobnav.setLocation(`/users`)
      },
    },
    feed: {
      title: 'Feed',
      action: mobnav => {
        mobnav.setLocation(`/mobile/feed`)
      },
      icon: 'feed',
      disabled: true,
    },
    dailies: {
      title: 'Dailies',
      icon: 'exclamation',
      action: mobnav => {
        mobnav.setLocation(`/mobile/dailies`)
      },
      disabled: true,
    },

    badges: {
      title: 'Badges',
      icon: 'star',
      action: mobnav => {
        if (Meteor.user()) mobnav.setLocation(`/u/${Meteor.user().username}/badges`)
        else mobnav.setLocation(`/login`)
      },
    },
    projects: {
      title: 'Projects',
      icon: 'sitemap',
      action: mobnav => {
        if (Meteor.user()) mobnav.setLocation(`/u/${Meteor.user().username}/projects`)
        else mobnav.setLocation(`/login`)
      },
    },
    competitions: {
      title: 'Competitions',
      icon: 'winner',
      action: mobnav => {
        mobnav.setLocation(`/mobile/competitions`)
      },
      disabled: true,
    },

    feedback: {
      title: 'Feedback',
      icon: 'mail outline',
      action: mobnav => {
        // alert('Feedback is not implemented...')
        mobnav.setLocation(`/mobile/feedback`)
      },
      disabled: true,
    },
    notifications: {
      title: 'Notifications',
      icon: 'bell outline',
      action: mobnav => {
        // alert('Notifications are not implemented...')
        mobnav.setLocation(`/mobile/notifications`)
      },
      disabled: true,
    },
    learn: {
      title: 'Learn',
      icon: 'graduation',
      action: mobnav => {
        mobnav.setLocation(`/learn`)
      },
    },

    help: {
      title: 'Help',
      icon: 'question',
      action: mobnav => {
        mobnav.handleChangeIndex(TAB.CHAT, 0, '?_fp=chat.G_MGBHELP_')
      },
    },
    settings: {
      title: 'Settings',
      icon: 'setting',
      action: mobnav => {
        mobnav.setLocation(`/mobile/settings`)
      },
    },
    logout: {
      title: 'Log Out',
      icon: 'log out',
      action: doLogout,
    },
  }
}

export default MobileNav
export const TAB = {
  HOME: 0,
  PLAY: 1,
  CHAT: 2,
  ASSETS: 3,
  MORE: 4,
}
