import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { browserHistory } from 'react-router'

// TODO.. 1. Fix this so it works again
// TODO.. 2. change to use   utilPushTo(this.context.urlLocation.query, ...) instead of browserHistory.push()
const SocialAuth = React.createClass({
  propTypes: {
    type: PropTypes.string,
  },

  getDefaultProps() {
    return {
      type: 'Join',
    }
  },

  render() {
    return null // disabled for now
    // return (
    //     <div>
    //       <button className="ui button" type="button" onClick={this.handleFacebook} >{this.props.type} with Facebook <i className="fa fa-facebook fa-lg"></i></button><br />
    //       <button className="ui button" type="button" onClick={this.handleGoogle} >{this.props.type} with Google <i className="fa fa-google fa-lg"></i></button><br />
    //       <button className="ui button" type="button" onClick={this.handleTwitter} >{this.props.type} with Twitter <i className="fa fa-twitter fa-lg"></i></button>
    //     </div>
    // );
  },

  handleFacebook() {
    Meteor.loginWithFacebook(
      {
        requestPermissions: ['email'],
      },
      error => {
        if (error) {
          this.setState({
            errors: { facebook: error.reason },
          })
        } else {
          // TODO: Can we use /u/${user.profile.name} yet?
          browserHistory.push(`/user/${Meteor.user()._id}`)
        }
      },
    )
  },

  handleGoogle() {
    Meteor.loginWithGoogle(
      {
        requestPermissions: ['email'],
      },
      error => {
        if (error) {
          this.setState({
            errors: { google: error.reason },
          })
        } else {
          // TODO: Can we use /u/${user.profile.name} yet?
          browserHistory.push(`/user/${Meteor.user()._id}`)
        }
      },
    )
  },

  handleTwitter() {
    Meteor.loginWithTwitter(error => {
      if (error) {
        this.setState({
          errors: { twitter: error.reason },
        })
      } else {
        // TODO: Can we use /u/${user.profile.name} yet?
        browserHistory.push(`/user/${Meteor.user()._id}`)
      }
    })
  },
})

export default SocialAuth
