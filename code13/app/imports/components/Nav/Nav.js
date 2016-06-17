import React, {Component, PropTypes} from 'react';
import { browserHistory } from 'react-router';
import {logActivity} from '../../schemas/activity';
import NavRecentGET from './NavRecentGET.js';
import WhatsNew from './WhatsNew.js';

export default Nav = React.createClass({
  
  propTypes: {
    params:                 PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
    currUser:               PropTypes.object,                 // Currently logged in user.. or null if not logged in.
    user:                   PropTypes.object,                 // If there is a :id user id on the path, this is the user record for it
    handleFlexPanelToggle:  PropTypes.func.isRequired,        // Callback for changing view. Causes URL to update
    flexPanelIsVisible:     PropTypes.bool.isRequired,        // Whether the Flex Panel (RHS) is visible)
    flexPanelWidth:         PropTypes.string.isRequired,      // Typically something like "200px".
    navPanelWidth:          PropTypes.string.isRequired,      // Typically something like "60px". NavPanel is always visible, but width varies
    name:                   PropTypes.string                  // Page title to show in Nav bar // TODO: Replace this with something more useful
  },


  /** This used by render() to render something like...
   *      OwnerName [> Project(s)] > Edit Asset
   */
  renderBreadcrumbBar() {
    const { name, user, params } = this.props
    const homeWord = "MyGameBuilder v2"
    const sep = <i className="mini right chevron icon"></i>
    const id = params && params.id
    const assetId = params && params.assetId
    const projectId = params && params.projectId

    return  <div className="ui breadcrumb">
              <QLink to="/" className="section" style={{color: "rgba(255,255,255,0.9)"}}>{homeWord}&nbsp;</QLink>

              { (id && user) && sep }
              { (id && user) && <QLink className="section" to={`/user/${id}`}>{user.profile.name}&nbsp;</QLink> }

              { assetId && sep }
              { assetId && <QLink className="section" to={`/user/${id}/assets`}>Assets&nbsp;</QLink> }

              { projectId && sep }
              { projectId && <QLink className="section" to={`/user/${id}/projects`}>Projects&nbsp;</QLink> }

              { name && sep }
              { name && <span>{name}&nbsp;</span> }

            </div>
  },


  render: function() {
    
    const sty = {
      borderRadius: "0px", 
      marginRight: this.props.flexPanelWidth,         // This messes up the scrollbar location. TODO - something that doesn't mess up the scroll bar?  Note that Slack uses a thing they built called Monkey Scroll Bars
      marginLeft: this.props.navPanelWidth,
      marginBottom: "0px"
    }
    
    return (
      <div className="ui attached inverted menu" style={sty}>

          <WhatsNew currUser={this.props.currUser} asHidingLink={true}/>

          {
            // This implements a back button if we want.. kind of wierd though with the NavPanel
            // <div className="item" onClick={browserHistory.goBack}>
            //   { <i className="icon left arrow" /> }
            // </div>
          }
          <div className="item">
            { this.renderBreadcrumbBar() }
          </div>
         
          { !this.props.flexPanelIsVisible && 
            <a className="header item right" onClick={this.props.handleFlexPanelToggle}>
              <i  className={"chevron " + (this.props.flexPanelIsVisible ? "right" : "left") +" icon"}></i>
            </a>
          }
          <div style={{width: this.props.navPanelWidth}} />

        </div>
    );
  }
})
