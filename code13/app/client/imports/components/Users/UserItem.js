import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import { utilPushTo } from '/client/imports/routes/QLink';

// These can be rendered as attached segments so the caller can easily place/attach buttons around it
// See http://v2.mygamebuilder.com/assetEdit/2Bot4CwduQRfRWBi6 for an example
export default UserItem = React.createClass({

  propTypes: {
    _id: PropTypes.string,            // The user id
    name: PropTypes.string,           // The user name
    avatar: PropTypes.string,         // User's avatar image src   
    profileTitle: PropTypes.string,
    profileBio: PropTypes.string,
    profileFocusMsg: PropTypes.string,    
    profileFocusStart: PropTypes.object,   // Actually a Date() object
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
      utilPushTo(this.context.urlLocation.query, `/u/${this.props.name}`)
  },
  
  render: function() {
    const { name, avatar, createdAt, renderAttached, profileTitle, profileBio, profileFocusMsg, profileFocusStart } = this.props
    const createdAtFmt = moment(createdAt).format('MMMM DD, YYYY')
    const segClass = renderAttached ? "ui attached clearing segment" : "ui raised clearing segment"
    return (
      <div className={segClass} onClick={this.handleClickUser}>
        <div className="ui header huge">{name}</div>
        <img src={avatar} className="ui floated image tiny" />
        { profileTitle &&
          <big><i className="quote left icon blue"></i>{profileTitle}<i className="quote right icon blue"></i></big>
        }
        <p><font color="lighblue">Joined {createdAtFmt}</font></p>
        <i className="birthday icon big red"></i>
        <i className="paint brush icon big orange"></i>
        <i className="trophy icon big blue"></i>
        <i className="unhide icon big purple"></i>
      </div>
    );
  }
})
