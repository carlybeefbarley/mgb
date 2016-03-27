import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import reactMixin from 'react-mixin';
import {History} from 'react-router';


export default UserProfile = React.createClass({
  mixins: [History],
  propTypes : {
    makeClickable: PropTypes.bool,
    name: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    title: PropTypes.string,
//    createdAt: PropTypes.date
  },

  render: function() {
    const createdAt = this.props.createdAt;

    return (
      <div className="ui card" 
           onClick={this.props.makeClickable ? this.history.pushState(null, `/user/${this.props.user._id}`) : ''}>
        <div className="ui image">
          <img src={this.props.avatar} />
        </div>
        <div className="ui content">
          <div className="ui header">{this.props.name}</div>
          <div className="ui meta">
            {this.props.title ? this.props.title: "(no title)" }
          </div>
          <div className="ui description">
            {this.props.bio ?  this.props.bio : "(no description)" }
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
