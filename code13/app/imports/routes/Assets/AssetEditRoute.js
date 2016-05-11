import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';

import Spinner from '../../components/Spinner/Spinner';
import {handleForms} from '../../components/Forms/FormDecorator';
import Helmet from 'react-helmet';
import AssetEdit from '../../components/Assets/AssetEdit';
import AssetCard from '../../components/Assets/AssetCard.js';
import AssetActivityDetail from '../../components/Assets/AssetActivityDetail.js';

import {AssetKinds} from '../../schemas/assets';
import {logActivity} from '../../schemas/activity';
import {snapshotActivity} from '../../schemas/activitySnapshots.js';
import {ActivitySnapshots} from '../../schemas';


export default AssetEditRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool     // true IFF user is valid and asset owner is currently logged in user
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
    let handleForAsset = Meteor.subscribe("assets.public.withContent2");
    let handleForActivity = Meteor.subscribe("activitysnapshots.assetid", this.props.params.id);


    return {
      asset: Azzets.findOne(this.props.params.id),
      activities: ActivitySnapshots.find().fetch(),
      loading: !handleForAsset.ready()    // Be aware that 'activities' may still be loading
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

    return (
      <div className="ui padded grid">

        <Helmet
          title="Asset Editor"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <div className="ui seven wide column">

          <div className="ui left action input fluid">
            <div className="ui teal icon button">
              <div className="ui label teal">Edit {asset.kind}</div>
              <i className={AssetKinds.getIconClass(asset.kind)}></i>
            </div>
            <input ref="assetNameInput"
                   disabled={!canEd}
                   placeholder={"Enter a name for this " + asset.kind + " asset"}
                   defaultValue={asset.name}
                   onBlur={this.handleAssetNameChangeInteractive}></input>
          </div>
        </div>
        
        <div className="ui three wide column">
          { /* We use this.props.params.id since it is available sooner than the asset */ }
          <AssetActivityDetail 
                        assetId={this.props.params.id} 
                        currUser={this.props.currUser}
                        activities={this.data.activities} />
        </div>
        
        <div className="ui two wide column">        
          { canEd ? <a className="ui tiny green label">editable</a> : <a className="ui mgbReadOnlyReminder tiny red label">read-only</a> }
        </div>

        <div className="four wide column">
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
            activities={this.data.activities} 
          />
        </div>
      </div>
    );
  },

  handleEditDeniedReminder: function()
  {
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
      
      logActivity("asset.rename",  `Rename to "${newName}"`, null, this.data.asset); 
    }
  }
})
