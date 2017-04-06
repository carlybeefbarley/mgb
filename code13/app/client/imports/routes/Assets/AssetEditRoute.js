import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Grid, Icon, Message } from 'semantic-ui-react'
import { utilPushTo, utilReplaceTo, utilShowChatPanelChannel } from '../QLink'
import reactMixin from 'react-mixin'

import Spinner from '/client/imports/components/Nav/Spinner'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import Helmet from 'react-helmet'

import AssetEdit from '/client/imports/components/Assets/AssetEdit'
import { AssetKinds } from '/imports/schemas/assets'

import { isSameUserId } from '/imports/schemas/users'
import { logActivity } from '/imports/schemas/activity'
import { ActivitySnapshots, Activity } from '/imports/schemas'
import { defaultAssetLicense } from '/imports/Enums/assetLicenses'
import { makeAssetInfoFromAsset } from '/imports/schemas/assets/assets-client'
import { showToast } from '/client/imports/routes/App'

import WorkState from '/client/imports/components/Controls/WorkState'
import StableState from '/client/imports/components/Controls/StableState'
import AssetLicense from '/client/imports/components/Controls/AssetLicense'
import DeletedState from '/client/imports/components/Controls/DeletedState'
import ChallengeState from '/client/imports/components/Controls/ChallengeState'
import AssetPathDetail from '/client/imports/components/Assets/AssetPathDetail'
import AssetUrlGenerator from '/client/imports/components/Assets/AssetUrlGenerator'
import AssetForkGenerator from '/client/imports/components/Assets/AssetForkGenerator'
import AssetChatDetail from '/client/imports/components/Assets/AssetChatDetail'
import AssetHistoryDetail from '/client/imports/components/Assets/AssetHistoryDetail'
import AssetActivityDetail from '/client/imports/components/Assets/AssetActivityDetail'
import ProjectMembershipEditorV2 from '/client/imports/components/Assets/ProjectMembershipEditorV2'

import SuperAdminAssetControl from '/client/imports/components/Assets/SuperAdminAssetControl'
import TaskApprove from '/client/imports/components/Assets/TaskApprove'

import { makeChannelName } from '/imports/schemas/chats'

import { getAssetHandlerWithContent2 } from '/client/imports/helpers/assetFetchers'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

import { canUserEditAssetIfUnlocked, fAllowSuperAdminToEditAnything } from '/imports/schemas/roles'

import { learnSkill, forgetSkill } from '/imports/schemas/skills'

const FLUSH_TIMER_INTERVAL_MS = 6000         // Milliseconds between timed flush attempts (TODO: Put in SpecialGlobals)

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
  // And this structure is set in deferContentChange()
  // ... Note that this isn't being stored in React's this.state.___ because we need access to it after the component has been unmounted
  /// (Hmm.. maybe I should create a global state container for this outside this component?)


export const offerRevertAssetToForkedParentIfParentIdIs = forkParentId => {
  const event = new CustomEvent('mgbOfferRevertToFork', { 'detail': forkParentId } )
  setTimeout(() => { window.dispatchEvent(event) }, 0) // Prevent setState during render if this was called due to render
}

const _makeTitle = (kind, hasUnsentSaves, isUnconfirmedSave, assetName) => {
  const assetKindName = AssetKinds.getName(kind)
  const unsavedMarker = hasUnsentSaves ? '〉' : (isUnconfirmedSave ? '》' : ' ')
  return `${assetKindName}: ${unsavedMarker}'${assetName || '(unnamed)'}'`
}

