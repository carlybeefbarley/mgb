import _ from 'lodash';
import { Segment } from 'semantic-ui-react';
import React, {PropTypes} from 'react';
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import UserItem from '../Users/UserItem';

const _nowrapStyle = {
  display: "flex",
  clear: "both",
  flexWrap: "nowrap",
  overflowX: "auto",
  overflowY: "hidden"
};

// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

export default ProjectMembersGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    project: PropTypes.object.isRequired,   // A project record from the DB. See projects.js
    enableRemoveButton: PropTypes.bool,     // If provided, then show a remove button      
    handleRemove:       PropTypes.func,      // If provided, then this is the remove callback
    enableLeaveButton:  PropTypes.string,       // If not undefined/null/"", then show a remove button for the userID that matches this string (basically currUser)
    handleLeave:        PropTypes.func      // If provided, then this is the callback for the currentlyLoggedIn user to Leave the project. For super-paranoia, consider also passing in the username (but this is a matter of taste).
  },
  
  
  getMeteorData: function() {
    const project = this.props.project
    let idArray = project.memberIds.slice()
    const handleForUsers = Meteor.subscribe("users.getByIdList", idArray);
    const selector = {_id: {"$in": idArray}}
    
    return {
      users: Meteor.users.find(selector).fetch(),
      loading: !handleForUsers.ready()
    };
  },
  
  
  renderMembers()
  {
    // TODO: The UserItem Card should be able accept an array of buttons for actions so that the buttons are actually attached to the card
    return _.map( this.data.users, user => (
        <Segment basic key={user._id}>
          <UserItem narrowItem={true} renderAttached={true} user={user} style={{paddingBottom: 0}}/>
          <div className="ui bottom attached buttons" >
            { this.props.enableRemoveButton && 
              <div className="ui button" style={{ maxWidth: '230px' }} onClick={this.handleRemove.bind(this, user)}><i className="ui red remove icon" />Remove Member '{user.username}' from Project</div> 
            }

            { this.props.enableLeaveButton === user._id && 
              <div className="ui button" style={{ maxWidth: '230px' }} onClick={this.handleLeave.bind(this, user)}>
                <i className="ui red remove icon" /> Leave Project
              </div> 
            }
          </div>
        </Segment>
      )
    )
  },
  
  handleRemove: function(user)
  {
    var handler = this.props.handleRemove
    handler && handler(user._id, user.profile.name)
  },  
  
  handleLeave: function(user)
  {
    var handler = this.props.handleLeave
    handler && handler(user._id, user.profile.name)
  },  
  

  render: function() 
  {
    if (this.data.loading)
      return null      
      
    return (
      <div style={_nowrapStyle}>
        { this.renderMembers() }
      </div>
    )
  }
})