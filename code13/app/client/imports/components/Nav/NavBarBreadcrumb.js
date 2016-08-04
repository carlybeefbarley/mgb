import _ from 'lodash';
import React, { PropTypes } from 'react';
import QLink from '/client/imports/routes/QLink';

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column 
// on the left and the FlexPanel on the right). 

// The NavBarBreadcrumb contains a breadcrumb bar that is generated based on name, user and
// params (assetId, projectId etc)

export default NavBarBreadcrumb = React.createClass({
  
  propTypes: {
    params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
    user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
    name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
    conserveSpace:      PropTypes.bool.isRequired         // True if space should be used more conservatively               
  },


  render: function() {
    const { name, user, params, conserveSpace } = this.props
    const homeWord = conserveSpace ? "MGBv2" : "MyGameBuilder v2"
    const sep = <i className="mini right chevron icon"></i>
    const assetId = params && params.assetId
    const projectId = params && params.projectId

    return (
      <div className="ui large breadcrumb">
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
    )
  }
})