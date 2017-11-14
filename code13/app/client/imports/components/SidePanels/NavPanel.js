import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Menu, Image, Icon } from 'semantic-ui-react'
import NavPanelItem from './NavPanelItem'

// imports to enable logout functionality
import { showToast } from '/client/imports/modules'
import { utilPushTo } from '/client/imports/routes/QLink'
import SaveMyWorkButton from '/client/imports/components/HourOfCode/SaveMyWorkButton'
import { logActivity } from '/imports/schemas/activity'

// Heads up!
// Keep in sync with landing-layout.less .mgb-menu-logo
const logoImageStyle = {
  display: 'block',
  // match height of avatar image, allow width to fit
  width: 'auto',
  height: '2em',
  filter: 'brightness(1.7)',
}

const menuStyle = {
  // do not flex
  flex: '0 0 auto',
  margin: 0,
  borderRadius: 0,
  marginBottom: 0,
}

// exported since the Tutorial Editor uses this to generate some
// macros in JoyrideSpecialMacros.jsx
// Note that this uses Meteor's Accounts.loggingIn() so it doesn't flash the Login/Sigup during user login
export const getNavPanels = (currUser, showAll) => {
  const username = currUser ? currUser.username : null
  const isLoggingIn = Meteor.loggingIn()
  const showGuestOptions = (!isLoggingIn && !currUser) || showAll
  const showUserOptions = (!isLoggingIn && !!currUser) || showAll
  const isGuest = currUser ? currUser.profile.isGuest : false
  const isHocActivity = isGuest && _.startsWith(window.location.pathname, `/u/${currUser.username}/asset/`)

  if (isGuest) {
    return {
      left: [
        {
          name: 'mgb',
          icon: { name: 'home' },
          content: <img src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />,
        },
      ],
      right: [
        isHocActivity
          ? {
              name: 'hour-of-code-finished',
              content: "I'm finished with my Hour of Code™",
              href: 'https://code.org/api/hour/finish',
            }
          : {
              name: 'hour-of-code-back',
              content: 'Back to Hour of Code',
              to: '/hour-of-code',
            },
        {
          name: 'hour-of-code-save',
          content: <SaveMyWorkButton />,
          icon: { name: 'signup' },
        },
      ],
    }
  }

  return {
    left: [
      {
        name: 'mgb',
        icon: { name: 'home' },
        explainClickAction: 'Shortcut: Clicking here jumps to the Home Page',
        content: <img src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />,
        to: '/',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'whatsNew', // used for mgjr-np-mgb-{jrkey} id generation for joyride system
            explainClickAction: "What's New",
            to: '/whats-new',
            icon: 'gift',
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
        hideInIconView: true, // For top-level, items, use
        content: 'Learn',
        to: '/learn',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'getStarted',
            to: '/learn/get-started',
            icon: { color: 'yellow', name: 'rocket' },
            content: 'Get Started',
          },
          {
            subcomponent: 'Item',
            jrkey: 'learnCode',
            to: '/learn/code',
            icon: { name: 'code' },
            content: 'Code',
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
        content: 'Play',
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
        content: 'Meet',
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
        content: 'Assets',
        to: `/u/${username}/assets`,
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${username}/assets`,
            icon: 'pencil',
            content: 'My Assets',
          },
          {
            subcomponent: 'Item',
            jrkey: 'allAssets',
            to: '/assets',
            icon: 'pencil',
            content: 'All Assets',
          },
          {
            subcomponent: 'Item',
            jrkey: 'listMyChallenge',
            to: `/u/${username}/assets`,
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
        content: 'Projects',
        to: `/u/${username}/projects`,
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${username}/projects`,
            icon: 'sitemap',
            content: 'My Projects',
          },
          {
            subcomponent: 'Item',
            jrkey: 'allProjects',
            to: '/projects',
            icon: 'sitemap',
            content: 'All Projects',
          },
          {
            subcomponent: 'Item',
            jrkey: 'importMgb1',
            to: `/u/${username}/projects/import/mgb1`,
            icon: { name: 'upload', color: 'orange' },
            content: 'Import MGBv1 Projects',
          },
          {
            subcomponent: 'Item',
            jrkey: 'createNew',
            to: `/u/${username}/projects/create`,
            icon: { name: 'sitemap', color: 'green' },
            content: 'Create New Project',
          },
        ],
      },
      showUserOptions && {
        name: 'dashboard',
        explainClickAction: 'Shortcut: Clicking here jumps to the Learning Paths page',
        icon: { name: 'dashboard' },
        to: `/dashboard`,
        jrkey: 'dashboard',
        content: 'Dashboard',
      },
      showUserOptions && {
        name: 'user',
        explainClickAction: 'Shortcut: Clicking here jumps to your Profile Page', // if logged in, and this is used by tutorials, so that's ok
        icon: { name: 'user' },
        content: <Image id="mgbjr-np-user-avatar" centered avatar src={_.get(currUser, 'profile.avatar')} />,
        to: `/u/${username}`,
        menu: [
          {
            subcomponent: 'Header',
            jrkey: 'username',
            content: username,
          },
          {
            subcomponent: 'Item',
            to: `/u/${username}`,
            jrkey: 'myProfile',
            icon: 'user',
            content: 'My Profile',
          },
          {
            subcomponent: 'Item',
            to: `/u/${username}/badges`,
            jrkey: 'myBadges',
            icon: 'trophy',
            content: 'My Badges',
          },
          {
            subcomponent: 'Item',
            to: `/u/${username}/games`,
            jrkey: 'myGames',
            icon: 'game',
            content: 'My Games',
          },
          {
            subcomponent: 'Item',
            to: `/u/${username}/skilltree`,
            jrkey: 'mySkills',
            icon: 'plus circle',
            content: 'My Skills',
          },
          {
            subcomponent: 'Item',
            jrkey: 'logout',
            icon: 'sign out',
            content: 'Logout',
            onClick: _doLogout,
          },
        ],
      },
      showGuestOptions && {
        name: 'login',
        content: 'Log in',
        icon: { name: 'sign in' },
        to: '/login',
      },
      showGuestOptions && {
        name: 'signup',
        content: <Button size="small" primary content="Sign Up" />,
        icon: { name: 'signup' },
        to: '/signup',
      },
    ]),
  }
}

