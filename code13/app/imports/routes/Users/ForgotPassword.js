import React, { Component } from 'react';
import {handleForms} from '../../components/Forms/FormDecorator';
import UserForms from '../../components/Users/UserForms.js';

export default class ForgotPasswordRoute extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.listenForEnter = this.listenForEnter.bind(this);
    this.state = {
      errors: {},
      values: {}
    };
  }

  render() {
    const inputsToUse = ["email"];

    return (
      <div >
        <h2>Recover your Password</h2>

        <h6>Enter your email to reset your password</h6>

        <UserForms
          buttonText="Reset my Password"
          inputsToUse={inputsToUse}
          inputState={this.state}
          handleChange={this.props.handleChange}
          handleSubmit={this.handleSubmit} />
      </div>
    )
  }

  componentDidMount() {
    window.onkeydown = this.listenForEnter;
  }

  listenForEnter(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleSubmit();
    }
  }

  handleSubmit() {
    let errors = this.state.errors
    let values = this.state.values

    const {email} = values;

    //if errors showing don't submit
    if (_.some(errors, function(str){ return str !== '' && str !== undefined; })) {
      this.props.showToast('You have errors showing', 'error')
      return false;
    }
    //if any values missing showing don't submit
    if (Object.keys(values).length < 1) {
      this.props.showToast('Please fill out all fields', 'error')
      return false;
    }

    Accounts.forgotPassword({email: email}, (error) => {
      if (error) {
        this.props.showToast(error.reason, 'error')
        return;
      } else {
        this.props.showToast('>Success!  Please check your inbox for the link to finish resetting your password.', 'success')
      }
    });
  }
}
