import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Button, Menu, Image, Header, Icon } from 'semantic-ui-react'
import NavPanelItem from './NavPanelItem'
import WhatsNew from '/client/imports/components/Nav/WhatsNew'

// imports to enable logout functionality
import { utilPushTo } from '/client/imports/routes/QLink'
import { logActivity } from '/imports/schemas/activity'

// exported since the Tutorial Editor uses this to generate some
// macros in JoyrideSpecialMacros.jsx
// Note that this uses Meteor's Accounts.loggingIn() so it doesn't flash the Login/Sigup during user login
export const getNavPanels = (currUser, showAll) => {
  const uname = currUser ? currUser.username : null
  const isLoggingIn = Meteor.loggingIn()
  const showGuestOptions = (!isLoggingIn && !currUser) || showAll
  const showUserOptions = (!isLoggingIn && !!currUser) || showAll

  return {
    left: [
      {
        name: 'mgb', // used for mgjr-np-{name}- id generation
        icon: { name: 'home' },
        explainClickAction: 'Shortcut: Clicking here jumps to the Home Page',
        header: (
          <Menu.Item style={{ padding: '0' }}>
            <img src="/images/logos/mgb/medium/01w.png" style={{ width: 130, filter: 'brightness(1.7)' }} />
          </Menu.Item>
        ),
        to: '/',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'whatsNew', // used for mgjr-np-mgb-{jrkey} id generation for joyride system
            explainClickAction: "What's New",
            to: '/whatsnew',
            icon: <WhatsNew currUser={currUser} />,
            content: "What's New",
          },
          {
            subcomponent: 'Item',
            jrkey: 'roadmap',
            to: '/roadmap',
            icon: 'road',
            content: 'Roadmap',
          },
        ],
      },
      {
        name: 'learn',
        explainClickAction: 'Shortcut: Clicking here jumps to the Learning Paths page',
        icon: { name: 'student' },
        fHideForIconView: true, // For top-level, items, use
        header: 'Learn',
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
            jrkey: 'learnCode',
            to: '/learn/code',
            icon: { name: 'code' },
            content: 'Learn programming',
          },
          {
            subcomponent: 'Item',
            jrkey: 'learnSkills',
            to: '/learn/skills',
            icon: { color: 'green', name: 'student' },
            content: 'All skills',
          },
        ],
      },
      {
        name: 'play',
        explainClickAction: 'Shortcut: Clicking here jumps to the list of playable games',
        icon: { name: 'game' },
        header: 'Play',
        to: '/games',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'lovedGames',
            icon: { name: 'heart', color: 'red' },
            to: '/games',
            query: { sort: 'loves' },
            content: 'Loved Games',
          },
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
          },
        ],
      },
      {
        name: 'meet',
        explainClickAction: 'Shortcut: Clicking here jumps to the User search page',
        icon: 'users',
        header: 'Meet',
        to: '/users',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'allUsers',
            to: '/users',
            icon: 'users',
            content: 'All Users',
          },
          {
            subcomponent: 'Item',
            jrkey: 'publicChat',
            query: { _fp: 'chat.G_GENERAL_' },
            icon: 'chat',
            content: 'Public Chat',
          },
        ],
      },
    ],
    // Right side
    right: _.compact([
      showUserOptions && {
        name: 'assets',
        explainClickAction: 'Shortcut: Clicking here jumps to the list of your Assets',
        icon: { name: 'pencil' },
        header: 'Assets',
        to: '/assets',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'allAssets',
            to: '/assets',
            icon: 'pencil',
            content: 'All Assets',
          },
          {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${uname}/assets`,
            icon: 'pencil',
            content: 'My Assets',
          },
          {
            subcomponent: 'Item',
            jrkey: 'listMyChallenge',
            to: `/u/${uname}/assets`,
            query: { showChallengeAssets: '1', view: 's' },
            icon: { name: 'checked calendar', color: 'orange' },
            content: 'My "Challenge Assets"',
          },
          {
            subcomponent: 'Item',
            jrkey: 'createNew',
            to: `/assets/create`,
            icon: { name: 'pencil', color: 'green' },
            content: 'Create New Asset',
          },
        ],
      },
      showUserOptions && {
        name: 'projects',
        explainClickAction: 'Shortcut: Clicking here jumps to the list of your Projects',
        icon: { name: 'sitemap' },
        header: 'Projects',
        to: `/projects`,
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'allProjects',
            to: '/projects',
            icon: 'sitemap',
            content: 'All Projects',
          },
          {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${uname}/projects`,
            icon: 'sitemap',
            content: 'My Projects',
          },
          {
            subcomponent: 'Item',
            jrkey: 'importMgb1',
            to: `/u/${uname}/projects/import/mgb1`,
            icon: { name: 'upload', color: 'orange' },
            content: 'Import MGBv1 Projects',
          },
          {
            subcomponent: 'Item',
            jrkey: 'createNew',
            to: `/u/${uname}/projects/create`,
            icon: { name: 'sitemap', color: 'green' },
            content: 'Create New Project',
          },
        ],
      },
      showGuestOptions && {
        name: 'login',
        header: 'Log in',
        icon: { name: 'sign in' },
        style: { padding: '4px 16px' },
        menu: null,
        to: '/login',
      },
      showGuestOptions && {
        name: 'signup',
        header: <Button size="small" primary content="Sign Up" />,
        icon: { name: 'signup' },
        style: { padding: '4px 16px' },
        menu: null,
        to: '/signup',
      },
      {
        name: 'user',
        explainClickAction: 'Shortcut: Clicking here jumps to your Profile Page', // if logged in, and this is used by tutorials, so that's ok
        icon: { name: 'user' },
        header: 'Login',
        to: uname ? `/u/${uname}` : '/signup',
        menu: _.compact([
          showUserOptions && {
            subcomponent: 'Header',
            jrkey: 'username',
            content: <Header style={{ paddingLeft: '1.2em' }}>{uname}</Header>,
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
            jrkey: 'logout',
            icon: 'sign out',
            style: { marginTop: '1em' },
            content: 'Logout',
            onClick: _doLogout,
          },
        ]),
      },
    ]),
  }
}

