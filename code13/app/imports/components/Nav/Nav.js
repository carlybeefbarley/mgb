import React, {Component, PropTypes} from 'react';
import { browserHistory } from 'react-router';
import {logActivity} from '../../schemas/activity';
import NavRecentGET from './NavRecentGET.js';
import WhatsNew from './WhatsNew.js';
import QLink from '../../routes/QLink';
import moment from 'moment';

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
    const { currUser } = this.props
    
    const sty = {
      position: "absolute",
      top:      "0px",
      left:     this.props.navPanelWidth, 
      right:    this.props.flexPanelWidth, 
      // borderRadius: "0px", 
      // marginRight: this.props.flexPanelWidth,  
      // marginLeft: this.props.navPanelWidth,
      marginBottom: "0px"
    }
    
    return (
      <div style={sty}>
      <div className="ui attached inverted menu" >

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


          <div className="right menu">
            { (currUser && currUser.profile.focusMsg) && 
              <QLink to={`/user/${currUser._id}`} className=" item " title={"You set this focus goal " + moment(currUser.profile.focusStart).fromNow()}>
                <i className="alarm icon"></i> {currUser.profile.focusMsg}
              </QLink>
            }

            { !this.props.flexPanelIsVisible && 
              <a className="header item" onClick={this.props.handleFlexPanelToggle}>
                <i className={"chevron " + (this.props.flexPanelIsVisible ? "right" : "left") +" icon"}></i>
              </a>
            }
          </div>
        </div>
        </div>
    );
  }
})
