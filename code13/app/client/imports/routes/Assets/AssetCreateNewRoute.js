import _ from 'lodash';
import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import AssetCreateNew from '/client/imports/components/Assets/NewAsset/AssetCreateNew';
import { logActivity } from '/imports/schemas/activity';
import { utilPushTo } from '/client/imports/routes/QLink';


export default AssetCreateNewRoute = React.createClass({

  propTypes: {
    params: PropTypes.object,       // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object,         // Maybe absent if route is /assets
    currUser: PropTypes.object,     // Currently Logged in user
    ownsProfile: PropTypes.bool,
    location: PropTypes.object      // We get this from react-router
  },


  contextTypes: {
    urlLocation: React.PropTypes.object
  },


  render: function() {
    return (
      <div className="ui basic segment">
        <Helmet
          title="Create New Asset"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <AssetCreateNew 
          handleCreateAssetClick={this.handleCreateAssetClickFromComponent}
          currUser={this.props.currUser}
          />
      </div>
    )
  },


  handleCreateAssetClickFromComponent(assetKindKey, assetName) {
    let newAsset = {
      name: assetName,
      kind: assetKindKey,
      text: "",
      thumbnail: "",
      content2: {},
      dn_ownerName: this.props.currUser.name,

      isCompleted: false,
      isDeleted: false,
      isPrivate: true
    }

    Meteor.call('Azzets.create', newAsset, (error, result) => {
      if (error) {
          alert("cannot create asset because: " + error.reason);
      } else {
        newAsset._id = result; // So activity log will work
        logActivity("asset.create",  `Create ${assetKindKey}`, null, newAsset);
        utilPushTo(this.context.urlLocation.query, `/u/${this.props.currUser.profile.name}/asset/${result}`)
      }
    });
  }

})