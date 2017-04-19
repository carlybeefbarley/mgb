import React from 'react'
import ReactDOM from 'react-dom'
import Callum from './Callum'

import {Router, Route, browserHistory} from 'react-router'
import urlMaker from './urlMaker'

import App from './App'
import Home from './Home'
import Import from './Import'
import PlayGameRoute from './PlayGameRoute'
import BrowseGamesRoute from './BrowseGamesRoute'
import DashboardRoute from './Dashboard/DashboardRoute'

import LearnRoute from './Learn/LearnRoute'
import LearnGamesRoute from './Learn/LearnGamesRoute'
import LearnSkillsRoute from './Learn/LearnSkillsRoute'
import LearnSkillsAreaRoute from './Learn/LearnSkillsAreaRoute'
import LearnGetStartedRoute from './Learn/LearnGetStartedRoute'

import LearnCodeRoute from './Learn/LearnCodeRoute'
import LearnCodeRouteItem from './Learn/LearnCodeRouteItem'
import LearnCodeModifyRoute from './Learn/LearnCodeModifyRoute'

import LearnArtRoute from './Learn/LearnArtRoute'

import Users from './Users'
import Azzets from './Assets'
import Projects from './Projects'

import NotYetImplementedRoute from './Nav/NotYetImplementedRoute'
import NotFoundRoute from './Nav/NotFoundRoute'
import WhatsNewRoute from './Nav/WhatsNewRoute'
import Roadmap from './Nav/RoadmapRoute'

import TermsOfService from '/client/imports/legal/TermsOfService'
import Privacy from '/client/imports/legal/Privacy'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

// To understand this file...
// Overview article: https://css-tricks.com/learning-react-router/
// Route matching: https://github.com/reactjs/react-router/blob/master/docs/guides/RouteMatching.md

// Conventions for this MGB site are encoded in /client/imports/routes/urlMaker.js
// MAINTAIN: Keep paths here in sync with /client/imports/routes/urlMaker.js

// MAINTAIN: Nav.js and App.js expect the various :params to have a consistent naming convention:
//   :id          (LEGACY) Must always be the :param name for the _id of the User whose stuff we are looking at (assets, profile etc)
//   :username    Must always be the :param name for the profile.name of the User whose stuff we are looking at (assets, profile etc)
//   :assetId     Must always be the :param name for the _id of the Asset which is our edit focus
//   :projectId   Must always be the :param name for the _id of the Project which is our scoped focus

// LEGACY ROUTES (to be removed soon, once replacement routes seem stable)
// 1) All /users/:id are legacy and shoudl be removed soon (superceded July 6 2016)
// 2) The /assetEdit/:assetId route is legacy - it will automatically redirect to user/:id/asset/:assetId once it gets the owner User._id from the Asset

// We also export it for potential future use by some of the fast-build variants like storybook...

