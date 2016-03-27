import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, NotFoundRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'

import App from './App';
import Home from './Home';
import Users from './Users';
import Azzets from './Assets';

import NotFoundPage from './NotFoundPage';

const history = createBrowserHistory()

Meteor.startup(function () {
    ReactDOM.render(
    <Router history={history}>
      <Route component={App}>
        <Route path="/" component={Home} name="MyGameBuilder v2" />

        <Route path="join" component={Users.Join} name="Get Started" />
        <Route path="signin" component={Users.SignIn} name="Sign In" />
        <Route path="forgot-password" component={Users.ForgotPassword} name="Forgot Password" />
        <Route path="reset-password/:token" component={Users.ResetPassword} name="Reset Password" />


        <Route path="users" component={Users.List} name="Users" />
        <Route path="user/:id" component={Users.Profile} name="User Profile" back="/users" />
        <Route path="user/:id/assets" component={Azzets.UserAssetList} name="Assets" />
        <Route path="assets" component={Azzets.UserAssetList} name="Assets" />

        <Route path="assetEdit/:id" component={Azzets.AssetEdit} name="Edit Asset" back="!user-assets" />

        <Route path="*" component={NotFoundPage} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
});
