import React from 'react'
import { Grid, Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'

import SwipeableViews from 'react-swipeable-views'
import _ from 'lodash'

///home/stauzs/Projects/mgb/code13/app/client/imports/routes/MobileNav.js
import fpMobileMore from '../components/SidePanels/fpMobileMore.js'

import elementResizeDetectorMaker from 'element-resize-detector'

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

class MobileNav extends React.Component {

  constructor() {
    super()
    this.buttons = [
      'home',
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

  componentWillUnmount(){
    this.erd.removeListener(document.body, this.onresize)
  }

  static availableButtons = {
    home: {
      title: 'Home',
      Component: BlankPage,
      icon: 'home'
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
    backgroundColor: 'white'
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
  allButtons() {
    return <div style={{
      backgroundColor: 'rgb(255, 255, 255)',
      display: 'flex',
      justifyContent: 'space-around',
      textAlign: 'center',
      height: '100%',
      flexWrap: 'wrap',
      overflow: 'auto',
      alignContent: 'space-around',
      paddingBottom: '50px'
    }}>
      {this.buttons
        .filter((bName, index) => !!MobileNav.availableButtons[bName])
        .map((bName, index) => {
          const b = MobileNav.availableButtons[bName]
          return <a
            className="item"
            style={Object.assign({ padding: '5%' }, MobileNav.btnStyle)}
            name={bName}
            key={index}
            onClick={() => this.onClick(b, index)}
          >
            <Icon name={b.icon || 'question'} size='large'></Icon>
            <p>{b.title}</p>
          </a>
        })}
    </div>
  }

  getMaxItems() {
    console.log("MAX items:", window.innerWidth / 80)
    return Math.floor(window.innerWidth / 80) - 1
  }

  render() {
    return (
      <div style={MobileNav.mainStyle}>
        {!this.state.showMore && 
        <SwipeableViews index={this.state.index} style={MobileNav.viewStyle} onChangeIndex={this.handleChangeIndex.bind(this)}>
          {
            this.buttons
              .filter(bName => !!MobileNav.availableButtons[bName])
              .map((bName, index) => {
                const b = MobileNav.availableButtons[bName]
                return <div key={index}>
                  <b.Component key={index} title={bName} />
                </div>
              })

          }
        </SwipeableViews>
        }
        {this.state.showMore && this.allButtons()}
        {/*{this.state.showMore && fpMobileMore()}*/}

        <div style={MobileNav.style} className="MobileNav">
          {
            this.buttons
              .filter((bName, index) => !!MobileNav.availableButtons[bName] && index < this.getMaxItems())
              .map((bName, index) => {
                const b = MobileNav.availableButtons[bName]
                return <a
                  className={'item' + (index === this.state.index ? ' active' : '')}
                  style={Object.assign({color: (index === this.state.index && !this.state.showMore) ? 'yellow' : 'initial'}, MobileNav.btnStyle)}
                  name={bName}
                  key={index}
                  onClick={() => this.onClick(b, index)}
                >
                  <Icon name={b.icon || 'question'} size='large'></Icon>
                  <p>{b.title}</p>
                </a>
              })
          }

          {this.buttons.length > this.getMaxItems() &&
            <a
              className="item"
              style={Object.assign({color: this.state.showMore ? 'yellow' : 'initial'}, MobileNav.btnStyle, { borderRight: 'none' })}
              onClick={() => this.showMore()}
            >
              <Icon name='ellipsis horizontal' size='large'></Icon>
              <p>More</p>
            </a>


          }
        </div>
      </div>
    )
  }
}
export default MobileNav