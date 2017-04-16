import React from 'react'
import { Grid, Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'

import SwipeableViews from 'react-swipeable-views'
import _ from 'lodash'

///home/stauzs/Projects/mgb/code13/app/client/imports/routes/MobileNav.js
import fpMobileMore from '../components/SidePanels/fpMobileMore.js'

import elementResizeDetectorMaker from 'element-resize-detector'

import Home from './Home'
import fpAssets from '../components/SidePanels/fpAssets'
import BrowseGamesRoute from './BrowseGamesRoute'

import './MobileNav.css'



const BlankPage = (p) => {
  return <div>{p.title}</div>
}
const Checkboxes = (p) => {
  return <div>{p.title}:
    <input type="checkbox" />
    <input type="checkbox" />
    <input type="checkbox" />
    <input type="checkbox" />
    <input type="checkbox" />


  </div>
}

const AllButtons = (p) => {
  return <div className="mobile-nav-all-buttons">
    {p.buttons
      .filter((bName, index) => !!MobileNav.availableButtons[bName])
      .map((bName, index) => {
        const b = MobileNav.availableButtons[bName]
        return <a
          className="item"
          style={Object.assign({ padding: '5%' }, MobileNav.btnStyle)}
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

  static availableButtons = {
    home: {
      title: 'Home',
      Component: Home,
      icon: 'home'
    },
    assets: {
      title: "Assets",
      Component: fpAssets,
      getProps: (mobileNav) => {

      },
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
      Component: BlankPage
    },
    more: {
      title: 'More',
      icon: 'horizontal ellipsis',
      Component: AllButtons,
      getProps: (mobileNav) => {
        return {buttons: mobileNav.buttons, mobileNav: mobileNav}
      }
    },
  }

  static style = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    display: 'flex',
    right: 0,
    justifyContent: 'space-around',
    backgroundColor: 'white'
  }
  static btnStyle = {
    display: 'inline-block',
    textAlign: 'center'
    // borderLeft: 'solid 1px rgba(0,0,0,0.1)',
    // borderRight: 'solid 1px rgba(0,0,0,0.1)',
  }

  static viewStyle = {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'white',
    overflow: 'hidden',
    paddingBottom: '40px'
  }

  static mainStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
  onClick(button, index) {
    this.handleChangeIndex(index)
  }
  handleChangeIndex(index) {
    this.setState({ index, showMore: false })
  }
  showMore() {
    this.setState({ showMore: !this.state.showMore })
  }

  getMaxItems() {
    return 5
    // or return 4 always ?
    console.log("MAX items:", window.innerWidth / 70)
    return Math.floor(window.innerWidth / 70) - 1
  }



  render() {
    const max = this.getMaxItems()
    return (
      <div style={MobileNav.mainStyle} key="mobileNav">
        {!this.state.showMore &&
          <SwipeableViews index={this.state.index} style={MobileNav.viewStyle} onChangeIndex={this.handleChangeIndex.bind(this)}>
            {
              this.buttons
                .filter(bName => !!MobileNav.availableButtons[bName])
                .map((bName, index) => {
                  const b = MobileNav.availableButtons[bName]
                  const props = b.getProps ? b.getProps(this) : {}

                  return <div key={index}>
                    <b.Component key={index} title={bName} {...props} />
                  </div>
                })
            }
            {/*{this.buttons.length > max && <AllButtons buttons={this.buttons} onClick={this.onClick} />}*/}
          </SwipeableViews>
        }

        {/*{this.state.showMore && fpMobileMore()}*/}

        <div style={MobileNav.style} className="MobileNav">
          {
            this.buttons
              .filter((bName, index) => !!MobileNav.availableButtons[bName] && index < max)
              .map(this.renderButton, this)
          }

          {/*{this.buttons.length > max &&
            this.renderButton('more', max)
          }*/}
        </div>
      </div>
    )
  }

  renderButton(bName, index) {
    const b = MobileNav.availableButtons[bName]
    return <a
      className={'item' + (index === this.state.index ? ' active' : '')}
      style={Object.assign({ color: (index === this.state.index && !this.state.showMore) ? 'yellow' : 'initial' }, MobileNav.btnStyle)}
      name={bName}
      key={index}
      onClick={() => this.onClick(b, index)}
    >
      <Icon name={b.icon || 'question'} size='large'></Icon>
      <p>{b.title}</p>
    </a>
  }
}

export default MobileNav