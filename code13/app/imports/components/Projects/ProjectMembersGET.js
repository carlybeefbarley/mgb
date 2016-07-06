import React, {Component, PropTypes} from 'react';
import QLink from '../../routes/QLink';
import reactMixin from 'react-mixin';
import moment from 'moment';
import UserItem from '../Users/UserItem';


// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

export default ProjectMembersGET = React.createClass({
  mixins: [ReactMeteorData],


  propTypes: {
    project: PropTypes.object.isRequired,   // A project record from the DB. See projects.js
    enableRemoveButton: PropTypes.bool,     // If provided, then show a remove button      
    handleRemove:       PropTypes.func      // If provided, then this is the remove callback
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
    return this.data.users.map( user => {
      const uLink = "/u/"+user.profile.name
      return <div className="ui basic segment" key={user._id}>
              <UserItem renderAttached={true}                    
                  _id={user._id}
                  name={user.profile.name}
                  profileTitle={user.profile.title}
                  profileBio={user.profile.bio}
                  profileFocusMsg={user.profile.focusMsg}
                  profileFocusStart={user.profile.focusStart}
                  createdAt={user.createdAt}
                  avatar={user.profile.avatar}  />
              <div className="ui bottom attached buttons">
                <QLink to={uLink + "/projects"} className="ui button">Projects</QLink>
                { this.props.enableRemoveButton && 
                  <div className="ui red button" onClick={this.handleRemove.bind(this, user)}>Remove</div> }
              </div>
            </div>
    })
  },
  
  handleRemove: function(user)
  {
    var handler = this.props.handleRemove
    handler && handler(user._id, user.profile.name)
  },  
  
  render: function() 
  {
    if (this.data.loading)
      return null      
      
    return  <div>        
              { this.renderMembers() }
            </div>
  }
})