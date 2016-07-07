import React from 'react';
import { utilPushTo } from '../QLink';
import UserForms from '../../components/Users/UserForms.js';
import AuthLinks from '../../components/Users/AuthLinks.js';
import md5 from 'blueimp-md5';
import SocialAuth from '../../components/Users/SocialAuth';
import {logActivity} from '../../schemas/activity';


export default JoinRoute = React.createClass({

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  getInitialState: function() {    
    return {
      errors: {},
      values: {}
    };
  },
  
   // throttles errors from showing up too fast when typing.
  componentWillMount: function() {
    this.throttledSetErrorState = _.debounce(this.throttledSetErrorState, 500);
  },
  
  componentDidMount() {
    window.onkeydown = this.listenForEnter;   // TODO: remove event listener
  },

  throttledSetErrorState: function(newError) {
    this.setState({ errors: newError });
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

  render: function() {

    const inputsToUse = ["email", "name", "password", "confirm"];
    const linksToUse = ["signin", "forgot"];

    return (
      <div className="ui text container">
        <div className="ui padded segment">
          <h2 className="ui title">Get Started!</h2>

          { 
            /* 
              <SocialAuth />
              <div className="ui horizontal divider">OR</div>
             */
          }
          <UserForms
            buttonText="Join with Email"
            inputsToUse={inputsToUse}
            inputState={this.state}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit} />

          <AuthLinks linksToUse={linksToUse} />
        </div>
      </div>
    )
  },
  
  //validators below
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

  confirmPassword: function(value) {
    if (value !== this.state.values.password) {
      return ('Passwords must match');
    }
    return '';
  },

  required: function(value) {
    if (value.length < 1) {
      return ('Can\'t be blank');
    }
    return '';
  },

  isNumber: function(value) {
    if (isNaN(value) || !value) {
      return ('Must be a number');
    }
    return '';
  },

  email: function (value) {
    if (value.search(/[^\s@]+@[^\s@]+\.[^\s@]+/) < 0) {
      return ('Doesn\'t look like a valid email');
    }
    return '';
  },
  
  validateName: function (value) {
    if (value.search(/[A-Za-z0-9_]+/) < 0) 
      return ('Only letters, digits and underscores are allowed');
    if (value.length > 12) 
      return ('Max length is 12 characters');
    if (value.length < 3 ) 
      return ('Name must be at least 3 characters');
      
    return '';
  },


  listenForEnter: function(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      this.handleSubmit();
    }
  },

  handleSubmit: function() {
    const values = this.state.values
    const {email, name, password, confirm} = values
    const errors = this.state.errors

    //if errors showing don't submit
    if (_.some(errors, function(str){ return str !== '' && str !== undefined; })) {
      this.props.showToast('You have errors showing', 'error')
      return false;
    }
    //if any values missing showing don't submit
    if (Object.keys(values).length < 3) {
      this.props.showToast('Please fill out all fields', 'error')
      return false;
    }

    let newUserName = name;

    Accounts.createUser({
      email: email,
      password: password,
      profile: {
        name: newUserName,
        avatar: "http://www.gravatar.com/avatar/" + md5(email.trim().toLowerCase()) + "?s=50&d=mm", //actual image picked by user to display
        images: ["http://www.gravatar.com/avatar/" + md5(email.trim().toLowerCase()) + "?s=50&d=mm"] //collection of images in users account
      }
    }, (error, result) => {
      if (error) {
        this.props.showToast(error.reason, 'error')
        return;
      } else {
        logActivity("user.join",  `New user "${newUserName}"`, null, null); 
        this.props.showToast('Welcome!  Taking you to your assets', 'success')
        window.setTimeout(() => {
          utilPushTo(this.context.urlLocation.query, `/u/${Meteor.user().profile.name}/assets`)
        }, 2000);
      }
    });
  }
})
