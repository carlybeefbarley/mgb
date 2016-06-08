import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';

import Spinner from '../../components/Nav/Spinner';
import {handleForms} from '../../components/Forms/FormDecorator';
import Helmet from 'react-helmet';
import AssetEdit from '../../components/Assets/AssetEdit';
import AssetCard from '../../components/Assets/AssetCard.js';
import AssetActivityDetail from '../../components/Assets/AssetActivityDetail.js';
import AssetHistoryDetail from '../../components/Assets/AssetHistoryDetail.js';

import {AssetKinds} from '../../schemas/assets';
import {logActivity} from '../../schemas/activity';
import {snapshotActivity} from '../../schemas/activitySnapshots.js';
import {ActivitySnapshots, Activity} from '../../schemas';


// TODO: Add a Leave hook for unsaved work: https://github.com/reactjs/react-router/blob/master/docs/guides/ConfirmingNavigation.md


export default AssetEditRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // params.id is the ASSET id
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool     // true IFF user is valid and asset owner is currently logged in user
  },
  
  
  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnterOrEsc)
  },
  
  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnterOrEsc)
    this.handleAssetNameChangeInteractive()     // In case we have any pending saves    
  },
  
  listenForEnterOrEsc: function(e) {
    e = e || window.event;
    if (e.keyCode === 13) 
      this.handleAssetNameChangeInteractive();
    else if (e.keyCode === 27 && !this.data.loading)
      this.refs.assetNameInput.value = this.data.asset.name
  },

  getMeteorData: function() {
    let assetId = this.props.params.id
    let handleForAsset = Meteor.subscribe("assets.public.byId.withContent2", assetId)
    let handleForActivitySnapshots = Meteor.subscribe("activitysnapshots.assetid", assetId)
    let handleForAssetActivity = Meteor.subscribe("activity.public.recent.assetid", assetId) 

    let selector = { toAssetId: assetId }
    let options = {sort: {timestamp: -1}}

    return {
      asset: Azzets.findOne(assetId),
      activitySnapshots: ActivitySnapshots.find(selector, options).fetch(),
      assetActivity: Activity.find(selector, options).fetch(),
      loading: !handleForAsset.ready()    // Be aware that 'activitySnapshots' and 'assetActivity' may still be loading
    };
  },


  canEdit: function() {
    return this.data.asset &&
           !this.data.loading &&
           this.props.currUser && 
           this.data.asset.ownerId === this.props.currUser._id
  },

  render: function() {
    // One Asset provided via getMeteorData()
    let asset = this.data.asset;
    if (!asset || this.data.loading)
      return null;

    const canEd = this.canEdit();
    
    var nameFieldHighlight = (canEd && (!asset.name || asset.name === "")) ? " error" : "";

    return (
      <div className="ui padded grid">

        <Helmet
          title="Asset Editor"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <div className="ui five wide column">
          <div className={"ui small left action input fluid" + nameFieldHighlight}>
            <div className="ui small teal icon button">
              <div className="ui small label teal">Edit {asset.kind}</div>
              <i className={AssetKinds.getIconClass(asset.kind)}></i>
            </div>
            <input ref="assetNameInput"
                   disabled={!canEd}
                   placeholder={"Unnamed " + asset.kind}
                   defaultValue={asset.name}
                   onBlur={this.handleAssetNameChangeInteractive}></input>
          </div>
        </div>
        
        <div className="ui five wide column">
          { /* We use this.props.params.id since it is available sooner than the asset */ }
          <AssetActivityDetail 
                        assetId={this.props.params.id} 
                        currUser={this.props.currUser}
                        activitySnapshots={this.data.activitySnapshots} />
                        &nbsp;
          <AssetHistoryDetail 
                        assetId={this.props.params.id} 
                        currUser={this.props.currUser}
                        assetActivity={this.data.assetActivity} />

        </div>

        <div className="six wide column">
            <AssetCard
              showHeader={false}
              canEdit={canEd}
              currUser={this.props.currUser}
              asset={asset}
              showEditButton={false}
              showToast={this.props.showToast} />
        </div>

        <div className="sixteen wide column">
          <AssetEdit 
            asset={asset} 
            canEdit={canEd} 
            currUser={this.props.currUser}
            editDeniedReminder={this.handleEditDeniedReminder}
            activitySnapshots={this.data.activitySnapshots} 
          />
        </div>
      </div>
    );
  },

  handleEditDeniedReminder: function()
  {
    // This is a style in the AssetCard. TODO: Pass the name in as a prop
    $('.mgbReadOnlyReminder').transition({ animation: 'tada', duration: '500ms' })
  },

  handleAssetNameChangeInteractive: function() {
    let newName = this.refs.assetNameInput.value;

    if (newName !== this.data.asset.name) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canEdit(), {name: newName}, (err, res) => {
        if (err) {
          this.props.showToast(err.reason, 'error')
        }
      });
      
      logActivity("asset.rename",  `Rename to "${newName}" from `, null, this.data.asset); 
    }
  }
})
