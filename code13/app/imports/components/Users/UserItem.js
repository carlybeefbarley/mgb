import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import {browserHistory} from 'react-router';


export default UserItem = React.createClass({

  propTypes: {
    clickPreview: PropTypes.bool,
    name: PropTypes.string,
    email: PropTypes.string,
  },
  
  defaultProps: {
    clickPreview: false
  },

  render: function() {
    const createdAt = this.props.createdAt;
    return (
      <div  className="ui raised segment"
            onClick={this.props.clickPreview ?
                    () => browserHistory.push(`/users?id=${this.props._id}`) :
                    () => browserHistory.push(`/user/${this.props._id}`)}>

        <a className="ui blue ribbon label">{this.props.name}</a>
        <img src={this.props.avatar} className="ui right floated avatar image" />
        <p>
          <small>
            Joined {moment(createdAt).format('MMMM DD, YYYY')}
          </small>
        </p>
      </div>
    );
  }
})
