import React, {PropTypes} from 'react';
import {History} from 'react-router';
import reactMixin from 'react-mixin';

export default SocialAuth = React.createClass({
  mixins: [History],
  propTypes: {
    type: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      type: 'Join'
    };
  },

  render: function() {
    return null;  // disabled for now
    // return (
    //     <div>
    //       <button className="ui button" type="button" onClick={this.handleFacebook} >{this.props.type} with Facebook <i className="fa fa-facebook fa-lg"></i></button><br />
    //       <button className="ui button" type="button" onClick={this.handleGoogle} >{this.props.type} with Google <i className="fa fa-google fa-lg"></i></button><br />
    //       <button className="ui button" type="button" onClick={this.handleTwitter} >{this.props.type} with Twitter <i className="fa fa-twitter fa-lg"></i></button>
    //     </div>
    // );
  },

  handleFacebook: function() {
    Meteor.loginWithFacebook ({
        requestPermissions: ['email']
      }, (error) => {
        if (error) {
          this.setState({
            errors: { 'facebook': error.reason }
          });
        } else {
           this.history.pushState(null, `/user/${Meteor.user()._id}`);
        }
    });
  },

  handleGoogle: function() {
    Meteor.loginWithGoogle({
      requestPermissions: ['email']
    }, (error) => {
      if (error) {
        this.setState({
          errors: { 'google': error.reason }
        });
      } else {
         this.history.pushState(null, `/user/${Meteor.user()._id}`);
      }
    });
  },

  handleTwitter: function() {
    Meteor.loginWithTwitter((error) => {
      if (error) {
        this.setState({
          errors: { 'twitter': error.reason }
        });
      } else {
        this.history.pushState(null, `/user/${Meteor.user()._id}`);
      }
    });

  }
})
