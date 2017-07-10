import React from 'react'
import {Grid, Sidebar, Segment, Button, Menu, Image, Icon, Header} from 'semantic-ui-react'

import SwipeableViews from 'react-swipeable-views'
import elementResizeDetectorMaker from 'element-resize-detector'

import fpAssets from '../components/SidePanels/fpAssets'

import HomeRoute from '../routes/Home'
import BrowseGamesRoute from '../routes/BrowseGamesRoute'

import fpChat from '../components/SidePanels/fpChat'

import RouterWrap from './RouterWrap'

import NavBar from '/client/imports/components/Nav/NavBar'

import {utilReplaceTo, utilPushTo} from '/client/imports/routes/QLink.js'

import './MobileNav.css'
import SpecialGlobals from '/imports/SpecialGlobals'

class SwipeableViews2 extends React.Component {

  constructor(...a){
    super(...a)
    this.isScrolling = true
    this.lastScroll = 0
  }

  componentDidMount(){
    const el = this.refs.mainContainer
    el.addEventListener('scroll', this.onScroll, {
      useCapture: true,
      passive: false
    })

    /*

     onTouchEnd={this.onInputEnd}
     onMouseUp={this.onInputEnd}

     onTouchStart={this.onInputDown}
     onMouseDown={this.onInputDown}
     */

    el.addEventListener('touchstart', this.onInputDown, {
      useCapture: true,
      passive: false
    })

    el.addEventListener('mousedown', this.onInputDown, {
      useCapture: true,
      passive: false
    })
    el.addEventListener('touchend', this.onInputEnd, {
      useCapture: true,
      passive: false
    })
    el.addEventListener('mouseup', this.onInputEnd, {
      useCapture: true,
      passive: false
    })

    if(this.props.index !== void(0)) {

      const screenWidth = el.parentElement.offsetWidth
      this.refs.mainContainer.scrollLeft = this.props.index * screenWidth
    }
  }

  componentWillUnmount(){
    const el = this.refs.mainContainer
    el.removeEventListener('scroll', this.onScroll)
    el.removeEventListener('touchstart', this.onInputDown)
    el.removeEventListener('mousedown', this.onInputDown)
    el.removeEventListener('touchend', this.onInputEnd)
    el.removeEventListener('mouseup', this.onInputEnd)
  }

  componentDidUpdate(){
    if(this.props.index !== void(0)) {
      const el = this.refs.mainContainer
      const screenWidth = el.parentElement.offsetWidth
      this.refs.mainContainer.scrollLeft = this.props.index * screenWidth
    }
  }

  onScroll = (e) => {
    //console.log("scrolling...")
    //e.preventDefault()
    if(!this.inputDown){
      this.refs.mainContainer.scrollLeft = this.lastScroll
      e.preventDefault()
      return
    }


    this.isScrolling = true
    this.scrollTimeout && window.clearTimeout(this.scrollTimeout)

    this.scrollTimeout = window.setTimeout(() => {
      this.isScrolling = false
      /*if(!this.inputDown) {
        this.onInputEnd()
      }*/
    }, 10)
  }

  onInputDown = (e) => {
    //e.preventDefault()
    this.inputDown = true
  }

  onInputEnd = (e) => {
    e.preventDefault()
    this.inputDown = false
    const el = this.refs.mainContainer
    this.lastScroll = el.scrollLeft
    if(this.isScrolling) {

      el.scrollLeft = el.scrollLeft + 1
      return
    }



    const screenWidth = el.parentElement.offsetWidth

    const rel = el.scrollLeft % screenWidth
    const newScroll = (el.scrollLeft - rel) + (rel > screenWidth *0.5 ? screenWidth : 0)
    const tab = Math.floor(newScroll / screenWidth)
    el.scrollLeft = newScroll

    setTimeout(() => {
      this.props.onChangeIndex && this.props.onChangeIndex(tab)
    }, 0)
  }

  render() {
    return (<div
      className='swipeable'
      ref='mainContainer'


      // onScrollCapture={this.onScroll}
    >{this.props.children}</div>)
  }
}

const AllButtons = (p) => {
  return <div className="mobile-nav-all-buttons">
    {p.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName] && index >= p.from && index < p.to)
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        return <a
          className="mobile-nav-item item"
          name={bName}
          key={index}
          onClick={() => p.mobileNav.onClickMoreContent(b, index)}
        >
          <Icon name={b.icon || 'question'} size='large'></Icon>
          <p>{b.title}</p>
        </a>
      })}
  </div>
}

