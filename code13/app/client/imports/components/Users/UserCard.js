import React, { PropTypes } from 'react'
import moment from 'moment'
import { utilPushTo } from '/client/imports/routes/QLink'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'


// This is a User Card which is a card-format version of the User information.
// Originally it was passed specific fields from caller as props, but this becomes
// hard to maintain as we ruse it more, so it was changed to have a user_ field
// passed in, and to locally decide what fields to use/render within that structure.

export default UserProfile = React.createClass({
  propTypes : {
    user: PropTypes.object.isRequired,
    makeClickable: PropTypes.bool,            // True if we want a simple click-to-jump for the overall card
    canEditProfile: PropTypes.bool,           // True if we want the profile to be editable (i.e the profile owner is the logged in user)
    handleProfileFieldChanged: PropTypes.func // Function callback if fields are changed. e.g. profile.bio: "new text"
  },  
  
  contextTypes: {
    urlLocation: React.PropTypes.object
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
    if (this.props.handleProfileFieldChanged)
      this.props.handleProfileFieldChanged({...data})
  },

  validateMGB1name: function (text) {
    // TODO more safety content checks here
    return (text.length >= 0 && text.length < 16)
  },

  customValidateText: function(text) {
    // TODO more safety content checks here
    return (text.length >= 0 && text.length < 64)
  },

  handleCardClick: function() {
    if (this.props.makeClickable)
      utilPushTo(this.context.urlLocation.query, `/u/${this.props.user.profile.name}`)
  },

  render: function() {
    const user = this.props.user
    if (!user || !user.profile)
      return null

    const createdAt = user.createdAt
    const editsDisabled = !this.props.canEditProfile
    const { name, avatar, title, bio, focusMsg, mgb1name } = user.profile
    
    return (
      <div className="ui card"  onClick={this.handleCardClick}>
        <div className="ui image">
          <img src={avatar} />
        </div>
        <div className="ui content">
          <div className="ui header">{name}</div>
          <div className="ui meta">
            
            <b>Title:</b> <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={title || "(no title)"}
              paramName="profile.title"
              change={this.profileFieldChanged}
              isDisabled={editsDisabled}
              />
            
          </div>
          <div className="ui description">
            <b>Description:</b> <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={bio || "(no description)"}
              paramName="profile.bio"
              change={this.profileFieldChanged}
              isDisabled={editsDisabled}
              />
          </div>
          <div className="ui description">
            <b>Focus:</b> <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={focusMsg || "(no current focus)"}
              paramName="profile.focusMsg"
              change={this.profileFieldChanged}
              isDisabled={editsDisabled}
              />
          </div>
          <div className="ui description" title="This is the user's name on the old MGBv1 system. There is currently no verification of this claim"> 
            { mgb1name &&  
              <a href={`http://s3.amazonaws.com/apphost/MGB.html#user=${mgb1name};project=project1`} target="_blank">
                <img  className="right floated mini image" style={{ maxWidth: "64px", maxHeight: "64px" }}
                      ref={ (c) => { if (c) c.src=`https://s3.amazonaws.com/JGI_test1/${mgb1name}/project1/tile/avatar` } } />
              </a>
            }
            <b>MGB1 name:</b> <InlineEdit
              validate={this.validateMGB1name}
              activeClassName="editing"
              text={mgb1name || "Username on http://mygamebuilder.com"}
              paramName="profile.mgb1name"
              change={this.profileFieldChanged}
              isDisabled={editsDisabled}
              />
          </div>  
        </div>
        <div className="ui extra content">
            <span className="ui right floated">
              Joined {moment(createdAt).format('MMMM DD, YYYY')}
            </span>
            <QLink to="/users">
              <i className="ui user icon"></i>User
            </QLink>            
          </div>    
      </div>
    );
  }
})
