import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';

export default npUsers = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const {currUser} = this.props;

    return (
      <div className="ui vertical inverted fluid menu">
        { currUser ?
          <div>
          
            <div className="ui item" key="authHdr">
              <h2 className="ui inverted header" style={{textAlign: "center"}}>Users</h2>
            </div>
            <QLink to="/users" className="item">
              <i className="user icon" /> All Users
            </QLink>
            <QLink to="/assets" className="item">
              <i className="home icon" /> All Assets
            </QLink>
          </div>
          :
          // If signed out, show   | Sign-in, Join |  options inline
          [
            <QLink to="/signin" className="item"  key="signin">Login</QLink>,
            <QLink to="/join" className="item"  key="join">Join</QLink>
          ]
        }
      </div>
    );
  }

  
})