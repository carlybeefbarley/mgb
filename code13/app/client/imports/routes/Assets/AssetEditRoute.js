import _ from 'lodash'
import React, { PropTypes } from 'react'
import { utilPushTo } from '../QLink'
import reactMixin from 'react-mixin'

import Spinner from '/client/imports/components/Nav/Spinner'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import Helmet from 'react-helmet'

import { Azzets } from '/imports/schemas'
import AssetEdit from '/client/imports/components/Assets/AssetEdit'
import AssetPathDetail from '/client/imports/components/Assets/AssetPathDetail'
import AssetHistoryDetail from '/client/imports/components/Assets/AssetHistoryDetail'
import AssetActivityDetail from '/client/imports/components/Assets/AssetActivityDetail'
import AssetUrlGenerator from '/client/imports/components/Assets/AssetUrlGenerator'
import WorkState from '/client/imports/components/Controls/WorkState'
import DeletedState from '/client/imports/components/Controls/DeletedState'
import StableState from '/client/imports/components/Controls/StableState'

import { logActivity } from '/imports/schemas/activity'
import { ActivitySnapshots, Activity } from '/imports/schemas'

import ProjectMembershipEditorV2 from '/client/imports/components/Assets/ProjectMembershipEditorV2'

const FLUSH_TIMER_INTERVAL_MS = 6000    // Milliseconds between timed flush attempts

const fAllowSuperAdminToEditAnything = false // PUT IN SERVER POLICY

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



// ALSO TODO: Add a 'editorLease' field.. This would contain a userid, sessionId and lease-until timestamp. 
// This SHOULD prevent edits from other users: BLUE editor field, and details of edit actions.  Field is disregarded if not present or is expired. 
// TBD who does cleanup.
// Note that the Lease field should not be set on client.. it should be guarded by !isSimulation
// BUT this will not work if clients' clocks are wrong :(  So instead, the leases should be managed on server:  ??????


// The deferred saves are handled by the following data:
  //     this.m_deferredSaveObj: null     
  // null, or ONE object of form 
  // {
  //   content2Object: object, 
  //   thumbnail: string, 
  //   changeText: string, 
  //   timeOfLastChange,
  //   timeOfLastWriteAttempt     // TODO
  // }
  // And this is structure is set in deferContentChange()
  // ... Note that this isn't being stored in React's this.state.___ because we need access to it after the component has been unmounted
  /// (Hmm.. maybe I should create a global state container for this outside this component?)


