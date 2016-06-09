import React, { PropTypes } from 'react';
import moment from 'moment';
import { utilPushTo } from '../../routes/QLink';


// These can be rendered as attached segments so the caller can easily place/attach buttons around it
// See http://v2.mygamebuilder.com/assetEdit/2Bot4CwduQRfRWBi6 for an example
export default UserItem = React.createClass({

  propTypes: {
    _id: PropTypes.string,            // The user id
    name: PropTypes.string,           // The user name
    avatar: PropTypes.string,         // User's avatar image src   
    handleClickUser: PropTypes.func,  // Optional. If provided, call this with the userId instead of going to the user Profile Page
    renderAttached: PropTypes.bool    // if true, then render attached
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },
    
  handleClickUser: function() {
    let uid = this.props._id
    if (this.props.handleClickUser)
      this.props.handleClickUser(uid, this.props.name)
    else
      utilPushTo(this.context.urlLocation.query, `/user/${uid}`)
  },
  
  render: function() {
    const createdAt = moment(this.props.createdAt).format('MMMM DD, YYYY')
    const segClass = this.props.renderAttached ? "ui attached segment" : "ui raised segment"
    return (
      <div  className={segClass}
            onClick={this.handleClickUser}>
        <a className="ui blue ribbon label">{this.props.name}</a>
        <img src={this.props.avatar} className="ui right floated avatar image" />
        <p>
          <small>
            Joined {createdAt}
          </small>
        </p>
      </div>
    );
  }
})
