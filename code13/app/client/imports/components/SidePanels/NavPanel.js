import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Menu, Image, Header, Icon } from 'semantic-ui-react'
import NavPanelItem from './NavPanelItem'
import WhatsNew from '/client/imports/components/Nav/WhatsNew'

// imports to enable logout functionality
import { utilPushTo } from '/client/imports/routes/QLink'
import { logActivity } from '/imports/schemas/activity'

// exported since the Tutorial Editor uses this to generate some
// macros in JoyrideSpecialMacros.jsx
export const getNavPanels = (currUser, showAll) => {
  const uname = currUser ? currUser.username : null
  const showGuestOptions = !currUser || showAll
  const showUserOptions = !!currUser || showAll

  return { 
    left: [
      {
        name: 'mgb',                  // used for mgjr-np-{name}- id generation
        icon: 'home',
        explainClickAction: "This will take you directly to the Home Page",
        hdr: (
            <Menu.Item color='black' style={{ padding: '0px 8px' }}>
              <img src='/images/logo-inverted-puzzle-joystick.png' style={{ width: 130 }} />
            </Menu.Item>
          ),
        to: '/',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'whatsNew',       // used for mgjr-np-mgb-{jrkey} id generation for joyride system
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
            jrkey: 'roadmap',
            to: '/roadmap',
            content: 'Roadmap',
          }
        ]
      },
      {
        name: "learn",
        explainClickAction: "This will take you directly to the Learning Paths page",
        icon: "student",
        hdr: "Learn",
        to: '/learn',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'getStarted',
            to: '/learn/getStarted',
            icon: { color: 'yellow', name: 'rocket' },
            content: 'Get Started',
          },
          {
            subcomponent: 'Item',
            jrkey: 'makeGames',
            to: '/learn/games',
            icon: { name: 'game' },
            content: 'Make/Mod games',
          },
          {
            subcomponent: 'Item',
            jrkey: 'learnSkills',
            to: '/learn/skills',
            icon: { color: 'green', name: 'student' },
            content: 'Learn skills',
          },
          {
            subcomponent: 'Item',
            jrkey: 'learningPaths',
            to: '/learn',
            icon: { color: 'orange', name: 'map signs' },
            content: 'All Learning paths',
          }
        ],
      },
      {
        name: 'play',
        explainClickAction: "This will take you directly to the list of playable games",
        icon: 'game',
        hdr: 'Play',
        to: '/games',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'popularGames',
            icon: { name: 'game', color: 'blue' },
            to: '/games',
            query: { sort: 'plays' },
            content: 'Popular Games',
          },
          {
            subcomponent: 'Item',
            jrkey: 'updatedGames',
            icon: { name: 'game', color: 'green' },
            to: '/games',
            query: { sort: 'edited' },
            content: 'Updated Games',
          }
        ]
      },
      {
        name: 'meet',
        explainClickAction: "This will take you directly to the User search page",
        icon: 'street view',
        hdr: 'Meet',
        to: '/users',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'allUsers',
            to: '/users',
            icon: 'street view',
            content: 'All Users',
          },
          {
            subcomponent: 'Item',
            jrkey: 'allAssets',
            to: '/assets',
            icon: 'pencil',
            content: 'All Assets',
          },
        ],
      }
      // , {
      //   name: 'userBash',
      //   explainClickAction: "This will take you directly to the UserBashes search page",
      //   icon: 'plug',
      //   hdr: 'UserBash',
      //   to: '/userBashes',
      //   highlight: true,
      //   menu: [
      //     {
      //       subcomponent: 'Item',
      //       jrkey: 'userbash',
      //       to: '/userBashes',
      //       icon: { color: 'orange', name: 'plug' },
      //       content: 'UserBash Info',
      //     }
      //   ],
      // }      
    ],
    // Right side
    right: _.compact([
      showUserOptions && {
        name: 'assets',
        explainClickAction: "This will take you directly to the list of your Assets",
        icon: 'pencil',
        hdr: 'Assets',
        to: uname ? `/u/${uname}/assets` : '/assets',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${uname}/assets`,
            title: 'List my Assets',
            icon: 'pencil',
            content: 'List My Assets',
          },
          {
            subcomponent: 'Item',
            jrkey: 'createNew',
            to: `/assets/create`,
            title: 'Create New Asset',
            icon: { name: 'pencil', color: 'green' },
            content: 'Create New Asset',
          }
        ]
      },
      showUserOptions && {
        name: 'projects',
        explainClickAction: "This will take you directly to the list of your Projects",
        icon: 'sitemap',
        hdr: 'Projects',
        to: uname ? `/u/${uname}/projects` : null,
        menu: [
          showUserOptions && {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${uname}/projects`,
            icon: 'sitemap',
            content: 'List My Projects',
          },
          showUserOptions && {
            subcomponent: 'Item',
            jrkey: 'createNew',
            to: `/u/${uname}/projects/create`,
            icon: { name: 'sitemap', color: 'green' },
            content: 'Create New Project',
          }
        ]
      },
      showGuestOptions && {
        name: 'login',
        hdr: 'Log in',
        icon: 'sign in',
        style: { padding: '4px 16px'},
        menu: null,
        to: '/login'
      },
      showGuestOptions && {
        name: 'signup',
        hdr: 'Sign up',
        icon: 'signup',
        style: { padding: '4px 16px'},
        menu: null,
        to: '/signup'
      },
      {
        name: 'user',
        explainClickAction: "This will take you directly to your Profile Page", // if logged in, and this is used by tutorials, so that's ok
        icon: 'user',
        hdr: 'Login',
        to: uname ? `/u/${uname}` : '/signup',
        menu: _.compact([
          showUserOptions && {
            subcomponent: 'Header',
            jrkey: 'username',
            content: <Header style={{paddingLeft: '1.2em'}}>{uname}</Header>
          },
          showUserOptions && {
            subcomponent: 'Item',
            to: `/u/${uname}`,
            jrkey: 'myProfile',
            icon: 'user',
            content: 'My Profile',
          },
          showUserOptions && {
            subcomponent: 'Item',
            to: `/u/${uname}/badges`,
            jrkey: 'myBadges',
            icon: 'trophy',
            content: 'My Badges',
          },
          showUserOptions && {
            subcomponent: 'Item',
            to: `/u/${uname}/games`,
            jrkey: 'myGames',
            icon: 'game',
            content: 'My Games',
          },
          showUserOptions && {
            subcomponent: 'Item',
            to: `/u/${uname}/skilltree`,
            jrkey: 'mySkills',
            icon: 'plus circle',
            content: 'My Skills',
          },
          showUserOptions && {
            subcomponent: 'Item',
            query: { '_fp': 'features' },
            jrkey: 'settings',
            icon: 'options',
            content: 'Settings',
          },
          showUserOptions && {
            subcomponent: 'Item',
            jrkey: 'logout',
            icon: 'sign out',
            style: { marginTop: '1em' },
            content: 'Logout',
            onClick: _doLogout
          }
        ])
      }
    ])
  }
}

