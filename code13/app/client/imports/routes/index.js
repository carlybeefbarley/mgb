import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link, NotFoundRoute, browserHistory } from 'react-router'

import App from './App'
import Home from './Home'
import Home_Z2 from './Home_Z2'
import GetStarted_Z2 from './GetStarted_Z2'
import Users from './Users'
import Azzets from './Assets'
import Projects from './Projects'

import NotFoundPage from './NotFoundPage'
import urlMaker from './urlMaker'
import WhatsNewRoute from './WhatsNewRoute'
import Roadmap from './Roadmap'


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
// 2) The /assetEdit/:assetId route  is legacy - it  will redirect to user/:id/asset/:assetId once it gets the owner User id from the asset


Meteor.startup(function () {
  const router =
    <Router  history={browserHistory}>
      <Route component={App}>
        <Route path="/" component={Home} />
        <Route path="/Home_Z2" component={Home_Z2} />
        <Route path="/whatsnew" component={WhatsNewRoute} name="What's New" />
        <Route path="/roadmap" component={Roadmap} name="Roadmap" />

        <Route path="/getstarted_Z2" component={GetStarted_Z2} />

        <Route path="join" component={Users.Join} name="Sign up" />
        <Route path="signin" component={Users.SignIn} name="Sign In" />
        <Route path="forgot-password" component={Users.ForgotPassword} name="Forgot Password" />
        <Route path="reset-password/:token" component={Users.ResetPassword} name="Reset Password" />

        <Route path="users" component={Users.List} name="Search All Users" />

        <Route path="user/:id" component={Users.Profile} name="User Profile"/>
        <Route path="u/:username" component={Users.Profile} name="User Profile"/>

        <Route path="user/:id/assets" component={Azzets.UserAssetList} name="Assets" />
        <Route path="u/:username/assets" component={Azzets.UserAssetList} name="Assets" />

        <Route path="user/:id/asset/:assetId" component={Azzets.AssetEdit} name="Asset Editor" />
        <Route path="u/:username/asset/:assetId" component={Azzets.AssetEdit} name="Asset Editor" />

        <Route path="user/:id/projects" component={Projects.UserProjectList} name="User's Projects" />
        <Route path="u/:username/projects" component={Projects.UserProjectList} name="User's Projects" />

        <Route path="user/:id/projects/create" component={Projects.ProjectCreateNewRoute} name="Create New Project" />
        <Route path="u/:username/projects/create" component={Projects.ProjectCreateNewRoute} name="Create New Project" />

        <Route path="user/:id/project/:projectId" component={Projects.ProjectOverview} name="Project Details" />
        <Route path="u/:username/project/:projectId" component={Projects.ProjectOverview} name="Project Details" />

        <Route path="user/:id/history" component={Users.UserHistory} name="User's History" />
        <Route path="u/:username/history" component={Users.UserHistory} name="User's History" />

        <Route path="user/:id/badges" component={Users.BadgeList} name="User's Badges" />
        <Route path="u/:username/badges" component={Users.BadgeList} name="User's Badges" />

        <Route path="assets" component={Azzets.UserAssetList} name="Search All Assets" />
        <Route path="assets/create" component={Azzets.AssetCreateNewRoute} name="Create New Asset" />

        <Route path="assetEdit/:assetId" component={Azzets.AssetEdit} name="Edit Asset (find owner)" />

        <Route path="user/:id/skilltree" component={Users.SkillTreePage} name="Skill Tree" />
        <Route path="u/:username/skilltree" component={Users.SkillTreePage} name="Skill Tree" />

        <Route path="*" component={NotFoundPage} name="Page Not Found"/>
      </Route>
    </Router>

  urlMaker.setKnownRoutes(router)
  ReactDOM.render(router, document.getElementById('root'))
})
