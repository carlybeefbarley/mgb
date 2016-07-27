import _ from 'lodash';
import React, { PropTypes } from 'react';
import QLink from '/client/imports/routes/QLink';
import WhatsNew from '../Nav/WhatsNew';


export default npHome = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const {currUser} = this.props;

    return (
      <div className="ui vertical attached inverted fluid menu">
        <div className="ui item" key="authHdr">
          <h3 className="ui inverted header" style={{textAlign: "center"}}>
            <i className="home icon" />
            Home
          </h3>
        </div>      
  
        <div className="header item">My Game Builder v2</div>
        <div className="menu">
          <QLink to="/" className="item">Home Page</QLink>
          <QLink to="/whatsnew" className="item">
            What's New
            <WhatsNew currUser={currUser} />
          </QLink>
        </div>
  
        <div className="header item">Common Tasks</div>
        <div className="menu">
          <QLink to="/assets/create" className="item">
            <i className="green pencil icon" />
            Create New Asset
          </QLink>
        </div>
      </div>
        );
  }

  
})