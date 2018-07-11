import _ from 'lodash'
import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Button, Icon, Image, Menu, Dropdown } from 'semantic-ui-react'

import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'
import EnrollButton from '/client/imports/components/HourOfCode/EnrollButton'
import { logActivity } from '/imports/schemas/activity'
import { roleTeacher } from '/imports/schemas/roles'
import { Classrooms } from '/imports/schemas'
import NavPanelItem from './NavPanel'

// Heads up!
// Keep in sync with landing-layout.less .mgb-menu-logo
const logoImageStyle = {
  display: 'block',
  // match height of avatar image, allow width to fit
  width: 'auto',
  height: '2em',
  filter: 'brightness(1.7)',
}

const openLeftStyle = { left: 'auto', right: '0' }

const menuStyle = {
  position: 'relative',
  flex: '0 0 auto',
  margin: 0,
  borderRadius: 0,
  marginBottom: 0,
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
  const isTeacher = true
  const isHocActivity = isGuest && _.startsWith(window.location.pathname, `/u/${currUser.username}/asset/`)
  const isHocRoute = window.location.pathname === '/hour-of-code'
  rightItemsLoggedIn
  const rightItemsLoggedIn = (
    <Menu.Menu position="right">
      {/* Note that className="left" used below because semantic doesnt want to play nice and use direction="left" */}
      {/* ASSETS */}
      <Dropdown simple item text="Assets" icon={null}>
        <Dropdown.Menu className="left">
          <Dropdown.Item>
            <Icon name="pencil" color="black" />My Assets
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="pencil" color="black" />All Assets
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="calendar check outline" color="orange" />My "Challenge Assets"
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="pencil" color="green" />Create New Asset
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="pencil" color="black" />Create From Template
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {/* PROJECTS */}
      <Dropdown simple item text="Projects" icon={null}>
        <Dropdown.Menu className="left">
          <Dropdown.Item>
            <Icon name="sitemap" color="black" />My Projects
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="sitemap" color="black" />All Projects
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="upload" color="orange" />Import MGBv1 Projects
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="sitemap" color="green" />Create New Project
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {/* DASHBOARD */}
      <Menu.Item link href="/dashboard" content="Dashboard" icon={null} />
      {/* CLASSROOM */}
      <Menu.Item link href="" content="Classroom" icon={null} />
      {/* NOTIFICATIONS */}
      <Dropdown simple item icon="bell" position="right" direction="right">
        <Dropdown.Menu className="left">
          <Dropdown.Header content="Notifications" />
          <Dropdown.Item>
            <Icon name="code" color="green" />PH - Notification
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {/* PROFILE */}
      <Dropdown
        simple
        item
        icon={<Image centered avatar src="https://v2.mygamebuilder.com/api/asset/png/Jd4dSR3WygBFXp72m" />}
      >
        <Dropdown.Menu className="left">
          <Dropdown.Header content="PH - USERNAME" />
          <Dropdown.Item>
            <Icon name="user" color="black" />My Profile
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="trophy" color="black" />My Badges
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="gamepad" color="black" />My Games
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="plus circle" color="black" />My Skills
          </Dropdown.Item>
          <Dropdown.Item>
            <Icon name="sign out" color="black" />Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  )

  const rightItemsNotLoggedIn = (
    <Menu.Menu position="right">
      <Menu.Item link href="/login" content="Log in" icon={null} />
    </Menu.Menu>
  )

  // if (isGuest || isHocActivity || isHocRoute) {
  //   return (
  //     <Menu inverted>
  //       <Menu.Item name="mgb" icon="home">
  //         <img src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />
  //       </Menu.Item>
  //       {isHocRoute &&
  //       isHocActivity && (
  //         <div>
  //           <Menu.Item name="hour-of-code-finished">
  //             I'm finished with my Hour of Code™ https://code.org/api/hour/finish
  //           </Menu.Item>
  //           <Menu.Item name="hour-of-code-back" to="/hour-of-code">
  //             Back to Hour of Code
  //           </Menu.Item>
  //           <Menu.Item
  //             name="log-out"
  //             content={<Button icon="sign out" content="Exit Hour of Code" size="tiny" onClick={_doLogout} />}
  //           >
  //             stuff
  //           </Menu.Item>
  //           <Menu.Item name="hour-of-code-save">
  //             <EnrollButton icon="signup" />
  //           </Menu.Item>
  //         </div>
  //       )}
  //     </Menu>
  //   )
  // }

  // if (isGuest || isHocActivity || isHocRoute) {
  //   return {
  //     left: [
  //       {
  //         name: 'mgb',
  //         icon: { name: 'home' },
  //         content: <img src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />,
  //       },
  //     ],

  //     right: isHocRoute
  //       ? []
  //       : [
  //           isHocActivity
  //             ? {
  //                 name: 'hour-of-code-finished',
  //                 content: "I'm finished with my Hour of Code™",
  //                 href: 'https://code.org/api/hour/finish',
  //               }
  //             : {
  //                 name: 'hour-of-code-back',
  //                 content: 'Back to Hour of Code',
  //                 to: '/hour-of-code',
  //               },
  //           {
  //             name: 'log-out',
  //             content: <Button icon="sign out" content="Exit Hour of Code" size="tiny" onClick={_doLogout} />,
  //           },
  //           {
  //             name: 'hour-of-code-save',
  //             content: <EnrollButton />,
  //             icon: { name: 'signup' },
  //           },
  //         ],
  //   }
  // }

  return (
    <Menu inverted borderless style={menuStyle}>
      <Menu.Menu name="mgb" icon="home" explainClickAction="Clicking here jumps to the Home Page" to="/">
        <Dropdown
          link
          href="/"
          simple
          item
          icon={null}
          text={<Image src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />}
        >
          <Dropdown.Menu>
            <Dropdown.Item link href="/whats-new">
              <Icon name="gift" color="black" />
              What's New
            </Dropdown.Item>
            <Dropdown.Item link href="/roadmap">
              <Icon name="road" color="black" />
              Road Map
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown simple text="Learn" item icon={null} link href="/learn">
          <Dropdown.Menu>
            <Dropdown.Item link href="/learn/get-started">
              <Icon name="rocket" color="yellow" />
              Get Started
            </Dropdown.Item>
            <Dropdown.Item link href="/learn/code">
              <Icon name="code" color="black" />
              Code
            </Dropdown.Item>
            <Dropdown.Item link href="/learn/skills">
              <Icon name="student" color="green" />
              All Skills
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown simple text="Play" item icon={null} link href="/games">
          <Dropdown.Menu>
            <Dropdown.Item link href="/games?sort=loves">
              <Icon name="heart" color="red" />
              Loved Games
            </Dropdown.Item>
            <Dropdown.Item link href="/games?sort=plays">
              <Icon name="gamepad" color="blue" />
              Popular Games
            </Dropdown.Item>
            <Dropdown.Item link href="/games?sort=edited">
              <Icon name="gamepad" color="green" />Updated Games
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown simple text="Meet" item icon={null}>
          <Dropdown.Menu>
            <Dropdown.Item>
              <Icon name="users" color="black" />All User
            </Dropdown.Item>
            <Dropdown.Item>
              <Icon name="chat" color="black" />Public Chat
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Menu>
      {/* RIGHT HAND ITEMS BELOW*/}
      {Meteor.user() ? rightItemsLoggedIn : rightItemsNotLoggedIn}
    </Menu>
  )
}

export default getNavPanels
