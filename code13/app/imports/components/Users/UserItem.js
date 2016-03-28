import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import reactMixin from 'react-mixin';
import {History} from 'react-router';

export default UserItem = React.createClass({
  mixins: [History],
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
                    () => this.history.pushState(null, `/users?id=${this.props._id}`) :
                    () => this.history.pushState(null, `/user/${this.props._id}`)}>

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
