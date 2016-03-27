import React, { Component, PropTypes } from 'react';
import {History} from 'react-router';
import reactMixin from 'react-mixin';
import {handleForms} from '../../components/Forms/FormDecorator';
import UserForms from '../../components/Users/UserForms.js';

export default ResetPasswordRoute = React.createClass({
  mixins: [History],
  propTypes: {
     params: PropTypes.object
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
        this.props.showToast('Coudl not reset password', 'error')
        return;
      } else {
        this.props.showToast('Success! Your password has been reset.     Redirecting...', 'success')
        window.setTimeout(() => {
          this.history.pushState(null, `/`);
        }, 1000);
      }
    });
  }
})