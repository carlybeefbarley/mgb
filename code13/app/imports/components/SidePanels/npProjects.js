import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';
import {logActivity} from '../../schemas/activity';

export default npProjects = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const {currUser} = this.props;

    return (
      <div className="ui vertical inverted fluid menu">
        <div>
          <div className="ui item" key="authHdr">
            <h3 className="ui inverted header" style={{textAlign: "center"}}>
              <i className="sitemap icon" />
              Projects
            </h3>
          </div>
          { currUser &&
            <QLink to={`/user/${this.props.currUser._id}/projects`} className="item">
              <i className="sitemap icon" /> My Projects
            </QLink>
          }
        </div>
      </div>
    );
  }

  
})