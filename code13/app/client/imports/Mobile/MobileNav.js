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

const BlankPage = (p) => {
  return <div>{p.title}</div>
}

// this is used to test if checkboxes remains checked...
const Checkboxes = (p) => {
  return <div>{p.title}:
    <input type="checkbox"/>
    <input type="checkbox"/>
    <input type="checkbox"/>
    <input type="checkbox"/>
    <input type="checkbox"/>
  </div>
}

const AllButtons = (p) => {
  return <div className="mobile-nav-all-buttons">
    {p.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName] && index >= p.from && index < p.to)
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        return <a
          className="mobile-nav-item item"
          style={{padding: '5%'}}
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

// make use of this
let cache = {}

class MobileNav extends React.Component {
  static contextTypes = {
    router:  React.PropTypes.object
  }

  constructor() {
    super()
    this.buttons = [
      'home',
      'assets',
      'play',
      'chat',
      'more',

      'profile',
      'news',
      'learn',
      'users',
      'projects',
      'dailies',
      'jams',
      'alerts',
      'feedback',
      'help',
      'settings',
      'logout',
    ]
    this.state = cache.state || {
      index: 0,
      location: {}
    }
  }


  setState(newState, callback = null){
    super.setState(newState, () => {
      cache.state = this.state
      callback && callback()
    })
  }

  setLocation(location){
    this.state.location[this.state.index] = location

    // clear view - as we will need to re-render it completely
    this._tmpView = null
    this.setState({location: this.state.location, time: Date.now()})
    this.context.router.push(location)
  }

  componentDidMount() {
    this.erd = elementResizeDetectorMaker({
      strategy: "scroll" //<- For ultra performance.
    })
    this.onresize = () => {
      // console.log("Forced update!")
      this.forceUpdate()
    }
    this.erd.listenTo(document.body, this.onresize)
    window.swp = this.refs.swipeable
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
    // or return 4 always ?
    console.log("MAX items:", window.innerWidth / 70)
    return Math.floor(window.innerWidth / 70) - 1
  }

  render() {

    return (
      <div className='mobile-nav-main' ref="mobileNav">

        <SwipeableViews
          index={this.state.index}
          onChangeIndex={this.handleChangeIndex.bind(this)}
          ref="swipeable"
          animateTransitions={false}
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
    // without cache performance is very bad...

    if (this._tmpView)
      return this._tmpView

    const max = this.getMaxItems()
    this._tmpView = this.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName] && index < max)
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        const props = b.getProps ? b.getProps(this) : {}
        return (
          <div key={index}>
            {/*{bName} + {this.state.index}*/}
            {this.state.index === index && this.state.location[index] &&
              <RouterWrap {...this.props} onClose={() => {
                this.state.location[index] = null
              }} location={this.state.location[index]} key={Date.now() + index * 10000} />
            }
            <b.Component title={bName} isMobile={true} {...this.props} {...props} />
          </div>
        )
      })

    return this._tmpView
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
      <Icon name={b.icon || 'question'} size='large'></Icon>
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
          console.log(newSubNavParamStr, mobileNav.props)
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
        // TODO: handle guest
        mobnav.setLocation(`/u/${Meteor.user().username}`)
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
    learn: {
      title: 'Learn',
      action: (mobnav) => {
        mobnav.setLocation(`/learn`)
      },
      icon: 'graduation'
    },
    users: {
      title: 'Users',
      icon: 'users',
      action: (mobnav) => {
        mobnav.setLocation(`/users`)
      },
    },
    projects: {
      title: 'Projects',
      icon: 'sitemap',
      action: (mobnav) => {
        mobnav.setLocation(`/u/${Meteor.user().username}/projects`)
      },
    },
    dailies: {
      title: 'Dailies',
      icon: 'exclamation',
      action: (mobnav) => {
        alert('Dailies not implemented...')
        mobnav.setLocation(`/dailies`)
      },
    },
    jams: {
      title: 'Jams',
      icon: 'winner',
      action: (mobnav) => {
        alert('Jams are not implemented...')
        mobnav.setLocation(`/jams`)
      },
    },
    alerts: {
      title: 'Alerts',
      icon: 'bell outline',
      action: (mobnav) => {
        alert('Alerts are not implemented...')
        mobnav.setLocation(`/alerts`)
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