export default AssetEditRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,           // params.assetId is the ASSET id
    user: PropTypes.object,
    currUser: PropTypes.object,
    currUserProjects: PropTypes.array,  // Both Owned and memberOf. Check ownerName / ownerId fields to know which
    isSuperAdmin: PropTypes.bool,       
    ownsProfile: PropTypes.bool,        // true IFF user is valid and asset owner is currently logged in user
    showToast: PropTypes.func           // For user feedback
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
    this.m_deferredSaveObj = null

    //console.log("Preparing TICK Timer")
    this.m_tickIntervalFunctionHandle = Meteor.setInterval( () => { 
      //console.log("TICK")
      this._attemptToSendAnyDeferredChanges() 
    } , FLUSH_TIMER_INTERVAL_MS )
  },


  componentWillReceiveProps(nextProps)
  {
    if (nextProps.params.assetId !== this.props.params.assetId)
    {
      console.log("Switch to different Asset. Flushing deferred saves to existing asset.")
      this._attemptToSendAnyDeferredChanges({ forceResend: true })
    }
  },

  componentWillUnmount() {
    if (this.m_tickIntervalFunctionHandle)
    {
      //console.log("Clearing TICK timer")
      Meteor.clearInterval(this.m_tickIntervalFunctionHandle)
      this.m_tickIntervalFunctionHandle = null
      this._attemptToSendAnyDeferredChanges({ forceResend: true })
    }
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
    let options = { sort: { timestamp: -1} }

    return {
      asset: Azzets.findOne(assetId),
      isServerOnlineNow: Meteor.status().connected,
      activitySnapshots: ActivitySnapshots.find(selector, options).fetch(),
      assetActivity: Activity.find(selector, options).fetch(),
      loading: !handleForAsset.ready()    // Be aware that 'activitySnapshots' and 'assetActivity' may still be loading
    }
  },

  canCurrUserEditThisAsset: function() {
    if (!this.data.asset || this.data.loading || !this.props.currUser)
      return false  // Need to at least be logged in and have the data to do any edits!
    
    const { asset } = this.data
    const { currUser, currUserProjects } = this.props
    if (asset.ownerId === currUser._id)
      return true   // Owner can always edit

    // Are we superAdmin?
    if (this.props.isSuperAdmin && fAllowSuperAdminToEditAnything)
    {
      console.log(`CanEdit=true because current User is SuperAdmin`)
      return true
    }

    // Are we a projectMember for any of this asset's Projects?
    const apn = asset.projectNames     // Shorthand
    const cup = currUserProjects       // Shorthand
    if (apn && apn.length > 0 && cup && cup.length > 0)
    {
      // There's at least one possibility of a matching project:
      // Let's cycle through them and return true as soon as we find one
      // TODO: find the lodash way to this in one line :)
      for (let currUserProjectIdx = 0; currUserProjectIdx < cup.length; currUserProjectIdx++)
      {
        for (let assetProjectIdx = 0; assetProjectIdx < apn.length; assetProjectIdx++)
        {
          if (asset.ownerId === cup[currUserProjectIdx].ownerId
           && apn[assetProjectIdx] === cup[currUserProjectIdx].name)
          {
            //console.log(`CanEdit=true because asset "${asset.name}" is in project "${apn[assetProjectIdx]}" and user ${currUser.profile.name} is a member of Project "${asset.dn_ownerName}.${cup[currUserProjectIdx].name}"`)
            return true
          }
        }
      }
    }

    return false    // Nope, can't edit it bro
  },

  render: function() {
    if (this.data.loading) 
      return <Spinner />

    const { params, currUser, currUserProjects } = this.props

    let asset = Object.assign( {}, this.data.asset )        // One Asset provided via getMeteorData()
    if (!this.data.asset)
      return <ThingNotFound type='Asset' id={params.assetId} />

    // Overlay any newer data to the child component so that it gets what it expects based on last save attempt
    const dso = this.m_deferredSaveObj
    if (dso)
    {
      if (dso.content2Object)
        asset.content2 = dso.content2Object
      if (dso.thumbnail)
        asset.thumbnail = dso.thumbnail
    }

    const canEd = this.canCurrUserEditThisAsset()
    const currUserId = currUser ? currUser._id : null

    const chosenProjectNamesArray = asset.projectNames || [];
    const availableProjectNamesArray = 
        currUserProjects ? 
          _.map(_.filter(currUserProjects, {"ownerId": asset.ownerId}), 'name')
        : []


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
            isServerOnlineNow={this.data.isServerOnlineNow}
            canEdit={canEd}
            isUnconfirmedSave={asset.isUnconfirmedSave}
            hasUnsentSaves={!!this.m_deferredSaveObj}
            ownerName={asset.dn_ownerName}
            kind={asset.kind}
            name={asset.name}
            text={asset.text}
            handleNameChange={this.handleAssetNameChange}
            handleDescriptionChange={this.handleAssetDescriptionChange}
            handleSaveNowRequest={this.handleSaveNowRequest} />
        </div>
        
        <div className="ui eight wide right aligned column" >
          { /* We use this.props.params.assetId since it is available sooner than the asset 
             * TODO: Take advantage of this by doing a partial render when data.asset is not yet loaded
             * */ }
          <AssetUrlGenerator showBordered={true} asset={asset} />
          <StableState 
            isStable={asset.isCompleted} 
            showMicro={true}
            canEdit={canEd}
            handleChange={this.handleStableStateChange}/>
          <DeletedState 
            isDeleted={asset.isDeleted} 
            showMicro={true}
            canEdit={canEd}
            handleChange={this.handleDeletedStateChange}/>
          &emsp;
          <WorkState 
            workState={asset.workState} 
            showMicro={true}
            canEdit={canEd}
            handleChange={this.handleWorkStateChange}/>
          &emsp;
          <AssetActivityDetail
            assetId={params.assetId} 
            currUser={currUser}
            activitySnapshots={this.data.activitySnapshots} />
          &emsp;
          <AssetHistoryDetail 
            assetId={params.assetId} 
            currUser={currUser}
            assetActivity={this.data.assetActivity} />
          &emsp;
          <ProjectMembershipEditorV2 
            canEdit={canEd}
            asset={asset}
            currUserId={currUserId}
            currUserProjects={currUserProjects}            
            handleToggleProjectName={this.handleToggleProjectName}
            />
        </div>

        <div className="sixteen wide column">
          <AssetEdit 
            asset={asset} 
            canEdit={canEd} 
            currUser={currUser}
            handleContentChange={this.deferContentChange}
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


  // See comment at top of file for format of m_deferredSaveObj
  deferContentChange(content2Object, thumbnail, changeText="content change")
  {
    const asset = this.data.asset   // TODO: Change interface so this gets passed in instead?

    if (this.m_deferredSaveObj)
    {
      const d = this.m_deferredSaveObj
      // too loud =) console.log("Replacing deferred save: ", d.assetId, asset._id, (new Date()) - d.timeOfLastChange)
    }
    this.m_deferredSaveObj = {
      assetId: asset._id,
      content2Object: content2Object, 
      thumbnail: thumbnail, 
      changeText: changeText,
      timeOfLastChange: new Date()
    }
    this.forceUpdate()  // Yuck, but I have to, coz I can't put a deferral data structure in this.state
  },


  // Note that can be called directly by the Sub-components. 
  // Primary use case is user hits 'save now' button
  handleSaveNowRequest: function()
  {
    console.log("User request: Save deferred changes now")
    this._attemptToSendAnyDeferredChanges({ forceResend: true })
  },


  // This 'flush' could be called by a 'tick' timer OR user force-save-click OR unmount (navigate away from page)
  // TODO: test props change of jump to different asset - is that a props change or an unmount?!!!
  _attemptToSendAnyDeferredChanges( options = {} )
  {
    const asset = this.data.asset
    if (this.m_deferredSaveObj)
    {
      if (!Meteor.status().connected)
      {
        console.log(`Can't send deferred save of asset ${asset.name} because the connection is currently offline`)
      }
      else
      {
        // We're connected... 
        // Do we think we are waiting for a pending write confirmation on this asset?
        if (asset && asset.isUnconfirmedSave && !options.forceResend)
        {
          console.log(`Won't send deferred save of asset ${asset.name} yet because the prior save's results are still pending. Keeping it in deferred save Object list so it Will retry later..`)
        }
        else
        {
          // At this point, we have an asset with a deferred save, the connection is up, and there is no pending Meteor RPC save for it..
          // ... so send the change to the server now
          this._doSendDeferredChangeNow()
        }
      }
    }
  },


  // No ifs and buts - just send any deferred change now (and immediately take it off of the deferred list)
  _doSendDeferredChangeNow()
  {
    const toBeSent = this.m_deferredSaveObj
    if (toBeSent)
    {
      const asset = this.data.asset
      if (asset && asset.isUnconfirmedSave)
      {
        console.log(`Warning: A save of asset ${asset.name} was still pending confirmation from server, but we are re-sending anyway`)
      }
      console.log(`Sending deferred change now. It has been deferred ${ ( (new Date()) - toBeSent.timeOfLastChange) / 1000}s so far`)
      this._sendContentChange(toBeSent.assetId, toBeSent.content2Object, toBeSent.thumbnail, toBeSent.changeText)
      this.m_deferredSaveObj = null
      // Note that potentially we can no longer recover from a failed save.. but the sub-component does have the data still..
    }
  },



  // Internal only. Can't be called by sub-components
  // This intentionally does NOT use or manipulate this.m_deferredSaveObj, nor is it smart about asset.isUnconfirmedSave
  _sendContentChange(assetId, content2Object, thumbnail, changeText="content change")
  {
    const updateObj = _makeUpdateObj(content2Object, thumbnail)
    Meteor.call('Azzets.update', assetId, this.canCurrUserEditThisAsset(), updateObj, (err, res) => {
      if (err) {
        console.error(`Azzets.update failed: ${err.reason}`, err)
        // Also TODO: What about the data we couldn't save?
      }
      else
      {
        console.log(`Azzets.update succeeded.`)
        // We will rely on the tick() to send any future pending saves
      }
    })
    
    logActivity("asset.edit", changeText, null, this.data.asset || { _id: assetId } ) 
  },


// This should not conflict with the deferred changes since those don't change these fields :)
  handleAssetDescriptionChange: function(newText) {
    if (newText !== this.data.asset.text) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), {text: newText}, (err, res) => {
        if (err) 
          this.props.showToast(err.reason, 'error')
      })      
      logActivity("asset.description",  `Update description to "${newText}"`, null, this.data.asset)
    }
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleAssetNameChange: function(newName) {
    if (newName !== this.data.asset.name) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), {name: newName}, (err, res) => {
        if (err)
          this.props.showToast(err.reason, 'error')
      })      
      logActivity("asset.rename",  `Rename to "${newName}"`, null, this.data.asset)
    }
    // TODO:  Call snapshotActivity after rename so it will fix up any stale names:
    // import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
    //            We would need the most recent passiveActivity which is asset-kind-specific
    //            so we need to pass down a handler for the asset-specific editors to let us
    //            invoke the snapshotActivity() call (a good idea anyway) and then we can re-use 
    //            the most recent passive activity 
    
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleWorkStateChange: function(newWorkState) {
    const oldState = this.data.asset.workState
    if (newWorkState !== oldState) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), {workState: newWorkState}, (err, res) => {
        if (err)
          this.props.showToast(err.reason, 'error')
      })
      logActivity("asset.workState",  `WorkState changed from ${oldState} to "${newWorkState}"`, null, this.data.asset)
    }
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleDeletedStateChange: function(newIsDeleted) {
    const { asset } = this.data
    
    if (asset && asset.isDeleted !== newIsDeleted) {
      Meteor.call('Azzets.update', asset._id, this.canCurrUserEditThisAsset(), { isDeleted: newIsDeleted}, (err, res) => {
        if (err)
          this.props.showToast(err.reason, 'error')
      })
      if (newIsDeleted)
        logActivity("asset.delete",  "Delete asset", null, asset)
      else
        logActivity("asset.undelete",  "Undelete asset", null, asset) 
    }
  },

  handleCompletedClick() {
    let newIsCompletedStatus = !this.props.asset.isCompleted
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isCompleted: newIsCompletedStatus}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }
    });
    
    if (newIsCompletedStatus)
      logActivity("asset.stable",  "Mark asset as stable", null, this.props.asset);
    else
      logActivity("asset.unstable",  "Mark asset as unstable", null, this.props.asset); 
  },

  handleStableStateChange: function(newIsCompleted) {
    const { asset } = this.data
    
    if (asset && asset.isCompleted !== newIsCompleted) {
      Meteor.call('Azzets.update', asset._id, this.canCurrUserEditThisAsset(), { isCompleted: newIsCompleted}, (err, res) => {
        if (err)
          this.props.showToast(err.reason, 'error')
      })
      if (newIsCompleted)
        logActivity("asset.stable",  "Marked asset as done", null, asset)
      else
        logActivity("asset.unstable",  "Marked asset as not done", null, asset)
    }
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleToggleProjectName: function(pName)
  {
    const { asset } = this.data
    const list = asset.projectNames || []
    const inList = _.includes(list, pName)
    let newChosenProjectNamesArray = inList ? _.without(list, pName) : _.union(list,[pName])
    newChosenProjectNamesArray.sort()

    Meteor.call('Azzets.update', asset._id, this.canCurrUserEditThisAsset(), {projectNames: newChosenProjectNamesArray}, (err, res) => {
      if (err)
        this.props.showToast(err.reason, 'error')
    })
    
    if (inList)
      logActivity("asset.project",  `removed Asset from project '${pName}'`, null, asset)
    else
      logActivity("asset.project",  `Added Asset to project '${pName}'`, null, asset)
  }  
  
})


function _makeUpdateObj(content2Object, thumbnail) {
  let updateObj = {}
  if (content2Object)
    updateObj.content2 = content2Object
  if (thumbnail)
    updateObj.thumbnail = thumbnail
  return updateObj
}