export default AssetEditRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params:           PropTypes.object,      // params.assetId is the ASSET id
    user:             PropTypes.object,
    currUser:         PropTypes.object,
    currUserProjects: PropTypes.array,       // Both Owned and memberOf. Check ownerName / ownerId fields to know which
    isSuperAdmin:     PropTypes.bool,
    ownsProfile:      PropTypes.bool,        // true IFF user is valid and asset owner is currently logged in user
    hazUnreadAssetChat: PropTypes.bool,      // true IFF there is unread chat for this asset
    handleSetCurrentlyEditingAssetInfo: PropTypes.func    // We should call this to set/clear current asset kind
  },

  getInitialState: function () {
    this.getActivitySnapshots = () => this.data.activitySnapshots
    return {
      isForkPending:       false,
      isDeletePending:     false,
      isForkRevertPending: false
    }
  },

  contextTypes: {
    urlLocation: React.PropTypes.object,
    skills: React.PropTypes.object 
  },


  // We also support a route which omits the user id, but if we see that, we redirect to get the path that includes the userId
  // TODO: Make this QLink-smart so it preserves queries
  checkForRedirect() {
    if (!this.props.user && !!this.data.asset) {
      // don't push - just replace #225 - back button not always work
      utilReplaceTo(this.context.urlLocation.query, "/u/" + this.data.asset.dn_ownerName + "/asset/" + this.data.asset._id)
    }
  },

  revertDataFromForkParent_ResultCallBack: function (error, result) {
    if (error)
      showToast(`Unable to revert content to ForkParent for this asset: '${error.toString()}'`, 'error')
    else {
      showToast(`Reverted to Fork Parent's data`, 'success')
      logActivity("asset.fork.revertTo", "Reverted to Fork Parent's data", null, this.data.asset )
    }

    this.setState( { isForkRevertPending: false } )
  },


  addListenersOnMount() {
    this.listeners = {}
    // mgbOfferRevertToFork handler
    this.listeners.mgbOfferRevertToFork = e => {
      const { asset } = this.data
      if (!asset || !this.canCurrUserEditThisAsset())
        return
      const forkParentId = e.detail
      const fpc = asset.forkParentChain
      if (!fpc || !_.isArray(fpc) || fpc.length === 0)
        return
      if (fpc[0].parentId !== forkParentId)
        return

      // ok, so this is the right asset being targetted by the mgbOfferRevertToFork() message..
      // TODO: How to offer undo?
      this.setState( { isForkRevertPending: true } )
      Meteor.call('Azzets.revertDataFromForkParent', asset._id, forkParentId, this.revertDataFromForkParent_ResultCallBack)
    }
    window.addEventListener('mgbOfferRevertToFork', this.listeners.mgbOfferRevertToFork)
  },

  removeListenersOnUnmount() {
    window.removeEventListener('mgbOfferRevertToFork', this.listeners.mgbOfferRevertToFork)
  },

  componentDidMount() {
    this.checkForRedirect()
    this.m_deferredSaveObj = null
    this.addListenersOnMount()

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
      this._attemptToSendAnyDeferredChanges( { forceResend: true } )
    }

    // stop subscription handler
    this.assetHandler.stop()
    this.assetHandler = null

    this.removeListenersOnUnmount()

    // Clear Asset kind status for parent App
    if (this.props.handleSetCurrentlyEditingAssetInfo)
      this.props.handleSetCurrentlyEditingAssetInfo( {} )
  },

  componentDidUpdate() {
    this.checkForRedirect()
  },

  getMeteorData: function() {
    let assetId = this.props.params.assetId
    const assetHandler = this.assetHandler = getAssetHandlerWithContent2(assetId, () => {
      if (this.assetHandler)
        this.forceUpdate()
    }, !!this.m_deferredSaveObj)

    // TODO: Discuss with @stauzs to see if there are other cases to cover?
    const asset = this.assetHandler.asset
    if (asset && this.props.handleSetCurrentlyEditingAssetInfo)
    {
      const assetVerb = (
        ( (this.canCurrUserEditThisAsset(asset) ? 'Edit' : 'View')
          + (asset.isCompleted ? '  [locked asset]' : '')
          + (asset.isDeleted ? '  [deleted asset]' : '')
         )
      )
      this.props.handleSetCurrentlyEditingAssetInfo( makeAssetInfoFromAsset(asset, assetVerb) )
    }

    let handleForActivitySnapshots = Meteor.subscribe("activitysnapshots.assetid", assetId)
    let handleForAssetActivity = Meteor.subscribe("activity.public.recent.assetid", assetId)

    let selector = { toAssetId: assetId }
    let options = { sort: { timestamp: -1 } }

    return {
      get asset() {
        return assetHandler.asset
      },

      // special case when assetHandler will fail to load asset
      get isDeleted(){
        return assetHandler.isDeleted
      },
      // this will allow asset c2 update without extra ajax call
      update(updateObj) {
        assetHandler.update(null, updateObj)
      },

      activitySnapshots: ActivitySnapshots.find(selector, options).fetch(),
      assetActivity: Activity.find(selector, options).fetch(),

      get loading() {
        return !assetHandler.isReady
      }    // Child components must be aware that 'activitySnapshots' and 'assetActivity' may still be loading. But we don't wait for them
    }
  },


  canCurrUserEditThisAsset: function(assetOverride = null) {
    const asset = assetOverride || this.data.asset
    return asset && this.canUserEditThisAssetIfUnlocked(asset) && !asset.isCompleted
  },

  canUserEditThisAssetIfUnlocked: function(assetOverride = null) {
    if (this.data.loading || !this.props.currUser)
      return false  // Need to at least be logged in and have the data to do any edits!

    const asset = assetOverride || this.data.asset
    return canUserEditAssetIfUnlocked(asset, this.props.currUserProjects, this.props.currUser)
  },

  // only the Asset Owner can Lock/Unlock Asset (i.e. change asset.isCompleted)
  canCurrUserChangeCompletion(assetOverride = null) {
    const asset = assetOverride || this.data.asset
    const { currUser } = this.props

    if (!asset || this.data.loading || !currUser)
      return false  // Need to at least be logged in and have the data to do any edits...

    // Are we superAdmin?
    if (this.props.isSuperAdmin && fAllowSuperAdminToEditAnything)
    {
      console.log(`canCurrUserChangeCompletion=true because current User is SuperAdmin`)
      return true
    }

    return isSameUserId(asset.ownerId, currUser._id)
  },

  doForkAsset: function() {
    if (!this.state.isForkPending) {
      const { asset } = this.data
      Meteor.call("Azzets.fork", asset._id, this.forkResultCallback)
      this.setState( { isForkPending: true } )
    }
  },

  // This result object will come from Meteor.call("Azzets.fork")
  forkResultCallback: function (error, result) {
    if (error)
      showToast(`Unable to create a forked copy of this asset: '${error.toString()}'`, 'error')
    else {
      showToast(`Loading your new Asset`, 'success')
      logActivity("asset.fork.from", "Forked new asset from this asset", null, this.data.asset )
      logActivity("asset.fork.to", "Forked this new asset from another asset", null, result.newAssetNoC2 )

      utilPushTo(this.context.urlLocation.query, "/u/" + this.props.currUser.username + "/asset/" + result.newId)
      joyrideCompleteTag('mgbjr-CT-asset-fork')
    }

    this.setState( { isForkPending: false } )
  },

  render: function() {
    if (this.data.loading)
      return <Spinner />

    const { params, currUser, currUserProjects, availableWidth, hazUnreadAssetChat, isSuperAdmin } = this.props
    const { isForkPending, isDeletePending } = this.state
    const isTooSmall = availableWidth < 500

    let asset = Object.assign( {}, this.data.asset )        // One Asset provided via getMeteorData()
    if (!this.data.asset)
      return <ThingNotFound type='Asset' id={params.assetId} />

    const isOwner = currUser && isSameUserId(currUser._id, asset.ownerId)
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
    const canEdCompleted = this.canCurrUserChangeCompletion()
    const canEdIfUnlocked = this.canUserEditThisAssetIfUnlocked()
    const currUserId = currUser ? currUser._id : null
    const hasUnsentSaves = !!this.m_deferredSaveObj

    return (
      <Grid padded style={{overflowX: 'hidden'/* this will prevent padding (+v scrolling) caused by mgbjr-asset-edit-header-right when all icons don't fit in the new line*/}}>

        <Helmet
          title={ _makeTitle(asset.kind, hasUnsentSaves, asset.isUnconfirmedSave, asset.name) }
          meta={[ { "name": "Asset Editor", "content": "Assets" } ]}
        />

        { !isTooSmall &&
            <AssetPathDetail
              canEdit={canEd}
              isUnconfirmedSave={asset.isUnconfirmedSave}
              hasUnsentSaves={hasUnsentSaves}
              ownerName={asset.dn_ownerName}
              kind={asset.kind}
              name={asset.name}
              text={asset.text}
              lastUpdated={asset.updatedAt}
              handleNameChange={this.handleAssetNameChange}
              handleDescriptionChange={this.handleAssetDescriptionChange}
              handleSaveNowRequest={this.handleSaveNowRequest} />
        }

        { !isTooSmall &&
          <Grid.Column width='8' textAlign='right' id="mgbjr-asset-edit-header-right">
            {
              // We use this.props.params.assetId since it is available sooner than the asset
              // TODO: Take advantage of this by doing a partial render when data.asset is not yet loaded
            }
            { this.state.isForkRevertPending &&
              <Icon name='fork' loading />
            }
            <WorkState
              workState={asset.workState}
              canEdit={canEd}
              handleChange={this.handleWorkStateChange} />
            &ensp;
            <AssetUrlGenerator showBordered={true} asset={asset} />
            <StableState
              isStable={asset.isCompleted}
              showMicro={true}
              canEdit={canEdCompleted}
              handleChange={this.handleStableStateChange} />
            <DeletedState
              isDeleted={asset.isDeleted}
              operationPending={isDeletePending}
              canEdit={canEdIfUnlocked}
              handleChange={this.handleDeletedStateChange} />
            <AssetChatDetail hasUnreads={hazUnreadAssetChat} handleClick={this.handleChatClick}/>
            <AssetLicense
              license={asset.assetLicense}
              canEdit={canEd}
              handleChange={this.handleLicenseChange} />
            <AssetActivityDetail
              assetId={params.assetId}
              currUser={currUser}
              activitySnapshots={this.getActivitySnapshots()} />
            <AssetHistoryDetail
              asset={asset}
              currUser={currUser}
              assetActivity={this.data.assetActivity} />
            { asset.skillPath && asset.skillPath.length > 0 &&
              <ChallengeState ownername={asset.dn_ownerName}/>
            }
            <AssetForkGenerator
              asset={asset}
              canFork={currUser !== null}
              doForkAsset={this.doForkAsset}
              isForkPending={isForkPending} />
            <ProjectMembershipEditorV2
              canEdit={canEd}
              asset={asset}
              currUserId={currUserId}
              currUserProjects={currUserProjects}
              handleToggleProjectName={this.handleToggleProjectName} />
            { isSuperAdmin && asset.skillPath &&
              <TaskApprove 
                asset={asset} 
                ownerID={asset.ownerId}
                handleTaskApprove={this.handleTaskApprove} />
            }
            { isSuperAdmin &&
              <SuperAdminAssetControl asset={asset} handleToggleBan={this.handleToggleBanState} />
            }
          </Grid.Column>
        }

        { asset.suIsBanned &&
          <Grid.Column width='16'>
            <Message error
              icon='ban'
              header='This Asset has been Banned'
              list={[
                'The content does not meet the standards of our Code of Conduct',
                'Only an Admin can remove the Ban',
                'Only the Asset owner can view the banned content']}/>
          </Grid.Column>
        }

        { (!asset.suIsBanned || isOwner) &&
          <Grid.Column width='16' style={{overflow: 'auto' /* restore overflow for editors - as we disabled it above ???? */}}>
            <AssetEdit
              key={asset._id}
              asset={asset}
              canEdit={canEd}
              availableWidth={availableWidth}
              currUser={currUser}
              handleContentChange={this.deferContentChange}
              handleMetadataChange={this.handleMetadataChange}
              handleDescriptionChange={this.handleAssetDescriptionChange}
              editDeniedReminder={this.handleEditDeniedReminder}
              getActivitySnapshots={this.getActivitySnapshots}
              hasUnsentSaves={hasUnsentSaves}
              handleSaveNowRequest={this.handleSaveNowRequest}
            />
          </Grid.Column>
        }
      </Grid>
    )
  },

  handleEditDeniedReminder: _.throttle(function()
  {
    // This is a style on the Edit/view tag in render()
    $('.mgbReadOnlyReminder').transition({ animation: 'flash', duration: '800ms' })
    if (this.props.currUser) {
      if (!this.canUserEditThisAssetIfUnlocked())
        showToast("You do not have edit permission for this Asset. Ask owner to join their Project, or fork this asset", 'error')
      else
      {
        if (this.canCurrUserChangeCompletion())
          showToast("This Asset is Locked. Unlock it to enable editing", 'error')
        else
          showToast("Asset is Locked. Fork it or ask the owner to Unlock it for editing", 'error')
      }
    }
    else
      showToast("Not logged in. You must Log in to edit Assets", 'error')
  }, 5000),  // 5000ms is the duration of an error Notification

  // See comment at top of file for format of m_deferredSaveObj. We only defer content2 and thumbnail because they are slowest.
  // TODO: Consider benefits of also deferring metadata in the same model... however, it won't conflict for now since we don't
  //       touch asset.metadata in this method
  deferContentChange(content2Object, thumbnail, changeText="content change")
  {
    const asset = this.data.asset   // TODO: Change interface so this gets passed in instead?

    const old_deferredSaveObj = this.m_deferredSaveObj

    if (this.m_deferredSaveObj)
    {
      // const d = this.m_deferredSaveObj
      // too loud =) console.log("Replacing deferred save: ", d.assetId, asset._id, (new Date()) - d.timeOfLastChange)
    }
    this.m_deferredSaveObj = {
      assetId: asset._id,
      changeText: changeText,
      timeOfLastChange: new Date()
    }
    if (content2Object)
      this.m_deferredSaveObj.content2Object = content2Object
    if (thumbnail)
      this.m_deferredSaveObj.thumbnail = thumbnail

    if (old_deferredSaveObj && old_deferredSaveObj.assetId === asset._id)
    {
      // Look for nuked fields

      // 1. Thumbnail
      if (old_deferredSaveObj.thumbnail && old_deferredSaveObj.thumbnail !== '' && !thumbnail)
      {
        // console.log('deferContentChange: reinstating thumbnail for asset: ', old_deferredSaveObj.thumbnail)
        this.m_deferredSaveObj.thumbnail = old_deferredSaveObj.thumbnail
      }

      // 2. content2Object
      if (old_deferredSaveObj.content2Object && !content2Object)
      {
        // console.log('deferContentChange: reinstating content2 for asset: ', old_deferredSaveObj.content2Object)
        this.m_deferredSaveObj.content2Object = old_deferredSaveObj.content2Object
      }
    }

    this.forceUpdate()  // YUCK, but I think I have to, coz I can't put a deferral data structure in this.state. TODO.. revisit this soon
  },


  // Note that can be called directly by the Sub-components.
  // Primary use case is user hits 'save now' button, or 'play now'
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
    if(content2Object){
      this.data.update(updateObj)
    }
    logActivity("asset.edit", changeText, null, this.data.asset || { _id: assetId } )
  },


