import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import {browserHistory} from 'react-router';
import InlineEdit from 'react-edit-inline';


// This is a User Card which is a card-format version of the User information.
// Originally it was passed specific fields from caller as props, but this becomes
// hard to maintain as we ruse it more, so it waschanged to have a user_ field
// passed in, and to locally decide what fields to use/render within that structure.

export default UserProfile = React.createClass({
  propTypes : {
    user: PropTypes.object.isRequired,
    makeClickable: PropTypes.bool,            // True if we want a simple click-to-jump for the overall card
    canEditProfile: PropTypes.bool,           // True if we want the profile to be editable (i.e the profile owner is the logged in user)
    handleProfileFieldChanged: PropTypes.func // Function callback if fields are changed. e.g. profile.bio: "new text"
  },  
  
  getDefaultProps: function() {
    return {
      canEditProfile: false,
      makeClickable: false
    }
  },

  profileFieldChanged: function(data) {
    // data = { description: "New validated text comes here" }
    // Update your model from here
    console.log(data)
    
    if (this.props.handleProfileFieldChanged)
      this.props.handleProfileFieldChanged({...data})
  },


  customValidateText: function(text) {
    // TODO more safety content checks here
    return (text.length >= 0 && text.length < 64);
  },


  render: function() {
    const createdAt = this.props.user.createdAt
    const editsDisabled = !this.props.canEditProfile
    
    return (
      <div className="ui card" 
           onClick={this.props.makeClickable ? browserHistory.push(`/user/${this.props.user._id}`) : ''}>
        <div className="ui image">
          <img src={this.props.user.profile.avatar} />
        </div>
        <div className="ui content">
          <div className="ui header">{this.props.user.profile.name}</div>
          <div className="ui meta">
            
            <b>Title:</b> <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={this.props.user.profile.title || "(no title)"}
              paramName="profile.title"
              change={this.profileFieldChanged}
              isDisabled={editsDisabled}
              />
            
          </div>
          <div className="ui description">
            <b>Description:</b> <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={this.props.user.profile.bio || "(no description)"}
              paramName="profile.bio"
              change={this.profileFieldChanged}
              isDisabled={editsDisabled}
              />
          </div>
        </div>
        <div className="ui extra content">
            <span className="ui right floated">
              Joined {moment(createdAt).format('MMMM DD, YYYY')}
            </span>
            <span>
              <i className="ui user icon"></i>
            </span>            
          </div>    
      </div>
    );
  }
})
