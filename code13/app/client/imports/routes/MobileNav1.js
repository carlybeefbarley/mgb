import React from 'react'
import {Grid, Sidebar, Segment, Button, Menu, Image, Icon, Header} from 'semantic-ui-react'

import SwipeableViews from 'react-swipeable-views'
import elementResizeDetectorMaker from 'element-resize-detector'

import fpAssets from '../components/SidePanels/fpAssets'
import BrowseGamesRoute from './BrowseGamesRoute'

import fpChat from '../components/SidePanels/fpChat'


import './MobileNav.css'

import NavBar from '/client/imports/components/Nav/NavBar'

import {utilReplaceTo} from '/client/imports/routes/QLink.js'


const BlankPage = (p) => {
  return <div>{p.title}</div>
}
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
          onClick={() => p.mobileNav.onClick(b, index)}
        >
          <Icon name={b.icon || 'question'} size='large'></Icon>
          <p>{b.title}</p>
        </a>
      })}
  </div>
}

const HomeWrap = (p) => (
  <div>
    <NavBar {...p} currentlyEditingAssetInfo={p.state.currentlyEditingAssetInfo}/>
    <div>{React.cloneElement(p.children, p)}</div>
  </div>
)

const doLogout = () => {
  Meteor.logout()
  window.location = '/'
}

class MobileNav extends React.Component {

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
    this.state = {
      index: 0
    }
    this.cache = {}

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

  shouldComponentUpdate(nextProps, nextState){
    if(this.cache.pathname != nextProps.location.pathname){
      this.cache.pathname = nextProps.location.pathname
      this._tmpView = null
    }
    return true
  }

  /*componentDidUpdate() {
   console.log("PROPS:", this.props.location.pathname, this.props)
   }*/


  onClick(button, index) {
    const max = this.getMaxItems()
    if (index > max) {
      console.log('more than max:', button)
      button.action && button.action()
      return
    }
    this.handleChangeIndex(index)
  }

  handleChangeIndex(index) {
    this.setState({index})

    $(".mobile-nav-button.active", this.refs.mobileNav).removeClass("active")
    $("#mobile-nav-button-" + index, this.refs.mobileNav).addClass("active")
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
    if (this._tmpView)
      return this._tmpView

    const max = this.getMaxItems()
    this._tmpView = this.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName] && index < max)
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        const props = b.getProps ? b.getProps(this) : {}

        return <div key={index}>
          <b.Component  title={bName} isMobile={true} {...this.props} {...props} />
        </div>
      })

    return this._tmpView
  }

  renderButton(bName, index) {
    const b = MobileNav.availableButtons[bName]
    return <a
      className={'mobile-nav-button item' + (index === this.state.index ? ' active' : '')}
      name={bName}
      key={index}
      id={"mobile-nav-button-" + index}
      onClick={() => this.onClick(b, index)}
    >
      <Icon name={b.icon || 'question'} size='large'></Icon>
      <p>{b.title}</p>
    </a>
  }


  static availableButtons = {
    home: {
      title: 'Home',
      Component: HomeWrap, ///HomeWrap,
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
    profile: {
      title: "Profile",
      Component: Checkboxes,
      icon: 'user'
    },
    news: {
      title: "What's new",
      Component: BlankPage,
      icon: 'bullhorn'
    },
    learn: {
      title: 'Learn',
      icon: 'graduation',
      Component: BlankPage
    },
    users: {
      title: 'Users',
      icon: 'users',
      Component: BlankPage
    },
    projects: {
      title: 'Projects',
      icon: 'sitemap',
      Component: BlankPage
    },
    dailies: {
      title: 'Dailies',
      icon: 'exclamation',
      Component: BlankPage
    },
    jams: {
      title: 'Jams',
      icon: 'winner',
      Component: BlankPage
    },
    alerts: {
      title: 'Alerts',
      icon: 'bell outline',
      Component: BlankPage
    },
    feedback: {
      title: 'Feedback',
      icon: 'mail outline',
      Component: BlankPage
    },
    help: {
      title: 'Help',
      icon: 'question',
      Component: BlankPage
    },
    settings: {
      title: 'Settings',
      icon: 'setting',
      Component: BlankPage
    },
    logout: {
      title: 'Log Out',
      icon: 'log out',
      action: doLogout
    },
    more: {
      title: 'More',
      icon: 'horizontal ellipsis',
      Component: AllButtons,
      getProps: (mobileNav) => {
        return {buttons: mobileNav.buttons, mobileNav: mobileNav, from: 5, to: Infinity}
      }
    },
  }
}

export default MobileNav
