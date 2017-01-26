import _ from 'lodash'
import React, { PropTypes } from 'react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { getFeatureLevel } from '/imports/schemas/settings-client'
import { utilPushTo } from '/client/imports/routes/QLink'
import QLink from '/client/imports/routes/QLink'

import { Menu, Image, Dropdown, Button } from 'semantic-ui-react'
import NavPanelItem from './NavPanelItem'
// import urlMaker from '/client/imports/routes/urlMaker'
import WhatsNew from '/client/imports/components/Nav/WhatsNew'

import reactMixin from 'react-mixin'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'


export default NavPanel = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser: PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects: PropTypes.array,              // Projects list for currently logged in user
    navPanelWidth: PropTypes.number,                // Width of the whole page area
    fpReservedFooterHeight: PropTypes.string.isRequired,  // Something like 0px or 60px typically
    fpReservedRightSidebarWidth: PropTypes.string.isRequired   // Something like 0px or 60px typically
  },

  contextTypes: {
    urlLocation: React.PropTypes.object,
    settings: PropTypes.object                         // Used so some panels can be hidden by user
  },

  getMeteorData() {
    return { npFeatureLevel: getFeatureLevel(this.context.settings, makeLevelKey('NavPanel')) }
  },

  getNavPanels() {
    const { currUser }  = this.props
    const uname = currUser ? currUser.username : null

    return [
      {
        tag: 'home',
        name: 'home',
        icon: 'home',
        hdr: 'Home',
        to: '/',
        hideIfNoUser: false,
        menu: [
          {
            subcomponent: 'Item',
            to: '/whatsnew',
            content: (
              <div>
                What's New&emsp;
                <WhatsNew currUser={currUser} />
              </div>
            ),
          },
          {
            subcomponent: 'Item',
            to: '/roadmap',
            content: 'Roadmap',
          }
        ]
      },
      {
        tag: "learn",
        name: "learn",
        icon: "student",
        hdr: "Learn",
        to: '/learn',
        hideIfNoUser: false,
        menu: _.compact([
          {
            subcomponent: 'Item',
            to: '/learn/getStarted',
            icon: { color: 'yellow', name: 'rocket' },
            content: 'Get Started',
          },
          {
            subcomponent: 'Item',
            to: '/learn/games',
            icon: { name: 'game' },
            content: 'Make/Mod games',
          },
          {
            subcomponent: 'Item',
            to: '/learn/skills',
            icon: { color: 'green', name: 'student' },
            content: 'Learn skills',
          },
          {
            subcomponent: 'Item',
            to: '/learn',
            icon: { color: 'orange', name: 'map signs' },
            content: 'All Learning paths',
          },
          currUser && {
            subcomponent: 'Item',
            to: `/u/${currUser.username}/skilltree`,
            icon: { name: 'plus circle' },
            content: 'My Skills',
          }
        ]),
      },
      {
        tag: 'create',
        name: 'create',
        icon: 'pencil',
        hdr: 'Create',
        to: '/assets/create',
        hideIfNoUser: false,
        menu: !currUser ? [
            // logged-out menu
            {
              subcomponent: 'Item',
              to: '/signup',
              key: 'join',
              content: 'Sign Up to Create',
            },
          ] : [
            // logged-in menu
            {
              subcomponent: 'Item',
              id: 'mgbjr-np-create-myAssets',
              to: `/u/${currUser.profile.name}/assets`,
              title: 'List my Assets',
              icon: 'pencil',
              content: 'List My Assets',
            },
            {
              subcomponent: 'Item',
              id: 'mgbjr-np-create-createNewAsset',
              to: `/assets/create`,
              title: 'Create New Asset',
              icon: { name: 'pencil', color: 'green' },
              content: 'Create New Asset',
            },

            {
              subcomponent: 'Item',
              id: 'mgbjr-np-create-list-my-projects',
              to: `/u/${currUser.profile.name}/projects`,
              icon: 'sitemap',
              content: 'List My Projects',
            },
            {
              subcomponent: 'Item',
              id: 'mgbjr-np-create-project',
              to: `/u/${currUser.profile.name}/projects/create`,
              icon: { name: 'sitemap', color: 'green' },
              content: 'Create New Project',
            }
          ]
      },
      {
        tag: 'play',
        name: 'play',
        icon: 'game',
        hdr: 'Play',
        to: '/games',
        hideIfNoUser: false,
        menu: [
          {
            subcomponent: 'Item',
            id: 'mgbjr-np-play-popularGames',
            icon: { name: 'game', color: 'blue' },
            to: '/games',
            query: { sort: 'plays' },
            content: 'Popular Games',
          },
          {
            subcomponent: 'Item',
            id: 'mgbjr-np-play-updatedGames',
            icon: { name: 'game', color: 'green' },
            to: '/games',
            query: { sort: 'edited' },
            content: 'Updated Games',
          }
        ]
      },
      {
        tag: 'meet',
        name: 'meet',
        icon: 'street view',
        hdr: 'Meet',
        to: '/users',
        hideIfNoUser: false,
        menu: [
          // { subcomponent: 'Header', content: 'Meet' },
          {
            subcomponent: 'Item',
            id: 'mgbjr-np-meet-allUsers',
            to: '/users',
            icon: 'street view',
            content: 'All Users',
          },
          {
            subcomponent: 'Item',
            id: 'mgbjr-np-meet-allAssets',
            to: '/assets',
            icon: 'pencil',
            content: 'All Assets',
          },
        ],
      },
      {
        tag: 'user',
        name: 'user',
        icon: 'user',
        hdr: 'Login',
        to: uname ? `/u/${uname}` : '/login',
        hideIfNoUser: false,
        menu: (!currUser ? 
        [
          // logged out menu
          {
            to: '/login',
            id: 'mgbjr-np-user-login',
            subcomponent: 'Item',
            content: 'Log In',
          },
          {
            to: '/signup',
            id: 'mgbjr-np-user-signup',
            subcomponent: 'Item',
            content: 'Sign Up',
          },
        ] : 
        [
          // logged in menu
          {
            subcomponent: 'Header',
            content: this.props.currUser.profile.name
          },
          {
            subcomponent: 'Item',
            to: `/u/${this.props.currUser.profile.name}/badges`,
            id: 'mgbjr-np-user-myBadges',
            icon: 'trophy',
            content: 'My Badges',
          },
          {
            subcomponent: 'Item',
            to: `/u/${this.props.currUser.profile.name}/games`,
            id: 'mgbjr-np-user-myGames',
            icon: 'game',
            content: 'My Games',
          },
          {
            subcomponent: 'Item',
            to: `/u/${this.props.currUser.profile.name}/projects`,
            id: 'mgbjr-np-user-myProjects',
            icon: 'sitemap',
            content: 'My Projects',
          },
          {
            subcomponent: 'Item',
            to: `/u/${currUser.username}/skilltree`,
            id: 'mgbjr-np-user-mySkills',
            icon: 'plus circle',
            content: 'My Skills',
          },
          {
            subcomponent: 'Item',
            query: { '_fp': 'features' },
            id: 'mgbjr-np-user-settings',
            icon: 'options',
            content: 'Settings',
          }
        ])
      }
    ]
  },

  componentDidMount() {
    registerDebugGlobal('np', this, __filename, 'The global NavPanel instance')
  },

  // TODO: handle closing the menu on nav away, this is old code from the vertical nav
  // handleItemClick({ getDirectUrl }) {
  //   if (fGoDirect) {
  //     // Go directly to the default URL for this NavPanel
  //     const newUrl = navPanelChoice.getDirectUrl(this.props.currUser ? this.props.currUser.profile.name : null)
  //     if (newUrl) utilPushTo(this.context.urlLocation.query, newUrl)
  //   }
  // },

  render() {
    const { currUser, currUserProjects } = this.props
    const menuStyle = { borderRadius: 0, marginBottom: 0 }
    const npFeatureLevel = this.data.npFeatureLevel || 2

    // TODO: wire joyride into new NavPanelItem experience
    // if (selectedViewTag && ElementNP !== null)
    //   joyrideCompleteTag(`mgbjr-CT-navPanel-${navPanelChoice.tag}-show`)

    const allNavPanels = this.getNavPanels()

    const navPanelItems = allNavPanels
      .filter(v => {
        if (v.hideIfNoUser && !currUser)
          return false
        if (v.hideIfFewProjects && currUser && (!currUserProjects || currUserProjects.length < 3))
          return false

        if (v.showAtNavPanelFeatureLevel && npFeatureLevel < v.showAtNavPanelFeatureLevel)
          return false

        if (v.name === 'user' || v.name === 'home')
          return false // these are handled specially

        return true
      })
      .map(v => <NavPanelItem key={v.name} hdr={v.hdr} menu={v.menu} to={v.to}/>)

    return (
      <Menu inverted style={menuStyle}>
        {/* The brand */}
          <NavPanelItem
            hdr={(
            <Menu.Item color='black' style={{ padding: '0px 8px' }}>
              <img src='/images/logo-inverted-puzzle-joystick.png' style={{ width: 130 }} />
            </Menu.Item>
          )}
            menu={_.get(_.find(allNavPanels, { name: 'home' }), 'menu')}
            to={_.get(_.find(allNavPanels, { name: 'home' }), 'to')}
            style={{ padding: '0px 8px'}} />


        {/* items */}
        { navPanelItems}

        {/* The user menu */}
        <Menu.Menu position='right'>
          {currUser ? (
            <NavPanelItem
              hdr={<Image centered avatar src={_.get(currUser, 'profile.avatar', 'http://placehold.it/50')} />}
              menu={_.get(_.find(allNavPanels, { name: 'user' }), 'menu')}
              to={_.get(_.find(allNavPanels, { name: 'user' }), 'to')}
              style={{ padding: '4px 8px'}}
            />
          ) : (
            <Button content='Login' /> // TODO: wire up login
          )}
        </Menu.Menu>
      </Menu>
    )
  }
})
