import _ from 'lodash'
import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Button, Icon, Image } from 'semantic-ui-react'

import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'
import EnrollButton from '/client/imports/components/HourOfCode/EnrollButton'
import { logActivity } from '/imports/schemas/activity'
import { roleTeacher } from '/imports/schemas/roles'
import { Classrooms } from '/imports/schemas'

// Heads up!
// Keep in sync with landing-layout.less .mgb-menu-logo
const logoImageStyle = {
  display: 'block',
  // match height of avatar image, allow width to fit
  width: 'auto',
  height: '2em',
  filter: 'brightness(1.7)',
}

const _doLogout = () => {
  const currUser = Meteor.user()
  const userName = currUser.profile.name
  const isGuest = currUser ? currUser.profile.isGuest : false

  if (isGuest) {
    const isConfirmed = confirm(
      'Are you sure you want to log out? You will lose your progress unless you save your work.',
    )
    if (!isConfirmed) return
  } else {
    logActivity('user.logout', `Logging out "${userName}"`, null, null)
  }

  Meteor.logout(error => {
    if (error) {
      showToast.error(`Logout failed: '${error.toString()}'.  Refresh and try again.`)
    } else {
      utilPushTo(null, '/')
    }
  })
}

// exported since the Tutorial Editor uses this to generate some
// macros in JoyrideSpecialMacros.jsx
// Note that this uses Meteor's Accounts.loggingIn() so it doesn't flash the Login/Sigup during user login
const getNavPanels = (currUser, showAll) => {
  const username = currUser ? currUser.username : null
  const isLoggingIn = Meteor.loggingIn()
  const showGuestOptions = (!isLoggingIn && !currUser) || showAll
  const showUserOptions = (!isLoggingIn && !!currUser) || showAll
  const isGuest = currUser ? currUser.profile.isGuest : false
  const isTeacher =
    currUser &&
    currUser.permissions &&
    currUser.permissions[0] &&
    currUser.permissions[0].roles[0] === roleTeacher
  const isHocActivity = isGuest && _.startsWith(window.location.pathname, `/u/${currUser.username}/asset/`)
  const isHocRoute = window.location.pathname === '/hour-of-code'

  if (isGuest || isHocActivity || isHocRoute) {
    return {
      left: [
        {
          name: 'mgb',
          icon: { name: 'home' },
          content: <img src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />,
        },
      ],
      right: isHocRoute
        ? []
        : [
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
              name: 'log-out',
              content: <Button icon="sign out" content="Exit Hour of Code" size="tiny" onClick={_doLogout} />,
            },
            {
              name: 'hour-of-code-save',
              content: <EnrollButton />,
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
        explainClickAction: 'Clicking here jumps to the Home Page',
        content: <img src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />,
        to: '/',
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'whatsNew', // used for mgjr-np-mgb-{jrkey} id generation for joyride system
            explainClickAction: "What's New",
            to: '/whats-new',
            icon: { name: 'newspaper' },
            content: "What's New",
          },
          {
            subcomponent: 'Item',
            jrkey: 'roadmap',
            to: '/roadmap',
            icon: { name: 'road' },
            content: 'Roadmap',
          },
        ],
      },
      {
        name: 'learn',
        explainClickAction: 'Clicking here jumps to the Learning Paths page',
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
        explainClickAction: 'Clicking here jumps to the list of playable games',
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
      // Disabled for AIE subdomain, uncomment to re-enable.
      // {
      //   name: 'meet',
      //   explainClickAction: 'Clicking here jumps to the User search page',
      //   icon: { name: 'users' },
      //   content: 'Meet',
      //   to: '/users',
      //   menu: [
      //     {
      //       subcomponent: 'Item',
      //       jrkey: 'allUsers',
      //       to: '/users',
      //       icon: { name: 'users' },
      //       content: 'All Users',
      //     },
      //     {
      //       subcomponent: 'Item',
      //       jrkey: 'publicChat',
      //       query: { _fp: 'chat.G_GENERAL_' },
      //       icon: { name: 'chat' },
      //       content: 'Public Chat',
      //     },
      //   ],
      // },
    ],
    // Right side
    right: _.compact([
      // showUserOptions && {
      //   name: 'classrooms',
      //   explainClickAction: 'Select the classroom you would like to set as active.',
      //   icon: { name: 'student' },
      //   content: 'Classroom',
      //   to: `/u/${currUser && currUser._id}/classroom/getClassrooms`,
      // },
      showUserOptions && {
        name: 'projects',
        explainClickAction: 'Clicking here jumps to the list of your Projects',
        icon: { name: 'sitemap' },
        content: 'Projects',
        to: `/u/${username}/projects`,
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${username}/projects`,
            icon: { name: 'sitemap' },
            content: 'My Projects',
          },
          {
            subcomponent: 'Item',
            jrkey: 'allProjects',
            to: '/projects',
            icon: { name: 'sitemap' },
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
        name: 'assets',
        explainClickAction: 'Clicking here jumps to the list of your Assets',
        icon: { name: 'pencil' },
        content: 'Assets',
        to: `/u/${username}/assets`,
        menu: [
          {
            subcomponent: 'Item',
            jrkey: 'listMy',
            to: `/u/${username}/assets`,
            icon: { name: 'pencil' },
            content: 'My Assets',
          },
          {
            subcomponent: 'Item',
            jrkey: 'allAssets',
            to: '/assets',
            icon: { name: 'pencil' },
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
          {
            subcomponent: 'Item',
            jrkey: 'createFromTemplate',
            to: `/assets/create-from-template`,
            icon: { name: 'pencil' },
            content: 'Create From Template',
          },
        ],
      },
      showUserOptions && {
        name: 'dashboard',
        explainClickAction: 'Clicking here jumps to the Learning Paths page',
        icon: { name: 'dashboard' },
        to: `/dashboard-education`,
        jrkey: 'dashboard',
        content: 'Dashboard',
      },
      showUserOptions && {
        name: 'notifications',
        explainClickAction: 'Shortcut: Clicking here jumps to your notifications',
        icon: { name: 'bell' },
        to: `/notifications`,
        jrkey: 'notifications',
        content: <Icon name="bell" />,
        menu: [
          {
            subcomponent: 'Header',
            jrkey: 'notificationsHeader',
            content: 'notifications',
          },
        ],
      },
      showUserOptions && {
        name: 'user',
        explainClickAction: 'Clicking here jumps to your Profile Page', // if logged in, and this is used by tutorials, so that's ok
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
            icon: { name: 'user' },
            content: 'My Profile',
          },
          {
            subcomponent: 'Item',
            to: `/u/${username}/badges`,
            jrkey: 'myBadges',
            icon: { name: 'trophy' },
            content: 'My Badges',
          },
          {
            subcomponent: 'Item',
            to: `/u/${username}/games`,
            jrkey: 'myGames',
            icon: { name: 'game' },
            content: 'My Games',
          },
          {
            subcomponent: 'Item',
            to: `/u/${username}/skilltree`,
            jrkey: 'mySkills',
            icon: { name: 'plus circle' },
            content: 'My Skills',
          },
          {
            subcomponent: 'Item',
            jrkey: 'logout',
            icon: { name: 'sign out' },
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
      // Uncomment to enable user sign up to the public
      // showGuestOptions && {
      //   name: 'signup',
      //   content: <Button size="small" primary content="Sign Up" />,
      //   icon: { name: 'signup' },
      //   to: '/signup',
      // },
    ]),
  }
}

export default getNavPanels
