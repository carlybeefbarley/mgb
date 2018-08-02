// import PropTypes from 'prop-types'
// import EnrollButton from '/client/imports/components/HourOfCode/EnrollButton'
// import { joyrideStore } from '/client/imports/stores'
import React from 'react'
import _ from 'lodash'
import { Meteor } from 'meteor/meteor'
import { Icon, Image, Menu, Label } from 'semantic-ui-react'
import { utilPushTo } from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'
import { logActivity, ActivityTypes } from '/imports/schemas/activity'
import { AssetKinds } from '/imports/schemas/assets'
import { isUserTeacher } from '/imports/schemas/roles'
import NavPanelItem, { NavPanelOption } from '/client/imports/components/SidePanels/NavPanelItem'

const menuStyle = {
  position: 'relative',
  flex: '0 0 auto',
  margin: 0,
  borderRadius: 0,
  marginBottom: 0,
}

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

// TODO: Add deep support for each notification type that returns special strings to clarify the activity.
// Links are also broken on non-asset notifications.
const renderNotifications = activities => {
  const currUser = Meteor.user()

  // Do we have any notifications to show?
  if (activities.length === 0) {
    return (
      <NavPanelOption
        icon="check"
        iconColor="green"
        key="empty-notifications"
        to={window.location.pathname}
        label="No Unread Notifications"
      />
    )
  }
  // If we do have notifications, map them into notification menu items.
  return _.map(activities, item => {
    return (
      <NavPanelOption
        key={item._id}
        to={`/u/${currUser._id}/asset/${item.toAssetId}`}
        label={item.description}
        icon={AssetKinds.getIconName(item.activityType)}
        iconColor="green"
      />
    )
  })
}

const RightItemsLoggedIn = props => {
  const { currUser = Meteor.user(), currStudentOfClassrooms, hazUnreadActivities, activity } = props
  const { username } = currUser
  const isTeacher = isUserTeacher(currUser)
  return (
    <Menu.Menu position="right">
      {/* CHAT REVIEW */}
      {isUserTeacher(currUser) ? <NavPanelItem label="Chat Review" to="/chat-review/" /> : null}

      {/* PROJECTS */}
      <NavPanelItem
        as="dropdown"
        direction="left"
        jrkey="projects"
        label="Projects"
        to={`/u/${username}/projects`}
      >
        <NavPanelOption
          label="My Projects"
          key="listMy"
          icon="sitemap"
          iconColor="black"
          to={`/u/${username}/projects`}
        />
        <NavPanelOption key="allProjects" to="/projects" label="All Projects" icon="sitemap" />
        <NavPanelOption
          label="Import MGBv1 Projects"
          key="importMgb1"
          icon="upload"
          iconColor="orange"
          to={`/u/${username}/projects/import/mgb1`}
        />
        <NavPanelOption
          label="Create New Project"
          key="createNew"
          icon="sitemap"
          iconColor="green"
          to={`/u/${username}/projects/create`}
        />
      </NavPanelItem>

      {/* ASSETS */}
      <NavPanelItem direction="left" as="dropdown" jrkey="assets" label="Assets" to={`/u/${username}/assets`}>
        <NavPanelOption key="listMy" icon="pencil" label="My Assets" to={`/u/${username}/assets`} />
        <NavPanelOption key="allAssets" icon="pencil" label="All Assets" to={`/assets`} />
        <NavPanelOption
          key="listMyChallenge"
          icon="checked calendar"
          iconColor="orange"
          label="My Challenge Assets"
          to={`/u/${username}/assets`}
          toOptions={{ showChallengeAssets: 1, view: 's' }}
        />
        <NavPanelOption label="Create New" icon="pencil" key="createNew" to={`/assets/create`} />
        <NavPanelOption
          key="createNewFromTemplate"
          label="Create From Template"
          icon="pencil"
          iconColor="green"
          to={`/assets/create-from-template`}
        />
      </NavPanelItem>

      {/* DASHBOARD */}
      <NavPanelItem label="Dashboard" jrkey="dashboard" to={'/dashboard-education'} />

      {/* CLASSROOM */}
      {!isTeacher && (
        <NavPanelItem
          label="Classroom"
          jrkey="classroom"
          to={`/user/${currUser && currUser._id}/classroom/${currStudentOfClassrooms &&
            _.first(currStudentOfClassrooms) &&
            _.first(currStudentOfClassrooms)._id}`}
        />
      )}

      {/* NOTIFICATIONS */}
      <NavPanelItem
        as="dropdown"
        label=""
        jrkey="notifications"
        to="/notifications"
        direction="left"
        header="Notifications"
        icon={
          <Icon name="bell">
            {hazUnreadActivities.length > 0 && (
              <Label color="red" circular size="mini" floating empty style={{ top: '20%', left: '75%' }} />
            )}
          </Icon>
        }
      >
        {renderNotifications(activity)}
      </NavPanelItem>

      {/* PROFILE */}
      <NavPanelItem
        as="dropdown"
        jrkey="user"
        to={`/u/${username}`}
        header={username}
        direction="left"
        icon={<Image key="avatar" avatar centered src={_.get(currUser, 'profile.avatar', '')} />}
      >
        <NavPanelOption key="myProfile" label="My Profile" icon="user" to={`/u/${username}`} />
        <NavPanelOption key="myBadges" label="My Badges" icon="trophy" to={`/u/${username}/badges`} />
        <NavPanelOption key="myGames" label="My Games" icon="gamepad" to={`/u/${username}/games`} />
        <NavPanelOption key="mySkills" label="My Skils" icon="plus circle" to={`/u/${username}/skilltree`} />
        <NavPanelOption key="logout" label="Logout" icon="sign out" onClick={_doLogout} />
      </NavPanelItem>
    </Menu.Menu>
  )
}

