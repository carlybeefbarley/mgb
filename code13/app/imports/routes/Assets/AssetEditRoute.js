import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';

import Spinner from '../../components/Spinner/Spinner';
import {handleForms} from '../../components/Forms/FormDecorator';
import Helmet from 'react-helmet';
import AssetEdit from '../../components/Assets/AssetEdit';
import AssetCard from '../../components/Assets/AssetCard.js';

import {AssetKinds} from '../../schemas/assets';
import {logActivity} from '../../schemas/activity';


export default AssetEditRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  },
  
  
  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnter)
  },
  
  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnter)
    this.handleAssetNameChangeInteractive()     // In case we have any pending saves    
  },
  
  listenForEnter: function(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      this.handleAssetNameChangeInteractive();
    }
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

        <div className="ui eight wide column">

          <div className="ui large left action input fluid">
            <div className="ui teal icon button">
              <div className="ui large label teal">Edit {asset.kind}</div>
              <i className={AssetKinds.getIconClass(asset.kind)}></i>
            </div>
            <input ref="assetNameInput"
                   placeholder={"Enter a name for this " + asset.kind + " asset"}
                   defaultValue={asset.name}
                   onBlur={this.handleAssetNameChangeInteractive}></input>
          </div>
        </div>
        
        <div className="ui two wide column">
        &nbsp;
        </div>


        <div className="six wide column">
            <AssetCard
            showHeader={false}
            canEdit={this.props.currUser && asset.ownerId === this.props.currUser._id}
            currUser={this.props.currUser}
            asset={asset}
            showEditButton={false}
            showToast={this.props.showToast} />
        </div>

        <div className="sixteen wide column">
          <AssetEdit asset={asset}/>
        </div>
      </div>
    );
  },

  handleAssetNameChangeInteractive: function() {
    let canEdit = true; // TODO: Something based on this.props.ownsProfile ??
    let newName = this.refs.assetNameInput.value;

    if (newName !== this.data.asset.name) {
      Meteor.call('Azzets.update', this.data.asset._id, canEdit, {name: newName}, (err, res) => {
        if (err) {
          this.props.showToast(err.reason, 'error')
        }
      });
      
      logActivity("asset.rename",  `Rename to "${newName}"`, null, this.data.asset); 
    }
  }
})
