import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { utilPushTo } from '../QLink';
import {handleForms} from '/client/imports/components/Forms/FormDecorator';
import UserForms from '/client/imports/components/Users/UserForms.js';

export default ResetPasswordRoute = React.createClass({

  propTypes: {
     params: PropTypes.object
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      errors: {},
      values: {}
    };
  },

  render: function() {
    const inputsToUse = ["password", "confirm"];

    return (
      <div>
        <h2>Reset your Password</h2>

        <h6>Enter your new password</h6>

        <UserForms
          buttonText="Reset my Password"
          inputsToUse={inputsToUse}
          inputState={this.state}
          handleChange={this.props.handleChange}
          handleSubmit={this.handleSubmit}
          token={this.props.params.token} />
      </div>
    )
  },

  componentDidMount: function() {
    window.onkeydown = this.listenForEnter;
  },

  listenForEnter: function(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleSubmit();
    }
  },

  handleSubmit: function() {
    let errors = this.state.errors
    let values = this.state.values

    const {password, confirm} = values;

    // if errors showing don't submit
    if (_.some(errors, function(str){ return str !== '' && str !== undefined; })) {
      this.props.showToast('You have errors showing', 'error')
      return false;
    }
    //if any values missing showing don't submit
    if (Object.keys(values).length < 2) {
      this.props.showToast('Please fill out all fields', 'error')
      return false;
    }

    Accounts.resetPassword(this.props.params.token, password, (error) => {
      if (error) {
        this.props.showToast('Could not reset password', 'error')
        return;
      } else {
        this.props.showToast('Success! Your password has been reset.     Redirecting...', 'success')
        window.setTimeout(() => {
          utilPushTo(this.context.urlLocation.query, `/`);
        }, 1500);
      }
    });
  }
})