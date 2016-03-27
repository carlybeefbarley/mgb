import React, { Component, PropTypes } from 'react';
import {History} from 'react-router';
import reactMixin from 'react-mixin';
import UserCard from './UserCard';
import UserForms from './UserForms.js';

// TODO: This needs COMPLETE REDO. DOES NOT WORK, WILL NOT WORK.

export default  EditProfileRoute = React.createClass({
  mixins: [History],
  propTypes: {
    user: React.PropTypes.object,
    email: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      emailFormSuccess: "",
      emailFormError: "",
      profileFormSuccess: "",
      profileFormError: "",
      passwordFormSuccess: "",
      passwordFormError: "",
      showSpinner: false,
      uploadingMsg: "Upload a new profile image:",
      errors: {},
      values: {}
    }
  },

  render: function() {
    //Laying out inputs of all 3 separate forms
    const profileInputs = ["name", "title", "bio"];
    const emailInput = ["email"];
    const resetPasswordInput = ["oldPassword", "password"];

    //individual input values/errors from form decorator
    const values = this.state.values;
    const errors = this.state.errors;

    //for the user card. Email doesn't display as it's obfuscated
    //so no need to tie it to editing values.
    const user = this.props.user;
    const email = this.props.email;

    //for displaying user's images and changing main profile pic
    let otherImages = []
    if (user.profile.images) {
      otherImages = user.profile.images.map((image, i) => {
        return (
          <img key={i} src={image} className={styles.imageList} onClick={this.handleSetProfilePic(image)} width="100px" />
        );
      })
    }


    return (
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Edit Profile</h1>
        <div className={styles.grid}>
          <div className={styles.column}>
            <div className={styles.card}>

              <UserCard
                _id={user._id}
                name={values.name}
                avatar={user.profile.avatar}
                title={values.title}
                bio={values.bio}
                createdAt={user.createdAt}
                email={email}
                makeClickable={false} />

            </div>
          </div>
          <div className={styles.column}>
            <h4 className={styles.subtitle}>Update Info</h4>

            <UserForms
              buttonText="Update Profile"
              inputsToUse={profileInputs}
              inputState={this.props.inputState}
              formError={this.state.profileFormError}
              formSuccess={this.state.profileFormSuccess}
              handleChange={this.props.handleChange}
              handleSubmit={this.handleProfileSubmit} />

          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h4 className={styles.subtitle}>Change Email Address</h4>

            <UserForms
              buttonText="Change Email"
              inputsToUse={emailInput}
              inputState={this.props.inputState}
              formError={this.state.emailFormError}
              formSuccess={this.state.emailFormSuccess}
              handleChange={this.props.handleChange}
              handleSubmit={this.handleEmailSubmit} />

          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h4 className={styles.subtitle}>Change Password</h4>

            <UserForms
              buttonText="Change Password"
              inputsToUse={resetPasswordInput}
              inputState={this.props.inputState}
              formError={this.state.passwordFormError}
              formSuccess={this.state.passwordFormSuccess}
              handleChange={this.props.handleChange}
              handleSubmit={this.handlePasswordSubmit} />

          </div>

        </div>
      </div>
    )
  },

  componentDidMount: function() {
    const user = this.props.user;
    const email = this.props.email;
    const data = {
      name: user.profile.name,
      bio: user.profile.bio,
      title: user.profile.title,
      email: email
    }
    //sets default values in handle forms decorators
    this.props.setDefaultValues(data);
  },

  handlePasswordSubmit: function(event, errors, values, userId) {
    event.preventDefault();
    const {oldPassword, password} = values;

    if (errors.oldPassword || errors.password) {
      // TODO - some kind of indication of failure
      return false;
    }

    Accounts.changePassword(oldPassword, password, (error) => {
      if (error) {
        //If there's no existing password set (like when user signed up with facebook/twitter), hard set the password
        if (error.reason == 'User has no password set') {
          Meteor.call('User.setPasswordIfDoesNotExsit', this.props.user._id, password);
        } else {
          this.setState({
            passwordFormError: error.reason
          });
        }
      } else {
        this.setState ({
          passwordFormError: "",
          passwordFormSuccess: "Success! Your password has been changed."
        });
      }
    });
  },

  handleEmailSubmit: function(event, errors, values) {
    event.preventDefault();
    const {email} = values;

    if (errors.email) {
      return false;
    }

    Meteor.call('User.updateEmail', this.props.user._id, {"emails": {address : email, verified: false}}, (error,result) => {
      if (error) {
        this.setState({
          emailFormError: error.reason
        });
      } else {
        this.setState({
          emailFormError: "",
          emailFormSuccess: "Success! Your profile has been updated."
        });
      }
    });
  },

  handleProfileSubmit: function(event, errors, values) {
    event.preventDefault();
    const {name, bio, title} = values;

    if (errors.name || errors.bio || errors.title) {
      return false;
    }

    Meteor.call('User.updateProfile', this.props.user._id, {
      "profile.name": name,
      "profile.title": title,
      "profile.bio": bio
    }, (error,result) => {
      if (error) {
        this.setState({
          profileFormError: error.reason
        });
      } else {
        this.setState({
          profileFormError: "",
          profileFormSuccess: "Success! Your profile has been updated."
        });
      }
    });
  },

  handleSetProfilePic: function(image) {
    Meteor.call('User.setProfileImage', image);
  },

  handleUpload: function() {

    this.setState({
      uploadingMsg: "Uploading...",
      showSpinner: true
    });
    const uploader = new Slingshot.Upload("userImages");

    uploader.send(this.refs.editUserImages.refs.imageUpload.refs.fileInput.files[0], (error, downloadUrl) => {
      if (error) {
        console.error('Error uploading', error);
        this.setState({
          uploadingMsg: "Sorry, there was an error. Please try again later",
          showSpinner: false
        });
      } else {
        Meteor.call('User.storeProfileImage', downloadUrl);
        this.setState({
          uploadingMsg: "Success!",
          showSpinner: false
        });
      }
    });
  }
})
