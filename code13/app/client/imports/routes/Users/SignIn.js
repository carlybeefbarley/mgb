import _ from 'lodash';
import React, { Component } from 'react';
import { utilPushTo } from '../QLink';

import {handleForms} from '/client/imports/components/Forms/FormDecorator';
import UserForms from '/client/imports/components/Users/UserForms.js';
import AuthLinks from '/client/imports/components/Users/AuthLinks.js';
import SocialAuth from '/client/imports/components/Users/SocialAuth';
import {logActivity} from '/imports/schemas/activity';

export default  SignInRoute = React.createClass({
  
  getInitialState: function()
  {
    return {
      errors: {},
      values: {}
    }
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  render: function() {
    const inputsToUse = ["email", "password"];
    const linksToUse = ["join", "forgot"];

    return (
      <div className="ui text container">
      <br></br>
        <div className="ui padded segment">
          <h2>Get Started!</h2>

          {
            /* 
              <SocialAuth type="Login" />

              <div className="ui horizontal divider">OR</div>
             */
          }
          
          <UserForms
            buttonText="Login"
            inputsToUse={inputsToUse}
            inputState={this.state}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit} />

          <AuthLinks linksToUse={linksToUse} />
        </div>
      </div>
    )
  },

  componentDidMount: function() {
    window.onkeydown = this.listenForEnter;
  },
  
  throttledSetErrorState: function(newError) {
    this.setState({ errors: newError });
  },


  listenForEnter: function(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      this.handleSubmit(e, this.state.errors, this.state.values);
    }
  },
  
  handleChange: function(event) {
    
    //Stripe cautions against using name attributes, so to avoid them hitting
    //the server, using data-name instead. Can change in InputStacked.js
    let name = event.target.getAttribute('data-name');
    let value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    } else if (event.target.type === 'select') {
      value = event.target.selected;
    } else {
      value = event.target.value;
    }

    //this is to merge existing value state rather than replace it with setstate.
    //can also be done with react addons or an immutability package I believe.
    let newValue = _.extend({}, this.state.values);
    newValue[name] = value;
    this.setState({ values: newValue });

    //this returns something like 'password' or 'email' or whatever you passed
    let validateType = event.target.getAttribute('data-validateby');

    if (validateType) {
      //Calls appropriate validator and passes the form input value
      let error = this[validateType](value);

      //Merges new error with existing error state
      let newError = _.extend({}, this.state.errors);
      newError[name] = error;

      this.throttledSetErrorState(newError);
    }
  
  },
  

  handleSubmit: function() {
    const {errors, values} = this.state;
    const {email, password} = values;

    //if errors showing don't submit
    if (_.some(errors, function(str){ return str !== '' && str !== undefined; })) {
      this.props.showToast('You have errors showing', 'error')
      return false;
    }
    //if any values missing showing don't submit
    if (Object.keys(values).length < 2) {
      this.props.showToast('Please fill out all fields', 'error')
      return false;
    }

    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        this.props.showToast(error.reason, 'error')
        return;
      } else {
        var userName = Meteor.user().profile.name
        logActivity("user.login",  `Logging in "${userName}"`, null, null);         
        this.props.showToast('Welcome Back!   Taking you to your Assets', 'success')
        window.setTimeout(() => {
          utilPushTo(this.context.urlLocation.query, `/u/${userName}/assets`)
        }, 2000);
      }
    });
  },
  
  // Validators:
  
  password: function(value) {
    if (!value) {
      return ('Password must be at least 6 digits');
    }
    if (value.length < 6) {
      return ('Password must be at least 6 digits');
    }
    if (value.search(/[a-z]/i) < 0) {
      return ('Your password must contain at least one letter');
    }
    if (value.search(/[0-9]/) < 0) {
      return ('Your password must contain at least 1 number');
    }
    return '';
  },
  
  email: function (value) {
    if (value.search(/[^\s@]+@[^\s@]+\.[^\s@]+/) < 0) {
      return ('Doesn\'t look like a valid email');
    }
    return '';
  },
})