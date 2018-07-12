import _ from 'lodash'
import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Button, Icon, Image, Menu, Dropdown } from 'semantic-ui-react'

import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'
import EnrollButton from '/client/imports/components/HourOfCode/EnrollButton'
import { logActivity } from '/imports/schemas/activity'
import { roleTeacher, isUserTeacher } from '/imports/schemas/roles'
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
const getNavPanels = (currUser, showAll, props) => {
  const username = currUser ? currUser.username : null
  const isLoggingIn = Meteor.loggingIn()
  const showGuestOptions = (!isLoggingIn && !currUser) || showAll
  const showUserOptions = (!isLoggingIn && !!currUser) || showAll
  const isGuest = currUser ? currUser.profile.isGuest : false
  const isTeacher = isUserTeacher(currUser)
  const isHocActivity = isGuest && _.startsWith(window.location.pathname, `/u/${currUser.username}/asset/`)
  const isHocRoute = window.location.pathname === '/hour-of-code'

  const HoCRightItems = null
  /*
  if (isGuest || isHocActivity || isHocRoute) {
    return (
      <Menu inverted>
        <Menu.Item name="mgb" icon="home">
          <img src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />
        </Menu.Item>
        {isHocRoute &&
        isHocActivity && (
          <div>
            <Menu.Item name="hour-of-code-finished">
              I'm finished with my Hour of Code™ https://code.org/api/hour/finish
            </Menu.Item>
            <Menu.Item name="hour-of-code-back" to="/hour-of-code">
              Back to Hour of Code
            </Menu.Item>
            <Menu.Item
              name="log-out"
              content={<Button icon="sign out" content="Exit Hour of Code" size="tiny" onClick={_doLogout} />}
            >
              stuff
            </Menu.Item>
            <Menu.Item name="hour-of-code-save">
              <EnrollButton icon="signup" />
            </Menu.Item>
          </div>
        )}
      </Menu>
    )
  }

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
  } */

  const rightItemsLoggedIn = (
    <Menu.Menu position="right">
      {/* Note that className="left" used below because semantic doesnt want to play nice and use direction="left" */}

      {/* PROJECTS */}
      <Dropdown
        id="mgjr-np-projects"
        simple
        item
        text="Projects"
        icon={null}
        onClick={e => {
          e.stopPropagation()
          utilPushTo(null, `/u/${username}/projects`)
        }}
      >
        <Dropdown.Menu className="left">
          <Dropdown.Item
            id="mgjr-np-projects-listMy"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/projects`)
            }}
          >
            <Icon name="sitemap" color="black" />My Projects
          </Dropdown.Item>
          <Dropdown.Item
            id="mgjr-np-projects-allProjects"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/projects`)
            }}
          >
            <Icon name="sitemap" color="black" />All Projects
          </Dropdown.Item>
          <Dropdown.Item
            id="mgjr-np-projects-importMgb1"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/projects/import/mgb1`)
            }}
          >
            <Icon name="upload" color="orange" />Import MGBv1 Projects
          </Dropdown.Item>
          <Dropdown.Item
            id="mgjr-np-projects-createNew"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/projects/create`)
            }}
          >
            <Icon name="sitemap" color="green" />Create New Project
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {/* ASSETS */}
      <Dropdown
        id="mgjr-np-assets"
        simple
        item
        text="Assets"
        icon={null}
        onClick={e => {
          e.stopPropagation()
          utilPushTo(null, `/u/${username}/assets`)
        }}
      >
        <Dropdown.Menu className="left">
          <Dropdown.Item
            id="mgjr-np-assets-listMy"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/assets`)
            }}
          >
            <Icon name="pencil" color="black" />My Assets
          </Dropdown.Item>
          <Dropdown.Item
            id="mgjr-np-assets-allAssets"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/assets`)
            }}
          >
            <Icon name="pencil" color="black" />All Assets
          </Dropdown.Item>
          <Dropdown.Item
            id="mgjr-np-assets-listMyChallenge"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/assets`, { showChallengeAssets: 1, view: 's' })
            }}
          >
            <Icon name="checked calendar" color="orange" />My "Challenge Assets"
          </Dropdown.Item>
          <Dropdown.Item
            id="mgjr-np-assets-createNew"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/assets/create`)
            }}
          >
            <Icon name="pencil" color="green" />Create New Asset
          </Dropdown.Item>
          <Dropdown.Item
            id="mgjr-np-assets-createNewFromTemplate"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/assets/create-from-template`)
            }}
          >
            <Icon name="pencil" color="black" />Create From Template
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {/* DASHBOARD */}
      <Menu.Item
        id="mgbjr-np-dashboard"
        onClick={e => {
          e.stopPropagation()
          utilPushTo(null, '/dashboard-education', null)
        }}
        content="Dashboard"
        icon={null}
      />
      {/* CLASSROOM */}
      {!isTeacher && (
        <Menu.Item
          id="mgbjr-np-classroom"
          onClick={() =>
            utilPushTo(null, `/user/${currUser._id}/classroom/${_.first(props.currStudentOfClassrooms)._id}`)}
          content="Classroom"
          icon={null}
        />
      )}
      {/* NOTIFICATIONS */}
      <Dropdown id="mgbjr-np-notifications" simple item icon="bell" direction="right">
        <Dropdown.Menu className="left">
          <Dropdown.Header id="mgbjr-np-notifications-notificationsHeader" content="Notifications" />
          <Dropdown.Item id="mgbjr-np-notifications-empty-notifications">
            <Icon name="code" color="green" />Notifications Under Construction
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {/* PROFILE */}
      <Dropdown
        id="mgbjr-np-user"
        simple
        item
        onClick={e => {
          e.stopPropagation()
          utilPushTo(null, `/u/${username}`)
        }}
        icon={
          <Image
            id="mgbjr-np-user-avatar"
            centered
            avatar
            src={currUser && currUser.profile && currUser.profile.avatar}
          />
        }
      >
        <Dropdown.Menu className="left">
          <Dropdown.Header id="mgbjr-np-user-username" content={currUser && currUser.username} />
          <Dropdown.Item
            id="mgbjr-np-user-myProfile"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}`)
            }}
          >
            <Icon name="user" color="black" />My Profile
          </Dropdown.Item>
          <Dropdown.Item
            id="mgbjr-np-user-myBadges"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/badges`)
            }}
          >
            <Icon name="trophy" color="black" />My Badges
          </Dropdown.Item>
          <Dropdown.Item
            id="mgbjr-np-user-myGames"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/games`)
            }}
          >
            <Icon name="gamepad" color="black" />My Games
          </Dropdown.Item>
          <Dropdown.Item
            id="mgbjr-np-user-mySkills"
            onClick={e => {
              e.stopPropagation()
              utilPushTo(null, `/u/${username}/skilltree`)
            }}
          >
            <Icon name="plus circle" color="black" />My Skills
          </Dropdown.Item>
          <Dropdown.Item id="mgbjr-np-user-logout" onClick={_doLogout}>
            <Icon name="sign out" color="black" />Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  )

  const rightItemsNotLoggedIn = (
    <Menu.Menu position="right">
      <Menu.Item
        onClick={() => {
          utilPushTo(null, '/login', null)
        }}
        content="Log in"
        icon={null}
      />
    </Menu.Menu>
  )

  return (
    <Menu id="mgbjr-np" inverted borderless style={menuStyle}>
      <Menu.Menu icon="home">
        <Dropdown
          id="mgbjr-np-mgb"
          onClick={() => {
            utilPushTo(null, '/', null)
          }}
          simple
          item
          icon={null}
          text={<Image src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />}
        >
          <Dropdown.Menu>
            <Dropdown.Item
              id="mgbjr-np-mgb-whatsNew"
              onClick={e => {
                e.stopPropagation()
                utilPushTo(null, '/whats-new', null)
              }}
            >
              <Icon name="gift" color="black" />
              What's New
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                utilPushTo(null, '/roadmap', null)
              }}
              id="mgjr-np-mgb-roadmap"
            >
              <Icon name="road" color="black" />
              Road Map
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown
          id="mgbjr-np-learn"
          simple
          text="Learn"
          item
          icon={null}
          onClick={() => {
            utilPushTo(null, '/learn', null)
          }}
        >
          <Dropdown.Menu>
            <Dropdown.Item
              id="mgbjr-np-learn-getStarted"
              onClick={() => {
                utilPushTo(null, '/learn/get-started', null)
              }}
            >
              <Icon name="rocket" color="yellow" />
              Get Started
            </Dropdown.Item>
            <Dropdown.Item
              id="mgbjr-np-learn-learnCode"
              onClick={e => {
                e.stopPropagation()
                utilPushTo(null, '/learn/code', null)
              }}
            >
              <Icon name="code" color="black" />
              Code
            </Dropdown.Item>
            <Dropdown.Item
              id="mgbjr-np-learn-learnSkills"
              onClick={() => {
                utilPushTo(null, '/learn/skills', null)
              }}
            >
              <Icon name="student" color="green" />
              All Skills
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown
          id="mgbjr-np-play"
          simple
          text="Play"
          item
          icon={null}
          onClick={() => {
            utilPushTo(null, '/games', null)
          }}
        >
          <Dropdown.Menu>
            <Dropdown.Item
              id="mgbjr-np-play-lovedGames"
              onClick={e => {
                e.stopPropagation()
                utilPushTo({ sort: 'loves' }, '/games', { sort: 'loves' })
              }}
            >
              <Icon name="heart" color="red" />
              Loved Games
            </Dropdown.Item>
            <Dropdown.Item
              id="mgbjr-np-play-popularGames"
              onClick={e => {
                e.stopPropagation()
                utilPushTo({ sort: 'plays' }, '/games', { sort: 'plays' })
              }}
            >
              <Icon name="gamepad" color="blue" />
              Popular Games
            </Dropdown.Item>
            <Dropdown.Item
              id="mgbjr-np-play-updatedGames"
              onClick={e => {
                e.stopPropagation()
                utilPushTo({ sort: 'edited' }, '/games', { sort: 'edited' })
              }}
            >
              <Icon name="gamepad" color="green" />Updated Games
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown
          id="mgbjr-np-meet"
          onClick={e => {
            e.stopPropagation()
            utilPushTo(null, '/users', null)
          }}
          simple
          text="Meet"
          item
          icon={null}
        >
          <Dropdown.Menu>
            <Dropdown.Item id="mgbjr-np-meet-allUsers">
              <Icon name="users" color="black" />All Users
            </Dropdown.Item>
            <Dropdown.Item
              id="mgbjr-np-meet-publicChat"
              onClick={e => {
                e.stopPropagation()
                utilPushTo({ _fp: 'chat.G_GENERAL_' }, '/users', { _fp: 'chat.G_GENERAL_' })
              }}
            >
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