// This should not conflict with the deferred changes since those don't change these fields :)
  handleAssetDescriptionChange: function(newText) {
    if (newText !== this.data.asset.text) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), {text: newText}, (err, res) => {
        if (err)
          showToast(err.reason, 'error')
      })
      logActivity("asset.description",  `Update description to "${newText}"`, null, this.data.asset)
    }
  },

// TODO(@dgolds): This should probably also trigger a save of any pending content2
// This should not conflict with the deferred changes since those don't change these fields :)
  handleMetadataChange: function(newMetadata) {
    Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), { metadata: newMetadata }, (err, res) => {
      if (err)
        showToast(err.reason, 'error')
    })
    logActivity("asset.metadata",  `Update metadata of asset`, null, this.data.asset)
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleAssetNameChange: function(newName) {
    if (newName !== this.data.asset.name) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), {name: newName}, (err, res) => {
        if (err)
          showToast(err.reason, 'error')
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
  handleLicenseChange: function(newLicense) {
    const oldLicense = this.data.asset.assetLicense
    if (newLicense !== oldLicense) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), { assetLicense: newLicense}, (err, res) => {
        if (err)
          showToast(err.reason, 'error')
      })
      logActivity("asset.license",  `License changed from ${oldLicense || defaultAssetLicense} to "${newLicense}"`, null, this.data.asset)
    }
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleWorkStateChange: function(newWorkState) {
    const oldState = this.data.asset.workState
    if (newWorkState !== oldState) {
      Meteor.call('Azzets.update', this.data.asset._id, this.canCurrUserEditThisAsset(), {workState: newWorkState}, (err, res) => {
        if (err)
          showToast(err.reason, 'error')
      })
      logActivity("asset.workState",  `WorkState changed from ${oldState} to "${newWorkState}"`, null, this.data.asset)
    }
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleDeletedStateChange: function(newIsDeleted) {
    const { asset } = this.data
    const canEd = this.canCurrUserEditThisAsset()
    if (!asset)
      return

    if (!canEd)
    {
      this.handleEditDeniedReminder() /// Give clear message if asset is locked
      return
    }
    if (asset.isDeleted !== newIsDeleted) {
      this.setState( { isDeletePending: true } )
      Meteor.call('Azzets.update', asset._id, canEd, { isDeleted: newIsDeleted }, (err, res) => {
        if (err)
          showToast(err.reason, 'error')
      })
      if (newIsDeleted)
        logActivity("asset.delete",  "Delete asset", null, asset)
      else
        logActivity("asset.undelete",  "Undelete asset", null, asset)
      this.setState( { isDeletePending: false} )
    }
  },

  handleChatClick() {
    const channelName = makeChannelName( { scopeGroupName: 'Asset', scopeId: this.props.params.assetId } )
    joyrideCompleteTag('mgbjr-CT-asset-edit-header-right-chat')
    utilShowChatPanelChannel(this.context.urlLocation, channelName)
  },

  handleStableStateChange: function(newIsCompleted) {
    const { asset } = this.data
    if (!asset)
      return

    if (asset.isCompleted !== newIsCompleted) {

      if (asset.isDeleted === true && newIsCompleted === true)
      {
        showToast("Asset is deleted. It doesn't make sense to Lock it", 'error')
        return
      }

      Meteor.call('Azzets.update', asset._id, this.canCurrUserChangeCompletion(), { isCompleted: newIsCompleted}, (err, res) => {
        if (err)
          showToast(err.reason, 'error')
      })
      if (newIsCompleted)
        logActivity("asset.stable",  "Locked an asset", null, asset)
      else
        logActivity("asset.unstable",  "Unlocked an asset", null, asset)
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
        showToast(err.reason, 'error')
    })

    if (inList)
      logActivity("asset.project",  `removed Asset from project '${pName}'`, null, asset)
    else
      logActivity("asset.project",  `Added Asset to project '${pName}'`, null, asset)
  },

  handleTaskApprove: function(hasSkill)
  {
    const { asset } = this.data
    const skillPath = this.data.asset.skillPath
    const assetUserID = this.props.user._id
    if ( hasSkill ) 
    {
      forgetSkill(skillPath, assetUserID) 
      logActivity("task.disapprove",  `Disapproved Task`, null, asset)
    }
    else 
    {
      learnSkill(skillPath, assetUserID)
      logActivity("task.approve",  `Approved Task`, null, asset)
    }
  },

// This should not conflict with the deferred changes since those don't change these fields :)
  handleToggleBanState: function()
  {
    const { asset } = this.data
    const newBanState = !asset.suIsBanned

    Meteor.call('Azzets.changeAssetBan', asset._id, newBanState, err => {
      if (err)
        showToast(err.reason, 'error')
    })

    if (newBanState)
      logActivity("asset.ban",  `Banned Asset`, null, asset)
    else
      logActivity("asset.unban",  `Un-banned Asset`, null, asset)
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
