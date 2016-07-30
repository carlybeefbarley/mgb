import _ from 'lodash';
import React, {Component, PropTypes} from 'react';
import { browserHistory } from 'react-router';
import WhatsNew from './WhatsNew.js';
import QLink from '/client/imports/routes/QLink';
import moment from 'moment';

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column on the left and the FlexPanel on the right). 
// The NavBar contains a breadcrumb bar (left) and a NavGadget (right). The NavGadget is primarliy used for the Level slider that changes the
// complexity of any page from Beginner to Guru

export default NavBar = React.createClass({
  
  propTypes: {
    params:                 PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
    currUser:               PropTypes.object,                 // Currently logged in user.. or null if not logged in.
    user:                   PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
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
    const assetId = params && params.assetId
    const projectId = params && params.projectId

    return  <div className="ui large breadcrumb">
              <QLink to="/" className="section">{homeWord}&nbsp;</QLink>

              { user && sep }
              { user && <QLink className="section" to={`/u/${user.profile.name}`}>{user.profile.name}&nbsp;</QLink> }

              { user && assetId && sep }
              { user && assetId && <QLink className="section" to={`/u/${user.profile.name}/assets`}>Assets&nbsp;</QLink> }

              { user && projectId && sep }
              { user && projectId && <QLink className="section" to={`/u/${user.profile.name}/projects`}>Projects&nbsp;</QLink> }

              { name && sep }
              { name && <span>{name}&nbsp;</span> }

            </div>
  },


  render: function() {
    const { currUser } = this.props
    
    const sty = {
      position: "fixed",
      top:      "0px",
      left:     this.props.navPanelWidth, 
      right:    this.props.flexPanelWidth, 
      margin:   "0px"
    }


    const menuSty = {
      border: "none",
      boxShadow: "none"
    }
    
    return (
      <div style={sty}>
      <div className="ui  borderless menu" style={menuSty}>

          <WhatsNew currUser={this.props.currUser} asHidingLink={true}/>

          <div className="item">
            { this.renderBreadcrumbBar() }
          </div>


          <div className="right menu">
            { (currUser && currUser.profile.focusMsg) && 
              <QLink to={`/u/${currUser.profile.name}`} className=" item " title={"You set this focus goal " + moment(currUser.profile.focusStart).fromNow()}>
                <i className="alarm icon"></i> {currUser.profile.focusMsg}
              </QLink>
            }

          </div>
        </div>
        </div>
    );
  }
})