const knownRoutes = [
  {path: '/callum', component: Callum},
  {
    component: App, routes: [
      {path: '/', component: Home},
      {path: '/u/:username/play/:assetId', component: PlayGameRoute, name: 'Play Game'},
      {path: '/whatsnew', component: WhatsNewRoute, name: 'What\'s New'},
      {path: '/roadmap', component: Roadmap, name: 'Roadmap'},
      {path: '/dashboard', component: DashboardRoute, name: 'Dashboard'},

      {path: '/learn', component: LearnRoute},
      {path: '/learn/skills', component: LearnSkillsRoute},
      {path: '/learn/skills/:skillarea', component: LearnSkillsAreaRoute},
      {path: '/learn/games', component: LearnGamesRoute},
      {path: '/learn/getstarted', component: LearnGetStartedRoute, name: 'Get Started'},

      {path: '/learn/code', component: LearnCodeRoute, name: 'Programming'},
      {path: '/learn/code/modify', component: LearnCodeModifyRoute, name: 'Modify Games'},
      {path: '/learn/code/:item', component: LearnCodeRouteItem},

      {path: '/learn/art', component: LearnArtRoute, name: 'Pixel Art'},
      {path: '/games', component: BrowseGamesRoute, name: 'Browse Games'},
      {path: '/u/:username/games', component: BrowseGamesRoute, name: 'Games'},

      {path: '/signup', component: Users.SignupRoute, name: 'Sign up'},
      {path: '/login', component: Users.LoginRoute, name: 'Log In'},
      {path: '/forgot-password', component: Users.ForgotPassword, name: 'Forgot Password'},
      {path: '/reset-password/:token', component: Users.ResetPassword, name: 'Reset Password'},

      {path: '/users', component: Users.UserListRoute, name: 'Search All Users'},
      {path: 'u/:username/import', component: Import},
      {path: 'user/:id', component: Users.Profile, name: 'Profile'},
      {path: 'u/:username', component: Users.Profile, name: 'Profile'},


      {path: '/user/:id/assets', component: Azzets.UserAssetListRoute, name: 'Assets'},
      {path: '/u/:username/assets', component: Azzets.UserAssetListRoute, name: 'Assets'},

      {path: '/user/:id/asset/:assetId', component: Azzets.AssetEditRoute, name: 'Loading asset...'},
      {path: '/u/:username/asset/:assetId', component: Azzets.AssetEditRoute, name: 'Loading asset...'},

      {path: 'user/:id/projects', component: Projects.UserProjectList, name: 'Projects'},
      {path: 'u/:username/projects', component: Projects.UserProjectList, name: 'Projects'},

      {path: '/user/:id/projects/create', component: Projects.ProjectCreateNewRoute, name: 'Create New Project'},
      {path: 'u/:username/projects/create', component: Projects.ProjectCreateNewRoute, name: 'Create New Project'},

      {path: 'user/:id/project/:projectId', component: Projects.ProjectOverview, name: 'Project Details'},
      {path: 'u/:username/projects/:projectName', component: Projects.ProjectOverview, name: 'Project Details'},
      {path: 'u/:username/project/:projectId', component: Projects.ProjectOverview, name: 'Project Details'},

      {path: '/user/:id/history', component: Users.UserHistoryRoute, name: 'History'},
      {path: 'u/:username/history', component: Users.UserHistoryRoute, name: 'History'},

      {path: '/user/:id/badges', component: Users.BadgeListRoute, name: 'Badges'},
      {path: '/u/:username/badges', component: Users.BadgeListRoute, name: 'Badges'},

      {path: '/projects', component: Projects.UserProjectList, name: 'Search All Projects'},
      {path: '/assets', component: Azzets.UserAssetListRoute, name: 'Search All Assets'},
      {path: '/assets/create', component: Azzets.AssetCreateNewRoute, name: 'Create New Asset'},


      {path: 'assetEdit/:assetId', component: Azzets.AssetEditRoute, name: 'Edit Asset (finding owner...)'},
      {path: 'assetEdit/:kind/:user/:name', component: Azzets.AssetEditRedirect, name: 'Edit Asset (finding owner...)'},


      {path: 'user/:id/skilltree', component: Users.SkillTreeRoute, name: 'Skills'},
      {path: 'u/:username/skilltree', component: Users.SkillTreeRoute, name: 'Skills'},

      {path: '/legal/tosDRAFT', component: TermsOfService, name: 'Terms Of Service'},
      {path: '/legal/privacyDRAFT', component: Privacy, name: 'Privacy Policy'},

      {path: '/notyetimplemented/:featureName', component: NotYetImplementedRoute, name: 'Coming Soon!..'},

      {path: '*', component: NotFoundRoute, name: 'Page Not Found'}
    ]
  }
]


const createRoutes = (routes) => {
  const retval = []
  for (let i = 0; i < routes.length; i++) {

    const cr = routes[i].routes ? createRoutes(routes[i].routes) : []
    const r = <route {...routes[i]}>{cr}</route>
    retval.push(r)
  }
  return retval
}

export function clientStartup() {
  const routes = createRoutes(knownRoutes)
  const router = <Router history={browserHistory}>{routes}</Router>

  registerDebugGlobal('router', router, __filename, 'TopLevel react-router instance')
  urlMaker.setKnownRoutes(router)
  return router
}

Meteor.startup(function () {
  const router = clientStartup()
  ReactDOM.render(router, document.getElementById('root'))
})
