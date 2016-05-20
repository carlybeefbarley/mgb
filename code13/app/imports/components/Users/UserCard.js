import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import {browserHistory} from 'react-router';
import InlineEdit from 'react-edit-inline';


export default UserProfile = React.createClass({
  propTypes : {
    user: PropTypes.object,
    makeClickable: PropTypes.bool,
    name: PropTypes.string,
    bio: PropTypes.string,
    title: PropTypes.string,
    canEditProfile: PropTypes.bool,
    handleProfileFieldChanged: PropTypes.func
//    createdAt: PropTypes.date
  },  
  
  getDefaultProps: function() {
    return {
      canEditProfile: false
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
    const createdAt = this.props.createdAt
    const editsDisabled = !this.props.canEditProfile
    
    return (
      <div className="ui card" 
           onClick={this.props.makeClickable ? browserHistory.push(`/user/${this.props.user._id}`) : ''}>
        <div className="ui image">
          <img src={this.props.avatar} />
        </div>
        <div className="ui content">
          <div className="ui header">{this.props.name}</div>
          <div className="ui meta">
            
            <b>Title:</b> <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={this.props.title ? this.props.title: "(no title)"}
              paramName="profile.title"
              change={this.profileFieldChanged}
              isDisabled={editsDisabled}
              />
            
          </div>
          <div className="ui description">
            <b>Description:</b> <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={this.props.bio ? this.props.bio: "(no description)"}
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