const RightItemsNotLoggedIn = () => (
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

const NavPanel = props => {
  return (
    <Menu icon={false} inverted borderless style={menuStyle} id="mgbjr-np">
      <Menu.Menu icon="home">
        {/* MGB LOGO */}
        <NavPanelItem
          as="dropdown"
          jrkey="mgb"
          icon={<Image src="/images/logos/mgb/medium/01w.png" style={logoImageStyle} />}
          to="/"
        >
          <NavPanelOption label="What's New" to="/whats-new" key="whatsNew" icon="gift" />
          <NavPanelOption label="Road Map" to="/roadmap" key="roadmap" icon="road" />
        </NavPanelItem>

        {/* LEARN */}
        <NavPanelItem label="Learn" as="dropdown" jrkey="learn" to="/learn">
          <NavPanelOption label="Get Started" key="getStarted" icon="rocket" iconColor="yellow" to="/learn" />
          <NavPanelOption label="Code" key="learnCode" icon="code" iconColor="black" to="/learn/code" />
          <NavPanelOption
            label="All Skills"
            key="learnSkills"
            icon="student"
            iconColor="green"
            to="/learn/skills"
          />
        </NavPanelItem>
        {/* PLAY */}
        <NavPanelItem label="Play" as="dropdown" jrkey="play" to="/games">
          <NavPanelOption
            label="Loved Games"
            key="lovedGames"
            icon="heart"
            iconColor="red"
            to="/games"
            toOptions={{ sort: 'loves' }}
          />
          <NavPanelOption
            label="Popular Games"
            key="popularGames"
            icon="gamepad"
            iconColor="blue"
            to="/games"
            toOptions={{ sort: 'plays' }}
          />
          <NavPanelOption
            label="Updated Games"
            key="updatedGames"
            icon="gamepad"
            iconColor="green"
            to="/games"
            toOptions={{ sort: 'edited' }}
          />
        </NavPanelItem>

        {/* MEET */}
        <NavPanelItem as="dropdown" label="Meet" jrkey="meet" to="/users">
          <NavPanelOption label="All Users" key="allUsers" icon="users" to="/users" />
          <NavPanelOption
            label="Public Chat"
            key="publicChat"
            icon="chat"
            to="/users"
            toOptions={{ _fp: 'chat.G_GENERAL_' }}
          />
        </NavPanelItem>
      </Menu.Menu>

      {/* RIGHT HAND ITEMS BELOW*/}
      {Meteor.user() ? RightItemsLoggedIn(props) : RightItemsNotLoggedIn(props)}
    </Menu>
  )
}

export default NavPanel

// Old hour of code code.
//TODO: Needs to be reintegrated at some point to support hour of code users?

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
