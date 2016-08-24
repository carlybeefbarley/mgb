import React, { PropTypes } from 'react'
import { utilPushTo } from '../QLink'
import reactMixin from 'react-mixin'

import { Azzets } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'

import Helmet from 'react-helmet'

import AssetEdit from '/client/imports/components/Assets/AssetEdit'
import AssetPathDetail from '/client/imports/components/Assets/AssetPathDetail'
import AssetHistoryDetail from '/client/imports/components/Assets/AssetHistoryDetail'
import AssetProjectDetail from '/client/imports/components/Assets/AssetProjectDetail'
import AssetActivityDetail from '/client/imports/components/Assets/AssetActivityDetail'

import { logActivity } from '/imports/schemas/activity'
import { ActivitySnapshots, Activity } from '/imports/schemas'


// This AssetEditRoute serves the following objectives
// 1. Provide a reactive  this.data.___ for the data needed to view/edit this Asset
// 2. Provide a UI header that shows the important metadata about the asset being shown/edited. These include
//      Essential:  
//                      Asset Owner (immutable)
//                      Asset Projects (mutable)
//                      Asset Kind (immutable)
//                      Asset Name (mutable)
//                      ReadOnly / Writeable indicator (changes via project membership)
//                      Indicate current active viewers/editors of same asset (dynamic) [Could use FlexPanel to show those users]
//                      Pinned/Unpinned (mutable)
//                      Asset Change history (dynamic) [Could use FlexPanel to see history]
//
// 3. Provide functions for sub components to call which will store the Asset
// 4. (TODO) Provide "Leave hooks" for warning about unsaved work: https://github.com/reactjs/react-router/blob/master/docs/guides/ConfirmingNavigation.md


export default AssetEditRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // params.assetId is the ASSET id
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool     // true IFF user is valid and asset owner is currently logged in user
  },
    
  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  // We also support a route which omits the user id, but if we see that, we redirect to get the path that includes the userId
  // TODO: Make this QLink-smart so it preserves queries
  checkForRedirect() {
    if (!this.props.user && !!this.data.asset)
      utilPushTo(this.context.urlLocation.query, "/u/" + this.data.asset.dn_ownerName + "/asset/" + this.data.asset._id)
  },

  componentDidMount() {
    this.checkForRedirect()
  },

  componentDidUpdate() {
    this.checkForRedirect()
  },

  getMeteorData: function() {
    let assetId = this.props.params.assetId
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
    }
  },

  canEdit: function() {
    return !!(this.data.asset &&
           !this.data.loading &&
           this.props.currUser && 
           this.data.asset.ownerId === this.props.currUser._id)
  },

  render: function() {    
    const asset = this.data.asset         // One Asset provided via getMeteorData()
    if (!asset || this.data.loading) return null

    const canEd = this.canEdit()    

    return (
      <div className="ui padded grid">

        <Helmet
          title="Asset Editor"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <div className="ui eight wide column">
          <AssetPathDetail 
            canEdit={canEd}
            ownerName={asset.dn_ownerName}
            kind={asset.kind}
            name={asset.name}
            text={asset.text}
            handleNameChange={this.handleAssetNameChange}
            handleDescriptionChange={this.handleAssetDescriptionChange}/>
        </div>
        
        <div className="ui eight wide right aligned column" >
          { /* We use this.props.params.assetId since it is available sooner than the asset 
             * TODO: Take advantage of this by doing a partial render when data.asset is not yet loaded
             * */ }
          <AssetActivityDetail
                        assetId={this.props.params.assetId} 
                        currUser={this.props.currUser}
                        activitySnapshots={this.data.activitySnapshots} />
          &emsp;
          <AssetHistoryDetail 
                        assetId={this.props.params.assetId} 
                        currUser={this.props.currUser}
                        assetActivity={this.data.assetActivity} />
          &emsp;
          <AssetProjectDetail 
            projectNames={asset.projectNames || []}
            isDeleted={asset.isDeleted} />
        </div>

        <div className="sixteen wide column">
          <AssetEdit 
            asset={asset} 
            canEdit={canEd} 
            currUser={this.props.currUser}
            handleContentChange={this.handleContentChange}
            editDeniedReminder={this.handleEditDeniedReminder}
            activitySnapshots={this.data.activitySnapshots} 
          />
        </div>
      </div>
    )
  },


  handleEditDeniedReminder: function()
  {
    // This is a style on the Edit/view tag in render()
    $('.mgbReadOnlyReminder').transition({ animation: 'flash', duration: '800ms' })
  },


  handleContentChange(content2Object, thumbnail, changeText="content change")
  {
    const asset = this.data.asset;
    let updateObj = {}
    if (content2Object)
      updateObj.content2 = content2Object
    if (thumbnail)
      updateObj.thumbnail = thumbnail
    Meteor.call('Azzets.update', asset._id, this.canEdit(), updateObj, (err, res) => {
      if (err) {
        // TODO: NOT alert() ! !
        alert('error: ' + err.reason)
      }
    })
    
    logActivity("asset.edit", changeText, null, asset)
  },


  handleAssetDescriptionChange: function(newText) {
    if (newText !== this.data.asset.text) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canEdit(), {text: newText}, (err, res) => {
        if (err) 
          this.props.showToast(err.reason, 'error')
      })      
      logActivity("asset.description",  `Update description to "${newText}"`, null, this.data.asset)
    }
  },


  handleAssetNameChange: function(newName) {
    if (newName !== this.data.asset.name) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canEdit(), {name: newName}, (err, res) => {
        if (err)
          this.props.showToast(err.reason, 'error')
      })      
      logActivity("asset.rename",  `Rename to "${newName}"`, null, this.data.asset)
    }
  }

  
  // TODO:  Call snapshotActivity after rename so it will fix up any stale names:
  // import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
  //            We would need the most recent passiveActivity which is asset-kind-specific
  //            so we need to pass down a handler for the asset-specific editors to let us
  //            invoke the snapshotActivity() call (a good idea anyway) and then we can re-use 
  //            the most recent passive activity 
})
