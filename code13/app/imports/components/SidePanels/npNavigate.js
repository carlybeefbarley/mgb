import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';
import WhatsNew from '../Nav/WhatsNew';
export default npNavigate = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const {currUser} = this.props;

    return (
      <div className="ui vertical attached inverted fluid menu">
        <div className="item"><b>My Game Builder</b></div>
        <div className="item">
          <div className="header">Home</div>
          <div className="menu">
            <QLink to="/" className="item">Home Page</QLink>
            <QLink to="/whatsnew" className="item">
              What's New<WhatsNew currUser={currUser} />
            </QLink>
          </div>
        </div>
      </div>
        );
  }

  
})