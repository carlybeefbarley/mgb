import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Menu, Image, Header, Icon } from 'semantic-ui-react'
import NavPanelItem from './NavPanelItem'
import WhatsNew from '/client/imports/components/Nav/WhatsNew'

// imports to enable logout functionality
import { utilPushTo } from '/client/imports/routes/QLink'
import { logActivity } from '/imports/schemas/activity'


const _doLogout = () => 
{  
  const userName = Meteor.user().profile.name
  logActivity("user.logout",  `Logging out "${userName}"`, null, null)

  Meteor.logout()
  utilPushTo({}, "/")
}

export default NavPanel = React.createClass({

  propTypes: {
    currUser: PropTypes.object,                           // Currently Logged in user. Can be null/undefined
    currUserProjects: PropTypes.array,                    // Projects list for currently logged in user
    navPanelAvailableWidth: PropTypes.number,             // Width of the page area available for NavPanel menu
    fpReservedRightSidebarWidth: PropTypes.string.isRequired   // Something like 0px or 60px typically
  },

  getNavPanels() {
    const { currUser } = this.props
    const uname = currUser ? currUser.username : null

    return { 
      left: [
        {
          name: 'home',
          icon: 'home',
          hdr: (
              <Menu.Item color='black' style={{ padding: '0px 8px' }}>
                <img src='/images/logo-inverted-puzzle-joystick.png' style={{ width: 130 }} />
              </Menu.Item>
            ),
          to: '/',
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
          name: "learn",
          icon: "student",
          hdr: "Learn",
          to: '/learn',
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
          name: 'play',
          icon: 'game',
          hdr: 'Play',
          to: '/games',
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
          name: 'meet',
          icon: 'street view',
          hdr: 'Meet',
          to: '/users',
          menu: [
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
        }
      ],
      right: [
        {
          name: 'assets',
          icon: 'pencil',
          hdr: 'Assets',
          to: uname ? `/u/${uname}/assets` : '/assets',
          menu: !currUser ? [
              // logged-out menu
              {
                subcomponent: 'Item',
                to: '/signup',
                content: 'Sign Up to Create',
              },
            ] : [
              // logged-in menu
              {
                subcomponent: 'Item',
                id: 'mgbjr-np-create-myAssets',
                to: `/u/${uname}/assets`,
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
              }
            ]
        },
        {
          name: 'projects',
          icon: 'sitemap',
          hdr: 'Projects',
          to: uname ? `/u/${uname}/projects` : null,
          menu: !currUser ? [
              // logged-out menu
              {
                subcomponent: 'Item',
                to: '/signup',
                content: 'Sign Up to Create',
              },
            ] : [
              // logged-in menu
              {
                subcomponent: 'Item',
                id: 'mgbjr-np-create-list-my-projects',
                to: `/u/${uname}/projects`,
                icon: 'sitemap',
                content: 'List My Projects',
              },
              {
                subcomponent: 'Item',
                id: 'mgbjr-np-create-project',
                to: `/u/${uname}/projects/create`,
                icon: { name: 'sitemap', color: 'green' },
                content: 'Create New Project',
              }
            ]
        },
        {
          name: 'user',
          icon: 'user',
          hdr: 'Login',
          to: uname ? `/u/${uname}` : '/login',
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
              content: <Header style={{paddingLeft: '1.2em'}}>{uname}</Header>
            },
            {
              subcomponent: 'Item',
              to: `/u/${uname}`,
              id: 'mgbjr-np-user-myProfile',
              icon: 'user',
              content: 'My Profile',
            },
            {
              subcomponent: 'Item',
              to: `/u/${uname}/badges`,
              id: 'mgbjr-np-user-myBadges',
              icon: 'trophy',
              content: 'My Badges',
            },
            {
              subcomponent: 'Item',
              to: `/u/${uname}/games`,
              id: 'mgbjr-np-user-myGames',
              icon: 'game',
              content: 'My Games',
            },
            {
              subcomponent: 'Item',
              to: `/u/${uname}/skilltree`,
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
            },
            {
              subcomponent: 'Item',
              id: 'mgbjr-np-user-logout',
              icon: 'sign out',
              style: { marginTop: '1em' },
              content: 'Logout',
              onClick: _doLogout
            }
          ])
        }
      ]
    }
  },


  render() {
    const { currUser, navPanelAvailableWidth } = this.props
    const menuStyle = { borderRadius: 0, marginBottom: 0 }
    const useIcons = navPanelAvailableWidth < 500  // px

    // TODO: wire joyride into new NavPanelItem experience
    // if (selectedViewTag && ElementNP !== null)
    //   joyrideCompleteTag(`mgbjr-CT-navPanel-${navPanelChoice.name}-show`)

    const allNavPanels = this.getNavPanels()

    const navPanelItems = (side) => allNavPanels[side]
      .filter(v => (v.name !== 'user'))
      .map(v => <NavPanelItem openLeft={side==='right'} key={v.name} hdr={useIcons ?  <Icon size='large' name={v.icon}/> : v.hdr} menu={v.menu} to={v.to}/>)

    return (
      <Menu inverted style={menuStyle} id='mgbjr-navPanelHeader'>
        { navPanelItems('left') }

        {/* The user menu, pushed to the right */}
        <Menu.Menu position='right' id='mgbjr-navPanelIcons-user'>
          { navPanelItems('right') }
          <NavPanelItem
            key='user'
            hdr={<Image id="mgbjr-np-user" centered avatar src={_.get(currUser, 'profile.avatar', 'http://placehold.it/50')} />}
            menu={_.get(_.find(allNavPanels.right, { name: 'user' }), 'menu')}
            to={_.get(_.find(allNavPanels.right, { name: 'user' }), 'to')}
            style={{ padding: '4px 8px'}}
          />
        </Menu.Menu>
      </Menu>
    )
  }
})