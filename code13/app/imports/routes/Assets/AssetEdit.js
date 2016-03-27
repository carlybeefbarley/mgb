import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';
import Spinner from '../../components/Spinner/Spinner';
import {handleForms} from '../../components/Forms/FormDecorator';
import Helmet from 'react-helmet';
import AssetEdit from '../../components/Assets/AssetEdit';
import UserItem from '../../components/Users/UserItem.js';
import {AssetKinds} from '../../schemas/assets';

export default AssetEditRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  },

  getMeteorData: function() {
    let handle = Meteor.subscribe("assets.public.withContent2");

    return {
      asset: Azzets.findOne(this.props.params.id),
      loading: !handle.ready()
    };
  },

  render: function() {
    // One Asset provided via getMeteorData()
    let asset = this.data.asset;
    if (!asset || this.data.loading)
      return null;

    const {currUser, ownsProfile} = this.props;

    return (
      <div className="ui padded grid">

        <Helmet
          title="Asset Editor"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <div className="ui nine wide column">

          <div className="ui large left action input fluid">
            <div className="ui teal icon button">
              <div className="ui large label teal">Edit {asset.kind}</div>
              <i className={AssetKinds.getIconClass(asset.kind)}></i>
            </div>
            <input ref="assetNameInput"
                   placeholder={"Enter a name for this " + asset.kind + " asset"}
                   value={asset.name}
                   onChange={this.handleAssetNameChangeInteractive}></input>
          </div>

        </div>

        <div className="seven wide column">
          { !currUser ? null : 
             <UserItem
              name={currUser.name}
              avatar={currUser.avatar}
              createdAt={currUser.createdAt}
              _id={currUser._id} />
          }
        </div>

        <div className="sixteen wide column">
          <AssetEdit asset={asset}/>
        </div>
      </div>
    );
  },

  handleAssetNameChangeInteractive: function() {
    let canEdit = true; // TODO: Something based on this.props.ownsProfile ??
    Meteor.call('Azzets.update', this.data.asset._id, canEdit, {name: this.refs.assetNameInput.value}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }
    });
  }

})
