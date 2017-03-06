import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Card, Icon, Popup } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { AssetKinds } from '/imports/schemas/assets'
import moment from 'moment'
import { logActivity } from '/imports/schemas/activity'
import ProjectMembershipEditor from './ProjectMembershipEditor'
import assetLicenses, { defaultAssetLicense } from '/imports/Enums/assetLicenses'
import WorkState from '/client/imports/components/Controls/WorkState'
import ChallengeState from '/client/imports/components/Controls/ChallengeState'
import { showToast } from '/client/imports/routes/App'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'

import Thumbnail from '/client/imports/components/Assets/Thumbnail'

import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'

// Note that middle-click mouse is a shortcut for open Asset in new browser Tab

export const assetViewChoices = {
  s: { showFooter: false, showWorkstate: true, showMeta: false, showExtra: false, showImg: false, tightRows: true },
  m: { showFooter: false, showWorkstate: true, showMeta: false, showExtra: true, showImg: true },
  l: { showFooter: false, showWorkstate: true, showMeta: true, showExtra: true, showImg: true },
  xl: { showFooter: true, showWorkstate: true, showMeta: true, showExtra: true, showImg: true }
}

export const defaultAssetViewChoice = 'm'

export default AssetCard = React.createClass({
  propTypes: {
    showFooter: PropTypes.bool, // If false, hide the 4-button footer
    fluid: PropTypes.bool, // If true then this is a fluid (full width) card.
    asset: PropTypes.object,
    ownersProjects: PropTypes.array, // Project array for Asset Owner. Can be null. Can include ones they are a member of, so watch out!
    currUser: PropTypes.object, // currently Logged In user (not always provided)
    canEdit: PropTypes.bool, // Whether changes (like stable, delete etc) are allowed. Can be false
    renderView: PropTypes.string, // One of null/undefined  OR  one of the keys of AssetCard.assetViewChoices
    allowDrag: PropTypes.bool.isRequired // True if drag is allowed
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      canEdit: false,
      renderView: defaultAssetViewChoice
    }
  },
  
  componentDidMount()
  {
    this.previewCanvas = ReactDOM.findDOMNode(this.refs.thumbnailCanvas)
    // this is here because React makes passive event listeners and it's not possible to prevent default from passive event listener
    // Drag on Touch devices broke on Feb6. See #478 (@stauzs). 
    // @dgolds put the startSyntheticDrag pieces back in here on 3/3, but it's not
    // working with scenarios like EditCode

    this.previewCanvas.addEventListener("touchstart", DragNDropHelper.startSyntheticDrag)

  },
  componentWillUnmount(){
    // See comment in componentDidMount() and #478
    this.previewCanvas.removeEventListener("touchstart", DragNDropHelper.startSyntheticDrag)
  },


  startDrag (e) {
    const { asset } = this.props
    //console.log(`AssetCard startDrag(${asset ? asset._id : 'null?'})..`)
    const url = `/api/asset/png/${asset._id}`

    // IE supports only text.. so - encode everything in the "text"
    e.dataTransfer.setData( 'text', JSON.stringify({ link: url, asset: asset }) )

    // allow to drop on graphics canvas
    /*try {
      e.dataTransfer.setData("mgb/image", thumbnail)
    }
    // IE will throw an error here.. just ignore
    catch (e) { } */

    // IE needs this:
    //   e.dataTransfer.effectAllowed = "copy"
    $(document.body).addClass('dragging') // this is in mgb.css
  },

  endDrag (e) {
    //const { asset } = this.props
    //console.log(`AssetCard stopDrag(${asset ? asset._id : 'null?'})..`)
    $(document.body).removeClass('dragging') // this is in mgb.css
  },

  render () {
    if (!this.props.asset) 
      return null

    const { renderView, asset, fluid, canEdit, allowDrag, ownersProjects } = this.props
    const actualLicense = !asset.assetLicense || asset.assetLicense.length === 0
      ? defaultAssetLicense
      : asset.assetLicense
    const assetKindIcon = AssetKinds.getIconName(asset.kind)
    const assetKindDescription = AssetKinds.getDescription(asset.kind)
    const assetKindName = AssetKinds.getName(asset.kind)
    const assetKindColor = AssetKinds.getColor(asset.kind)
    const viewOpts = assetViewChoices[renderView]
    const numChildForks = _.isArray(asset.forkChildren) ? asset.forkChildren.length : 0
    const hasParentFork = _.isArray(asset.forkParentChain) && asset.forkParentChain.length > 0
    const ago = moment(asset.updatedAt).fromNow() // TODO: Make reactive
    const ownerName = asset.dn_ownerName
    const veryCompactButtonStyle = { paddingLeft: '0.25em', paddingRight: '0.25em' }
    const chosenProjectNamesArray = asset.projectNames || []
    const availableProjectNamesArray = ownersProjects
      ? _.map(_.filter(ownersProjects, { ownerId: asset.ownerId }), 'name')
      : []
    const editProjects = (
      <ProjectMembershipEditor
        canEdit={canEdit}
        availableProjectNamesArray={availableProjectNamesArray}
        chosenProjectNames={chosenProjectNamesArray}
        handleChangeChosenProjectNames={this.handleChangeChosenProjectNames}
      />
    )
    const shownAssetName = asset.name || '(untitled)'
    const currUser = Meteor.user()

    return (
      <Card
        color={assetKindColor}
        fluid={fluid || viewOpts.tightRows}
        style={viewOpts.tightRows ? { marginTop: '1px', marginBottom: '1px' } : { userSelect: 'none' }}
        // We have to use OnMouseUp() and onTouchEnd() instead of onClick() since
        // onClick() can trigger at the end of a drag on mobile Chrome
        onMouseUp={this.handleEditClick}
        onTouchEnd={this.handleEditClick}
        onDragStart={this.startDrag}
        onDragEnd={this.endDrag}
        key={asset._id}
        // draggable must be explicitly set if element is not user-input, img, or link... see
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/draggable
        draggable
        className='animated fadeIn link'
      >

        <div
          className='ui centered image'
          style={{
            display: viewOpts.showImg ? 'initial' : 'none',
            overflow: 'hidden',
            width: '100%',
            minHeight: '155px',
            cursor: 'pointer',
            backgroundColor: 'white'
          }}
        >
          <Thumbnail
            asset={asset}
            ref='thumbnailCanvas'
            style={{
              margin: '0 auto',
              width: 'initial'
            }}
            className='mgb-pixelated'
          />
        </div>

        <Card.Content>
          {viewOpts.showWorkstate &&
            <span style={{ float: 'right' }}>
              <WorkState
               workState={asset.workState} 
               size={viewOpts.showExtra ? null : 'small'} 
               canEdit={false} />
            </span>}
          {!viewOpts.showExtra &&
            // This is used for SMALL sizes..
            <Popup
              hoverable
              mouseEnterDelay={500}
              positioning='left center'
              trigger={
                (
                  <div style={{ flexDirection: 'column' }}>
                    <Icon
                      style={{ float: 'left', marginRight: '12px' }}
                      color={assetKindColor}
                      size='large'
                      name={assetKindIcon}
                    />
                    {shownAssetName}
                  </div>
                )
              }
            >
              <div style={{ width: '200px' }}>
                <AssetCard {...{ ...this.props, renderView: 'm' }} />
              </div>
            </Popup>}

          {viewOpts.showExtra &&
            <Card.Header 
              content={shownAssetName} 
              style={{ marginRight: '2em', overflowWrap: 'break-word' }} 
            />}

          {viewOpts.showMeta &&
            <Card.Meta>
              <div>
                <Icon name='history' /><span>Updated {ago}</span>
              </div>
              <div style={{ color: numChildForks ? 'black' : null }}>
                <Icon name='fork' color={hasParentFork ? 'blue' : null} />
                <span>{numChildForks} Forks</span>
              </div>
              {editProjects}
            </Card.Meta>}

          {viewOpts.showMeta &&
            (asset.text && asset.text !== '') &&
            <Card.Description content={<small>{asset.text}</small>} />}

          {asset.isDeleted &&
            <div className='ui massive red corner label'>
              <span style={{ fontSize: '10px', paddingLeft: '10px' }}>DELETED</span>
            </div>}

        </Card.Content>

        {viewOpts.showExtra &&
          <Card.Content extra>
            <span
              style={{ color: assetKindColor }}
              className={'left floated ' + assetKindColor + ' icon label'}
              title={assetKindDescription}
            >
              <Icon color={assetKindColor} name={assetKindIcon} />
              {assetKindName}
              {asset.skillPath &&
                asset.skillPath.length > 0 &&
                <ChallengeState ownername={asset.dn_ownerName} asIcon={true} style={{marginLeft: '3px'}}/>}
            </span>
            <QLink to={`/u/${asset.dn_ownerName}`} title='Asset Owner. Click to go to their profile page.'>
              <div className='right floated author'>
                {currUser &&
                  currUser._id == asset.ownerId &&
                  <img
                    className='ui avatar image'
                    src={makeCDNLink(currUser.profile.avatar, makeExpireTimestamp(60))}
                  />}
                {(!currUser || currUser._id != asset.ownerId) &&
                  <img
                    className='ui avatar image'
                    src={makeCDNLink(`/api/user/${asset.ownerId}/avatar/60`, makeExpireTimestamp(60))}
                  />}
                {ownerName || `#${asset.ownerId}`}
              </div>
            </QLink>
          </Card.Content>}

        {viewOpts.showFooter &&
          <div className='ui three small bottom attached icon buttons'>
            <a
              to={assetLicenses[actualLicense].url}
              target='_blank'
              className='ui compact button'
              style={veryCompactButtonStyle}
              title={assetLicenses[actualLicense].name}
            >
              <Icon name='law' />
              <small>&nbsp;{actualLicense}</small>
            </a>
            <div
              className={(canEdit ? '' : 'disabled ') + 'ui ' + (asset.isCompleted ? 'blue' : '') + ' compact button'}
              style={veryCompactButtonStyle}
              onMouseUp={this.handleCompletedClick}
              onTouchEnd={this.handleCompletedClick}
            >
              <Icon name={asset.isCompleted ? 'lock' : 'unlock'} />
              <small>&nbsp;{asset.isCompleted ? 'Locked' : 'Unlocked'}</small>
            </div>
            <div
              className={(canEdit ? '' : 'disabled ') + 'ui compact button'}
              style={veryCompactButtonStyle}
              onMouseUp={this.handleDeleteClick}
              onTouchEnd={this.handleDeleteClick}
            >
              {asset.isDeleted ? null : <Icon color='red' name='trash' />}
              <small>&nbsp;{asset.isDeleted ? 'Undelete' : 'Delete'}</small>
            </div>
          </div>}
      </Card>
    )
  },

  /**
   * Used by the functions below as the Meteor (err, response) callback
   *
   * @param {any} err
   */
  _handleMeteorErrResp (err) {
    if (err) 
      showToast(err.reason, 'error')
  },

  handleChangeChosenProjectNames (newChosenProjectNamesArray) {
    newChosenProjectNamesArray.sort()
    Meteor.call(
      'Azzets.update',
      this.props.asset._id,
      this.props.canEdit,
      { projectNames: newChosenProjectNamesArray },
      this._handleMeteorErrResp
    )

    let projectsString = newChosenProjectNamesArray.join(', ')
    logActivity('asset.project', `now in projects ${projectsString}`, null, this.props.asset)
  },

  handleDeleteClick (e) {
    let newIsDeletedState = !this.props.asset.isDeleted
    Meteor.call(
      'Azzets.update',
      this.props.asset._id,
      this.props.canEdit,
      { isDeleted: newIsDeletedState },
      this._handleMeteorErrResp
    )

    if (newIsDeletedState) 
      logActivity('asset.delete', 'Delete asset', null, this.props.asset)
    else 
      logActivity('asset.undelete', 'Undelete asset', null, this.props.asset)

    e.preventDefault()
    e.stopPropagation()
  },

  handleCompletedClick (e) {
    let newIsCompletedStatus = !this.props.asset.isCompleted
    Meteor.call(
      'Azzets.update',
      this.props.asset._id,
      this.props.canEdit,
      { isCompleted: newIsCompletedStatus },
      this._handleMeteorErrResp
    )

    if (newIsCompletedStatus) 
      logActivity('asset.stable', 'Mark asset as stable', null, this.props.asset)
    else 
      logActivity('asset.unstable', 'Mark asset as unstable', null, this.props.asset)

    e.preventDefault()
    e.stopPropagation()
  },

  handleEditClick (e) {
    const asset = this.props.asset
    const url = '/u/' + asset.dn_ownerName + '/asset/' + asset._id
    // middle click - mouseUp reports buttons == 0; button == 1
    if (e.buttons == 4 || e.button == 1) 
      window.open(url + (window.location.search ? window.location.search : ''))
    else 
      utilPushTo(this.context.urlLocation.query, url)
  }
})
