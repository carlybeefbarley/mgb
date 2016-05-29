import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router';
import InlineEdit from 'react-edit-inline';


// This is a Project Card which is a card-format version of the Project information.
// It is passed a project database object and it locally decides what fields to use/render within that structure.

// TODO: Make this use <Link> instead of <a> so we don't force extra loading

export default ProjectCard = React.createClass({
  propTypes : {
    project: PropTypes.object.isRequired,
    owner: PropTypes.object                  // Optional user object for owner. It's best to have it, but sometimes it may be expensive to go get the user record so let's not force it
  },  
  

  render: function() {
    const { project, owner, wholeCardIsLink } = this.props        
    const createdAt = project.createdAt
    
    const linkTo = "/user/" + project.ownerId + "/project/" + project._id

    const MemberStr = (!project.memberIds || project.memberIds.length === 0) ? "1 Member" : (project.memberIds.length + 1) + " Members"
    return  <Link className="ui bordered card" key={project._id} to={linkTo}>
              <div className="image">
                <img src="http://semantic-ui.com/images/wireframe/image.png"></img>
              </div>
              <div className="content">
                <i className="right floated star icon"></i>
                <div className="header">{project.name}</div>
                <div className="meta"><i className="users icon"></i>{MemberStr}</div>
                <div className="description">
                  <p>{project.description || "(no description)"}</p>
                </div>
              </div>
              <div className="extra content">
                <span className="left floated icon">
                  <i className="large sitemap icon"></i>
                  Project
                </span>                             
                { owner && <div className="right floated author">
                    <img 
                      className="ui avatar image" 
                      src={owner.profile.avatar}></img> {owner.profile.name}
                  </div>
                }
              </div>
            </Link>
  }
})
