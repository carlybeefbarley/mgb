import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';
import {logActivity} from '../../schemas/activity';

export default npProjects = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:   PropTypes.array,              // Projects list for currently logged in user
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const {currUser, currUserProjects} = this.props;

    if (!currUser)
      return null

    return (
      <div className="ui vertical inverted fluid menu">
        <div>
          <div className="ui item" key="authHdr">
            <h3 className="ui inverted header" style={{textAlign: "center"}}>
              <i className="sitemap icon" />
              Projects
            </h3>
          </div>

          <QLink to={`/u/${this.props.currUser.profile.name}/projects`} className="header item" title="Projects you are owner of">
            <i className="sitemap icon" /> My Owned Projects
          </QLink>
          <div className="menu">
            { this.renderProjectMenuItems(currUserProjects, true) }
          </div>
          <QLink to={`/u/${this.props.currUser.profile.name}/projects`} className="header item" title="Projects you are a member of">
            <i className="sitemap icon" /> Project Memberships
          </QLink>
          <div className="menu">
            { this.renderProjectMenuItems(currUserProjects, false) }
          </div>
        </div>
      </div>
    );
  },

  
  renderProjectMenuItems(projects, ownedFlag)
  {
    const Empty = <div className="item">(none)</div>
    const currUserId = this.props.currUser._id
    var count = 0
    if (!projects || projects.length === 0)
      return Empty
      
    const retval = projects.map( (p) => {
      const isOwner = (p.ownerId === currUserId)
      if (isOwner === ownedFlag) 
      {
        count++
        return  <QLink to={`/u/${p.ownerName}/project/${p._id}`} className="item" key={p._id}>
                  { p.name }
                </QLink>
      }
    }) 

    return count > 0 ? retval : Empty
  }
  
})