const _doLogout = () => {
  const userName = Meteor.user().profile.name
  logActivity('user.logout', `Logging out "${userName}"`, null, null)

  Meteor.logout(error => {
    if (error) {
      showToast.error(`Logout failed: '${error.toString()}'.  Refresh and try again.`)
    } else {
      utilPushTo(null, '/')
    }
  })
}

class NavPanel extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  static propTypes = {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    navPanelAvailableWidth: PropTypes.number, // Width of the page area available for NavPanel menu
  }

  render() {
    const { router } = this.context
    const { currUser, navPanelAvailableWidth } = this.props
    const useIcons = navPanelAvailableWidth < 768 // px
    const allNavPanels = getNavPanels(currUser)
    const isGuest = currUser ? currUser.profile.isGuest : false

    const navPanelItems = side =>
      allNavPanels[side]
        .filter(v => !(useIcons && v.hideInIconView))
        .map(({ content, href, icon, menu, name, query, to }) => (
          <NavPanelItem
            isActive={to && router.isActive(to)}
            name={name}
            openLeft={side === 'right'}
            key={name}
            content={!isGuest && (useIcons || !content) ? <Icon size="large" {...icon} /> : content}
            menu={menu}
            to={to}
            query={query}
            href={href}
          />
        ))

    return (
      <Menu inverted borderless style={menuStyle} id="mgbjr-np">
        {navPanelItems('left')}
        <Menu.Menu position="right">{navPanelItems('right')}</Menu.Menu>
      </Menu>
    )
  }
}

export default NavPanel
