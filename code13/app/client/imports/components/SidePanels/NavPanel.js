import _ from 'lodash'
import React, { PropTypes } from 'react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { getFeatureLevel } from '/imports/schemas/settings-client'
import { utilPushTo } from '/client/imports/routes/QLink'

import { Icon, Menu, Segment, Image } from 'semantic-ui-react'
// import npHome from './npHome'
// import npPlay from './npPlay'
// import NpLearn from './npLearn'
// import npCreate from './npCreate'
// import npPeople from './npPeople'
import NavPanelItem from './NavPanelItem'
// import npHistory from './npHistory'
// import npProjects from './npProjects'
// import urlMaker from '/client/imports/routes/urlMaker'
import WhatsNew from '/client/imports/components/Nav/WhatsNew'

// import reactMixin from 'react-mixin'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

// const _npFeatureLevelHideWords = 4  // At this NavPanel featureLevel (or greater), don't show the words for the icons

// import style from './FlexPanel.css' // TODO(nico): get rid of this css

export default NavPanel = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser: PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects: PropTypes.array,              // Projects list for currently logged in user
    navPanelWidth: PropTypes.string,             // e.g. '60px'.. Width of reserved space
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

    return [
      {
        tag: "learn",
        name: "learn",
        icon: "student",
        hdr: "Learn",
        getDirectUrl: () => '/learn',
        hideIfNoUser: false,
        menu: _.compact([
          {
            subcomponent: 'Header',
            content: 'Tutorials'
          },
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
        getDirectUrl: () => '/assets/create',
        hideIfNoUser: false,
        menu: !currUser ? [
            // logged out menu
            {
              subcomponent: 'Item',
              to: '/signup',
              style: { marginTop: '8em' },
              key: 'join',
              content: 'Sign Up to Create',
            },
          ] : [
            // logged in menu
            {
              subcomponent: 'Header',
              id: 'mgbjr-np-create-myAssets-hdr',
              to: `/u/${currUser.profile.name}/assets`,
              content: 'My Assets',
            },

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
              icon: (
                <Icon.Group>
                  <Icon name='pencil' />
                  <Icon corner name='add' />
                </Icon.Group>
              ),
              content: 'Create New Asset',
            },
            {
              subcomponent: 'Header',
              id: 'mgbjr-np-my-projects-hdr',
              to: `/u/${currUser.profile.name}/projects`,
              content: 'My Projects',
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
        getDirectUrl: () => '/games',
        hideIfNoUser: false,
        menu: [
          { subcomponent: 'Header', content: 'Start a Game' },
          {
            subcomponent: 'Item',
            id: 'mgbjr-np-play-popularGames',
            to: '/games',
            query: { sort: 'plays' },
            content: 'Popular Games',
          },
          {
            subcomponent: 'Item',
            id: 'mgbjr-np-play-updatedGames',
            to: '/games',
            query: { sort: 'edited' },
            content: 'Updated Games',
          },
          {
            subcomponent: 'Item',
            to: '/games',
            content: '(no saved games yet)',
          }
        ]
      },
      {
        tag: 'meet',
        name: 'meet',
        icon: 'street view',
        hdr: 'Meet',
        getDirectUrl: () => '/users',
        hideIfNoUser: false,
        menu: [
          { subcomponent: 'Header', icon: 'street view' },
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
      // SKIP: this is going to flex panel
      // {
      //   tag: 'projects',
      //   name: 'projects',
      //   icon: 'sitemap',
      //   hdr: 'Projects',
      //   getDirectUrl: (uname) => uname ? `/u/${uname}/projects` : '/u/!vault/projects',
      //   el: npProjects,
      //   hideIfNoUser: true,
      //   hideIfFewProjects: true,
      //   showAtNavPanelFeatureLevel: 2
      // },
      // SKIP: this is going to flex panel
      // {
      //   tag: 'history',
      //   name: 'history',
      //   icon: 'history',
      //   hdr: 'History',
      //   getDirectUrl: (uname) => uname ? `/u/${uname}/assets` : '/assets',
      //   el: npHistory,
      //   hideIfNoUser: true,
      //   hideIfLittleHistory: true,
      //   showAtNavPanelFeatureLevel: 3
      // },
      {
        tag: 'home',
        name: 'home',
        icon: 'home',
        hdr: 'Home',
        getDirectUrl: (uname) => uname ? `/u/${uname}` : '/login',
        hideIfNoUser: false,
        menu: [
          // always present items
          {
            subcomponent: 'Header',
            content: 'Home Page',
            to: '/',
          },
          {
            to: '/whatsnew',
            subcomponent: 'Item',
            content: (
              <div>
                What's New
                <WhatsNew currUser={currUser} />
              </div>
            ),
          },
          {
            subcomponent: 'Item',
            to: '/roadmap',
            content: 'Roadmap',
          },
          {
            subcomponent: 'Divider',
          },
        ].concat(!currUser ? [
            // logged out menu
            {
              to: '/login',
              id: 'mgbjr-np-home-login',
              subcomponent: 'Item',
              content: 'Log In',
            },
            {
              to: '/signup',
              id: 'mgbjr-np-home-signup',
              subcomponent: 'Item',
              content: 'Sign Up',
            },
          ] : [
            // logged in menu
            {
              subcomponent: 'Item',
              to: `/u/${this.props.currUser.profile.name}/badges`,
              id: 'mgbjr-np-home-myBadges',
              icon: 'trophy',
              content: 'My Badges',
            },
            {
              subcomponent: 'Item',
              to: `/u/${this.props.currUser.profile.name}/games`,
              id: 'mgbjr-np-home-myGames',
              icon: 'game',
              content: 'My Games',
            },
            {
              subcomponent: 'Item',
              to: `/u/${this.props.currUser.profile.name}/projects`,
              id: 'mgbjr-np-home-myProjects',
              icon: 'sitemap',
              content: 'My Projects',
            },
            {
              subcomponent: 'Item',
              to: `/u/${currUser.username}/skilltree`,
              id: 'mgbjr-np-home-mySkills',
              icon: 'plus circle',
              content: 'My Skills',
            },
            {
              subcomponent: 'Item',
              query: { '_fp': 'features' },
              id: 'mgbjr-np-home-settings',
              icon: 'options',
              content: 'Settings',
            }
          ]
        )
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
    const { currUser, currUserProjects, fpReservedRightSidebarWidth } = this.props

    const menuStyle = {
      width: window.outerWidth - parseInt(fpReservedRightSidebarWidth),
    }

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

        if (v.name === 'home')
          return false // this goes in the `right menu`

        return true
      })
      .map(v => <NavPanelItem key={v.name} hdr={v.hdr} menu={v.menu} />)

    return (
      <Menu fixed='top' inverted style={menuStyle}>
        {/* The brand */}
        <Menu.Item href='/' style={{ padding: 0 }}>
          <img src='/images/logo-inverted-puzzle-joystick.png' style={{ width: 130 }} />
        </Menu.Item>

        {/* items */}
        { navPanelItems}

        {/* The user menu */}
        {currUser && (
          <Menu.Menu position='right'>
            {currUser ? (
                <NavPanelItem
                  hdr={<Image centered avatar src={_.get(currUser, 'profile.avatar', 'http://placehold.it/50')} />}
                  menu={_.get(_.find(allNavPanels, { name: 'home' }), 'menu')}
                />
              ) : (
                <Button content='Login' /> // TODO: wire up login
              )}
          </Menu.Menu>
        )}
      </Menu>
    )
  }
})
