import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, NotFoundRoute, browserHistory } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'

import App from './App';
import Home from './Home';
import Users from './Users';
import Azzets from './Assets';
import Projects from './Projects';

import NotFoundPage from './NotFoundPage';
import urlMaker from './urlMaker';
import WhatsNewRoute from './WhatsNewRoute';


// To understand this file...
// Overview article: https://css-tricks.com/learning-react-router/
// Route matching: https://github.com/reactjs/react-router/blob/master/docs/guides/RouteMatching.md 

// Conventions for this MGB site are encoded in /imports/routes/urlMaker.js
// MAINTAIN: Keep paths here in sync with imports/routes/urlMaker.js

// MAINTAIN: Nav.js and App.js expect the various :params to have a consistent naming convention:
//   :id          Must always be the :param name for the _id of the User whose stuff we are looking at (assets, profile etc)
//   :assetId     Must always be the :param name for the _id of the Asset which is our edit focus
//   :projectId   Must always be the :param name for the _id of the Project which is our scoped focus

const history = createBrowserHistory()

Meteor.startup(function () {
  const router = 
    <Router history={browserHistory}>
      <Route component={App}>
        <Route path="/" component={Home} />
        <Route path="/whatsnew" component={WhatsNewRoute} name="What's New" />

        <Route path="join" component={Users.Join} name="Sign up" />
        <Route path="signin" component={Users.SignIn} name="Sign In" />
        <Route path="forgot-password" component={Users.ForgotPassword} name="Forgot Password" />
        <Route path="reset-password/:token" component={Users.ResetPassword} name="Reset Password" />

        <Route path="users" component={Users.List} name="Search All Users" />
        <Route path="user/:id" component={Users.Profile} name="User Profile"/>
        <Route path="user/:id/assets" component={Azzets.UserAssetList} name="Assets" />
        <Route path="user/:id/asset/:assetId" component={Azzets.AssetEdit} name="Asset" />
        <Route path="user/:id/projects" component={Projects.UserProjectList} name="Projects" />
        <Route path="user/:id/project/:projectId" component={Projects.ProjectOverview} name="Project Overview" />
        <Route path="assets" component={Azzets.UserAssetList} name="Search All Assets" />

        // This route will redirect to user/:id/asset/:assetId once it gets the owner User id from the asset
        <Route path="assetEdit/:assetId" component={Azzets.AssetEdit} name="Edit Asset (stale route)" />        
 
        <Route path="*" component={NotFoundPage} name="Page Not Found"/>
      </Route>
    </Router>
    
  urlMaker.setKnownRoutes(router)
  ReactDOM.render(router, document.getElementById('root'))    
});
