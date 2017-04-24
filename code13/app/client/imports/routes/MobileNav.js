import React from 'react'
import {Grid, Sidebar, Segment, Button, Menu, Image, Icon, Header} from 'semantic-ui-react'

import SwipeableViews from 'react-swipeable-views'
import _ from 'lodash'

///home/stauzs/Projects/mgb/code13/app/client/imports/routes/MobileNav.js
import fpMobileMore from '../components/SidePanels/fpMobileMore.js'

import elementResizeDetectorMaker from 'element-resize-detector'

import Home from './Home'
import fpAssets from '../components/SidePanels/fpAssets'
import BrowseGamesRoute from './BrowseGamesRoute'

import './MobileNav.css'

import NavBar from '/client/imports/components/Nav/NavBar'

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
  return <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}} className="mobile-nav-all-buttons">
    {p.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName] && index > p.from && index < p.to)
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        return <a
          className="mobile-nav-item item"
          name={bName}
          key={index}
          onClick={() => p.mobileNav.onClick(b, index)}
        >
          <Icon name={b.icon || 'question'} size='huge'></Icon>
          <p>{b.title}</p>
        </a>
      })}
  </div>
}

const HomeWrap = (p) => (
  <div>
    <NavBar {...p} currentlyEditingAssetInfo={p.state.currentlyEditingAssetInfo}/>
    <div style={{height: '100%'}}>{React.cloneElement(p.children, p)}</div>
  </div>
)

class MobileNav extends React.PureComponent {

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
  }

  componentWillUnmount() {
    this.erd.removeListener(document.body, this.onresize)
  }

  /*componentDidUpdate() {
    console.log("PROPS:", this.props.location.pathname, this.props)
  }*/


  static availableButtons = {
    home: {
      title: 'Home',
      Component: BlankPage, ///HomeWrap,
      icon: 'home'
    },
    assets: {
      title: "Assets",
      Component: fpAssets, //BlankPage,
      getProps: (mobileNav) => ({
        allowDrag: false
      }),
      icon: 'play'
    },
    play: {
      title: "Play",
      Component: BrowseGamesRoute,
      icon: 'game'
    },
    chat: {
      title: "Chat",
      Component: BlankPage,
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
    projects:                                                                                                                                                   {
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
      Component: BlankPage
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


  onClick(button, index) {
    this.handleChangeIndex(index)
  }

  handleChangeIndex(index) {
    // this.setState({index, showMore: false})

    $(".mobile-nav-button.active", this.refs.mobileNav).removeClass("active")
    $("#mobile-nav-button-" + index, this.refs.mobileNav).addClass("active")
  }


  shouldComponentUpdate(nextProps, nextState){
    if(this.cache.location != nextProps.location.pathname){
      this.cache.location = nextProps.location.pathname
      this._tmpView = null
    }
    return true
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

        <SwipeableViews index={this.state.index}
                        onChangeIndex={this.handleChangeIndex.bind(this)}>
          {
            this.renderView()
          }
        </SwipeableViews>

        {this.renderButtons()}
      </div>
    )
  }

  renderButtons(){

    /*if(this._tmpButtons)
      return this._tmpButtons
    */

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

  renderView(){
    const max = this.getMaxItems()
    this._tmpView = this.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName] && index < max)
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        const props = b.getProps ? b.getProps(this) : {}

        return <div style="height: 100%" key={index}>
          <b.Component key={index} title={bName} {...this.props} {...props} />
        </div>
      })

    return this._tmpView
  }

  renderButton(bName, index) {
    const b = MobileNav.availableButtons[bName]
    return <a
      className={'mobile-nav-button item' + (index === this.state.index ? ' active' : '')}
      style={{padding: '5px'}}
      name={bName}
      key={index}
      id={"mobile-nav-button-"+index}
      onClick={() => this.onClick(b, index)}
    >
      <Icon name={b.icon || 'question'} size='huge'></Icon>
      <p>{b.title}</p>
    </a>
  }
}

export default MobileNav