const _doLogout = () => 
{  
  const userName = Meteor.user().profile.name
  logActivity("user.logout",  `Logging out "${userName}"`, null, null)

  Meteor.logout()
  utilPushTo( {}, '/' )
}

export default NavPanel = React.createClass({

  propTypes: {
    currUser: PropTypes.object,                           // Currently Logged in user. Can be null/undefined
    currUserProjects: PropTypes.array,                    // Projects list for currently logged in user
    navPanelAvailableWidth: PropTypes.number,             // Width of the page area available for NavPanel menu
    fpReservedRightSidebarWidth: PropTypes.string.isRequired   // Something like 0px or 60px typically
  },

  render() {
    const { currUser, navPanelAvailableWidth } = this.props
    const menuStyle = { borderRadius: 0, marginBottom: 0 }
    const useIcons = navPanelAvailableWidth < 600  // px
    const allNavPanels = getNavPanels(currUser)

    const userMenuKey = 'user'  // We render this specially, even though it's part of allNavPanels
    const userMenu = _.find(allNavPanels.right, { name: userMenuKey })
    const userAvatarSrc = _.get(currUser, 'profile.avatar', 'http://placehold.it/50')

    const navPanelItems = (side) => allNavPanels[side]
      .filter(v => (v.name !== userMenuKey))
      .map(v => (
        <NavPanelItem 
          name={v.name}
          openLeft={side==='right'} 
          key={v.name} 
          hdr={useIcons ? <Icon size='large' name={v.icon}/> : v.hdr} 
          menu={v.menu} 
          style={{ backgroundColor: (v.highlight ? 'orange' : '') }}
          to={v.to}/>))

    return (
      <Menu inverted style={menuStyle} id='mgbjr-np'>
        { navPanelItems('left') }

        {/* The user menu, pushed to the right */}
        <Menu.Menu position='right'>
          { navPanelItems('right') }
          { currUser && 
          <NavPanelItem
            key='user'
            name='user'
            style={{ padding: currUser ? '4px 8px' : '4px 16px'}}
            hdr={!currUser ? 'Sign Up' :  <Image id="mgbjr-np-user-avatar" centered avatar src={userAvatarSrc} />}
            menu={userMenu.menu}
            to={userMenu.to} />
          }
        </Menu.Menu>
      </Menu>
    )
  }
})