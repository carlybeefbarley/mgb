import _ from 'lodash';
import React, {Component, PropTypes} from 'react';
import QLink from '/client/imports/routes/QLink';
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
      return (
        <div className="ui basic segment" key={user._id}>
          <UserItem renderAttached={true} user={user} />
          <div className="ui bottom attached buttons">
            { this.props.enableRemoveButton && 
              <div className="ui button" onClick={this.handleRemove.bind(this, user)}><i className="ui red remove icon" />Remove Member from Project</div> }
          </div>
        </div>
      )
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
      
    return  <div>{ this.renderMembers() }</div>
  }
})