const doLogout = () => {
  Meteor.logout()
  window.location = '/'
}

const NotReady = () => (
  <div>
    <h1>Work in progress,</h1>
    <h2>come back later</h2>
  </div>
)



// make use of this
let cache = {}
/*
* Profile
* What's New
* Roadmap
*
* Users
* Feed
* Dailies
*
* Badges
* Projects
* Competitions
*
* Send Feedback
* Notifications
* Learn
*
* Help
* Settings
* Log Out
*
* */

class MobileNav extends React.Component {
  static contextTypes = {
    router:  React.PropTypes.object
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
      maxItems: {}
    }

    this.cache = {
      views: [],
      prevLocation: []
    }
    this.tabs = {}

    this.handleChangeIndex = this.handleChangeIndex.bind(this)
  }

  setState(newState, callback = null){
    super.setState(newState, () => {
      cache.state = this.state
      callback && callback()
    })
  }

  componentDidMount() {
    this.erd = elementResizeDetectorMaker({
      strategy: "scroll" //<- For ultra performance.
    })
    this.onresize = () => {
      this.forceUpdate()
    }
    this.erd.listenTo(document.body, this.onresize)
  }

  componentWillUnmount() {
    this.erd.removeListener(document.body, this.onresize)
  }

  // todo...
  shouldComponentUpdate(nextProps, nextState){
    return true
  }

  /*componentDidUpdate() {
   console.log("PROPS:", this.props.location.pathname, this.props)
   }*/

  setLocation(location, tab){
    if(tab !== -1) {
      if(tab)
        this.handleChangeIndex(tab)


      this.state.location[this.state.index] = location
    }

    this.setState({location: this.state.location, time: Date.now()})
    this.context.router.push(location)
  }

  onClick(button, index) {
    this.handleChangeIndex(index)
  }

  onClickMoreContent(button, index){
    button.action && button.action(this)
  }

  handleChangeIndex(index) {
    console.log("Setting state index to:", index)
    this.setState({index}, () => {
      // this is here because this is much faster than react re-rendering
      $(".mobile-nav-button.active", this.refs.mobileNav).removeClass("active")
      $("#mobile-nav-button-" + index, this.refs.mobileNav).addClass("active")

      const route = this.state.location[index] || '/'
      if(this.state.lastRoute !== route){
        this.context.router.push(route)
        this.state.lastRoute = (this.state.location[index] || '/')
      }
    })
  }

  getMaxItems() {
    return 5
  }

  render() {
    return (
      <div className='mobile-nav-main' ref="mobileNav">

        <SwipeableViews
          index={this.state.index}
          ref="swipeable"
          animateTransitions={false}
          style={{zIndex: 9}}

          onChangeIndex={this.handleChangeIndex}
        >
          {
            this.renderView()
          }
        </SwipeableViews>

        {this.renderButtons()}
      </div>
    )
  }

  renderButtons() {

    if (this._tmpButtons)
      return this._tmpButtons


    const max = this.getMaxItems()
    this._tmpButtons = <div className="mobile-nav">
      {
        this.buttons
          .filter((bName, index) => !!MobileNav.availableButtons[bName] && index < max)
          .map(this.renderButton, this)
      }

    </div>
    return this._tmpButtons
  }

  renderView() {
    const max = this.getMaxItems()
    for(let i=0; i<max; i++){
      if(i !== this.state.index && this.cache.views[i])
        continue

      const index = i
      const bName = this.buttons[index]
      let tabView = null

      if(!this.state.location[index]) {
        const b = MobileNav.availableButtons[bName]
        const props = b.getProps ? b.getProps(this) : null
        tabView = <b.Component title={bName} isMobile={true} {...this.props} {...props} />
      }

      this.cache.views[i] = (
        <div key={index}>
          {/*{bName} + {this.state.index}*/}
          {this.state.index === index && this.state.location[index] &&
            <RouterWrap {...this.props} onClose={() => {
              console.log("Closing router wrap..")
              this.state.location[index] = null
              // force Redraw
              this.context.router.push('/')
              this.setState({location: this.state.location})
          }} location={this.state.location[index]} key={index * 10000} />
          }
          { tabView }
        </div>
      )
    }
    return this.cache.views
  }

  renderButton(bName, index) {
    const b = MobileNav.availableButtons[bName]
    // a - leaves :hover on PC and that makes to appear as there would be
    // multiple active tabs
    return <span
      className={'mobile-nav-button item' + (index === this.state.index ? ' active' : '')}
      name={bName}
      key={index}
      id={"mobile-nav-button-" + index}
      onClick={() => this.onClick(b, index)}
    >
      <Icon name={b.icon || 'question'} size='large' />
      <p>{b.title}</p>
    </span>
  }


  static availableButtons = {
    home: {
      title: 'Home',
      Component: HomeRoute, ///HomeWrap,
      getProps: (mobileNav) => ({
        flexPanelWidth: '0'
      }),
      icon: 'home'
    },
    assets: {
      title: "Assets",
      Component: fpAssets, //BlankPage,
      getProps: (mobileNav) => ({
        allowDrag: false,
        panelWidth: '0'
      }),
      icon: 'search'
    },
    play: {
      title: "Play",
      Component: BrowseGamesRoute,

      icon: 'game'
    },
    chat: {
      title: "Chat",
      Component: fpChat, // BlankPage,
      getProps: (mobileNav) => ({
        panelWidth: '0',
        // TODO: save and restore
        subNavParam: '',
        handleChangeSubNavParam: function (newSubNavParamStr) {
          localStorage.setItem("chat:subNavParam", newSubNavParamStr)
          mobileNav.forceUpdate()
        }
      }),
      icon: 'chat'
    },
    more: {
      title: 'More',
      icon: 'horizontal ellipsis',
      Component: AllButtons,
      getProps: (mobileNav) => {
        return {buttons: mobileNav.buttons, mobileNav: mobileNav, from: 5, to: Infinity}
      }
    },

    // TODO: use some sort of map / names for routes instead of hardcoded strings?
    profile: {
      title: "Profile",
      action: (mobnav) => {
        if(Meteor.user())
          mobnav.setLocation(`/u/${Meteor.user().username}`)
        else
          mobnav.setLocation(`/login`)
      },
      icon: 'user'
    },
    news: {
      title: "What's new",
      action: (mobnav) => {
        mobnav.setLocation(`/whatsnew`)
      },
      icon: 'bullhorn'
    },
    roadmap: {
      title: "Roadmap",
      action: (mobnav) => {
        mobnav.setLocation(`/roadmap`)
      },
      icon: 'map'
    },

    users: {
      title: 'Users',
      icon: 'users',
      action: (mobnav) => {
        mobnav.setLocation(`/users`)
      },
    },
    feed: {
      title: "Feed",
      action: (mobnav) => {
        alert('Feed is not implemented!')
      },
      icon: 'feed'
    },
    dailies: {
      title: 'Dailies',
      icon: 'exclamation',
      action: (mobnav) => {
        alert('Dailies not implemented...')
        mobnav.setLocation(`/dailies`)
      },
    },

    badges: {
      title: 'Badges',
      icon: 'star',
      action: (mobnav) => {
        if(Meteor.user())
          mobnav.setLocation(`/u/${Meteor.user().username}/badges`)
        else
          mobnav.setLocation(`/login`)
      },
    },
    projects: {
      title: 'Projects',
      icon: 'sitemap',
      action: (mobnav) => {
        mobnav.setLocation(`/u/${Meteor.user().username}/projects`)
      },
    },
    competitions: {
      title: 'Competitions',
      icon: 'winner',
      action: (mobnav) => {
        alert('Competitions are not implemented...')
        mobnav.setLocation(`/competitions`)
      },
    },

    feedback: {
      title: 'Feedback',
      icon: 'mail outline',
      action: (mobnav) => {
        alert('Feedback is not implemented...')
        mobnav.setLocation(`/feedback`)
      },
    },
    notifications: {
      title: 'Notifications',
      icon: 'bell outline',
      action: (mobnav) => {
        alert('Notifications are not implemented...')
        mobnav.setLocation(`/notifications`)
      },
    },
    learn: {
      title: 'Learn',
      action: (mobnav) => {
        mobnav.setLocation(`/learn`)
      },
      icon: 'graduation'
    },

    help: {
      title: 'Help',
      icon: 'question',
      action: (mobnav) => {
        alert('TODO: open chat tab -> help channel')
      },
    },
    settings: {
      title: 'Settings',
      icon: 'setting',
      action: (mobnav) => {
        alert('TODO: load settings')
      },
    },
    logout: {
      title: 'Log Out',
      icon: 'log out',
      action: doLogout
    }
  }
}

export default MobileNav