const _doLogout = () => {
  const userName = Meteor.user().profile.name
  logActivity('user.logout', `Logging out "${userName}"`, null, null)

  Meteor.logout()
  utilPushTo({}, '/')
}

const _isLoggedInSty = { padding: '4px 8px' }

class NavPanel extends React.Component {
  static propTypes = {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    navPanelAvailableWidth: PropTypes.number, // Width of the page area available for NavPanel menu
  }

  render() {
    const { currUser, navPanelAvailableWidth } = this.props
    const menuStyle = {
      // do not flex
      flex: '0 0 auto',
      margin: 0,
      borderRadius: 0,
      marginBottom: 0,
    }
    const useIcons = navPanelAvailableWidth < 600 // px
    const allNavPanels = getNavPanels(currUser, false)

    const userMenuKey = 'user' // We render this specially, even though it's part of allNavPanels
    const userMenu = _.find(allNavPanels.right, { name: userMenuKey })
    const userAvatarSrc = _.get(currUser, 'profile.avatar', 'http://placehold.it/50')

    const navPanelItems = side =>
      allNavPanels[side]
        .filter(v => v.name !== userMenuKey && (!useIcons || !v.fHideForIconView))
        .map(v => (
          <NavPanelItem
            name={v.name}
            openLeft={side === 'right'}
            key={v.name}
            header={useIcons || !v.header ? <Icon size="large" {...v.icon} /> : v.header}
            menu={v.menu}
            to={v.to}
            query={v.query}
          />
        ))

    return (
      <Menu inverted borderless style={menuStyle} id="mgbjr-np">
        {navPanelItems('left')}

        {/* The user menu, pushed to the right */}
        <Menu.Menu position="right">
          {navPanelItems('right')}
          {currUser && (
            <NavPanelItem
              key="user"
              name="user"
              style={_isLoggedInSty}
              header={<Image id="mgbjr-np-user-avatar" centered avatar src={userAvatarSrc} />}
              menu={userMenu.menu}
              to={userMenu.to}
            />
          )}
        </Menu.Menu>
      </Menu>
    )
  }
}

export default NavPanel
