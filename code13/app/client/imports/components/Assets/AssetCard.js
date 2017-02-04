import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import QLink, { utilPushTo } from "/client/imports/routes/QLink"
import { AssetKinds } from '/imports/schemas/assets'
import moment from 'moment'
import { logActivity } from '/imports/schemas/activity'
import ProjectMembershipEditor from './ProjectMembershipEditor'
import assetLicenses, { defaultAssetLicense } from '/imports/Enums/assetLicenses'
import WorkState from '/client/imports/components/Controls/WorkState'
import { showToast } from '/client/imports/routes/App'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'

import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
// TODO: Toast/error is a mess

// Note that middle-click mouse is a shortcut for open Asset in new browser Tab

export const assetViewChoices =  { 
  "xs": { icon: '', showFooter: false, header: '',       showWorkstate: true,  showMeta: false, showExtra: false, showHdr: true,  showImg: false },
  "s":  { icon: '', showFooter: false, header: '',       showWorkstate: true,  showMeta: false, showExtra: false, showHdr: true,  showImg: true  },
  "m":  { icon: '', showFooter: false, header: 'header', showWorkstate: true,  showMeta: false, showExtra: true,  showHdr: true,  showImg: true  },
  "l":  { icon: '', showFooter: false, header: 'header', showWorkstate: true,  showMeta: true,  showExtra: true,  showHdr: true,  showImg: true  },
  "xl": { icon: '', showFooter: true,  header: 'header', showWorkstate: true,  showMeta: true,  showExtra: true,  showHdr: true,  showImg: true  }
}

export const defaultAssetViewChoice = 'm'

export default AssetCard = React.createClass({

  propTypes: {
    showFooter:     PropTypes.bool,              // If false, hide the 4-button footer
    fluid:          PropTypes.bool,              // If true then this is a fluid (full width) card. 
    asset:          PropTypes.object,
    ownersProjects: PropTypes.array,             // Project array for Asset Owner. Can be null. Can include ones they are a member of, so watch out!
    currUser:       PropTypes.object,            // currently Logged In user (not always provided)
    canEdit:        PropTypes.bool,              // Whether changes (like stable, delete etc) are allowed. Can be false
    renderView:     PropTypes.string,            // One of null/undefined  OR  one of the keys of AssetCard.assetViewChoices
    allowDrag:      PropTypes.bool.isRequired    // True if drag is allowed
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  getDefaultProps: function()  {
    return {
      canEdit: false,
      renderView: defaultAssetViewChoice
    }
  },
  
  componentDidMount()
  {
    this.previewCanvas = ReactDOM.findDOMNode(this.refs.thumbnailCanvas)
    this.previewCtx = this.previewCanvas.getContext('2d')

    // this is here because React makes passive event listeners and it's not possible to prevent default from passive event listener
    this.previewCanvas.addEventListener("touchstart", DragNDropHelper.startSyntheticDrag)

    this.loadThumbnail()
  },
  componentWillUnmount(){
    this.previewCanvas.removeEventListener("touchstart", DragNDropHelper.startSyntheticDrag)
  },
  componentDidUpdate()
  {
    this.loadThumbnail()
  },
  
  loadThumbnail()
  {
    const { renderView, asset } = this.props
    const viewOpts = assetViewChoices[renderView]

    if (viewOpts.showImg && asset.hasOwnProperty("thumbnail"))
      this.loadPreviewFromDataURI(asset.thumbnail)      
  },
  
  loadPreviewFromDataURI(dataURI)
  {
    if (dataURI === undefined || dataURI.length == 0)
      return
    if (dataURI.startsWith("data:image/png;base64,"))
    {
      var _img = new Image
      var _ctx = this.previewCtx
      _img.src = dataURI   // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
      _img.onload = () => {
        if (this.previewCanvas.width !== _img.width || this.previewCanvas.height !== _img.height)
        {          
          this.previewCanvas.width = _img.width
          this.previewCanvas.height = _img.height
        }
        _ctx.clearRect(0 , 0, _img.width, _img.height)
        _ctx.drawImage(_img,0,0)  // needs to be done in onload...
        // TODO - there may be an event leak of _img?
      }
    }
    else
      console.error("Unrecognized graphic data URI")
  },

  startDrag(asset, e) {
    const url  = `/api/asset/png/${asset._id}`
    console.log("Start dragging Asset  url=", url)

    // IE supports only text.. so - encode everything in the "text"
    e.dataTransfer.setData("text", JSON.stringify({
      link: url,
      asset: asset
    }))

    // allow to drop on graphics canvas
    try {
      e.dataTransfer.setData("mgb/image", asset.thumbnail)
    }
    // IE will throw an error here.. just ignore
    catch (e) { }

    // IE needs this!!!
    // e.dataTransfer.effectAllowed = "copy"
    $(document.body).addClass("dragging")
  },

  endDrag(asset, e) {
    $(document.body).removeClass("dragging")
  },

  render() {
    if (!this.props.asset)
      return null
      
    const { renderView, asset, fluid, canEdit, allowDrag, ownersProjects } = this.props
    const actualLicense = (!asset.assetLicense || asset.assetLicense.length === 0) ? defaultAssetLicense : asset.assetLicense
    const assetKindIcon = AssetKinds.getIconClass(asset.kind)
    const assetKindDescription = AssetKinds.getDescription(asset.kind)
    const assetKindName = AssetKinds.getName(asset.kind)
    const assetKindColor = AssetKinds.getColor(asset.kind)
    const c2 = asset.content2 || { width:64, height:64 }
    const viewOpts = assetViewChoices[renderView]

    const iw = c2.hasOwnProperty("width") ? c2.width : 64
    const ih = c2.hasOwnProperty("height") ? c2.height : 64
    const ago = moment(asset.updatedAt).fromNow()      // TODO: Make reactive
    const ownerName = asset.dn_ownerName
    
    const veryCompactButtonStyle = { paddingLeft: '0.25em', paddingRight: '0.25em' }
    // Project Membership editor
    
    const chosenProjectNamesArray = asset.projectNames || []

    const availableProjectNamesArray = 
        ownersProjects ? 
          _.map(_.filter(ownersProjects, {"ownerId": asset.ownerId}), 'name')
        : []
    const editProjects = (
      <ProjectMembershipEditor 
          canEdit={canEdit}
          availableProjectNamesArray={availableProjectNamesArray}
          chosenProjectNames={chosenProjectNamesArray}
          handleChangeChosenProjectNames={this.handleChangeChosenProjectNames} />
    )
    const shownAssetName = asset.name || '(untitled)'
    const currUser = Meteor.user()

    // TODO: Find how to add style={overflow: "hidden"} back to the div style of 'ui card' without hitting the off-window-images-dont-get-rendered problem that seems unique to Chrome
    return (
      <div 
          key={asset._id} 
          className={'ui ' + assetKindColor + (fluid ? ' fluid ' : '') + ' card animated fadeIn'}
          style={ { minWidth: '220px' } }>
      
        <div 
            className="ui centered image" 
            onMouseUp={this.handleEditClick}
            onTouchEnd={this.handleEditClick}
            style={{
              display: viewOpts.showImg ? 'initial' : 'none',
              overflow: "hidden"
              }}>
          <canvas 
            className="mgb-pixelated"
            ref="thumbnailCanvas" 
            width={iw} 
            height={ih} 
            style={{backgroundColor: '#ffffff', minHeight:"150px", maxHeight:"150px", maxWidth:"220px", width:"auto"}}
            draggable={allowDrag ? "true" : "false"}
            onDragStart={this.startDrag.bind(this, asset)}
            onDragEnd={this.endDrag.bind(this, asset)}
            />
        </div>

        { viewOpts.showHdr && 
          <div className="content">
            <i className={'right floated ' + assetKindColor + ' ' + assetKindIcon + ' icon'} />
            <a  className={ viewOpts.header }
                style={{ "color": asset.name ? 'black' : '#888',
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                onClick={this.handleEditClick} 
                title={ `Asset Name: '${shownAssetName}'` }>
              <small>
                {shownAssetName}
                &nbsp;
                { viewOpts.showWorkstate &&
                  <WorkState 
                    workState={asset.workState} 
                    popupPosition="bottom center"
                    showMicro={true}
                    canEdit={false}/>
                }
              </small>
            </a>
            { viewOpts.showMeta && (asset.text && asset.text !== "") && 
              <div className="meta" style={{ "color": 'black'}}  onClick={this.handleEditClick} title="Asset Description">
                <small>{asset.text}</small>
              </div>
            }
          
            { asset.isDeleted &&            
              <div className="ui massive red corner label"><span style={{fontSize: "10px", paddingLeft: "10px"}}>DELETED</span></div>
            }

            { viewOpts.showMeta && 
              <div className="meta">
                <small>          
                  { editProjects }
                  Updated {ago} 
                </small>
              </div>
            }
          </div>
        }
        
        { viewOpts.showExtra && 
          <div className="extra content">
            <span style={{color: assetKindColor}} className={"left floated " + assetKindColor + " icon label"} title={assetKindDescription}>
              <i className={"large " + assetKindColor + ' ' + assetKindIcon}></i>
              { assetKindName }
            </span>                           
            <QLink to={`/u/${asset.dn_ownerName}`} title="Asset Owner. Click to go to their profile page.">
              <div className="right floated author">
                {currUser && currUser._id == asset.ownerId &&
                  <img className="ui avatar image" src={makeCDNLink(currUser.profile.avatar)}></img>
                }
                {(!currUser || currUser._id != asset.ownerId) &&
                  <img className="ui avatar image" src={makeCDNLink(`/api/user/${asset.ownerId}/avatar/60`, makeExpireTimestamp(60))}></img>
                }
                {ownerName ? ownerName : `#${asset.ownerId}`}
              </div>
            </QLink>
          </div>
        }
        
        { viewOpts.showFooter && 
          <div className="ui three small bottom attached icon buttons">
            <a to={assetLicenses[actualLicense].url} target='_blank'
                className='ui compact button'
                style={veryCompactButtonStyle}
                title={ assetLicenses[actualLicense].name }
                >
              <i className='ui law icon'/>
              <small>&nbsp;{actualLicense}</small>
            </a>
            <div className={(canEdit ? "" : "disabled ") + "ui " + (asset.isCompleted ? 'blue' : 'grey') + " compact button"} 
                  style={veryCompactButtonStyle}
                  onClick={this.handleCompletedClick} >
              <i className={ asset.isCompleted ? "ui lock icon" : "ui unlock icon"}></i>
              <small>&nbsp;{asset.isCompleted ? 'Complete' : 'Incomplete'}</small>
            </div>
            <div className={(canEdit? "" : "disabled ") + "ui red compact button"}
                  style={veryCompactButtonStyle}
                  onClick={this.handleDeleteClick}>
              {asset.isDeleted ? null : <i className="ui trash icon"></i>}
              <small>&nbsp;{asset.isDeleted ? "Undelete" : "Delete" }</small>
            </div>
          </div>
        }
      </div>
    )
  },

  handleChangeChosenProjectNames(newChosenProjectNamesArray)
  {
    newChosenProjectNamesArray.sort()
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {projectNames: newChosenProjectNamesArray}, (err, res) => {
      if (err)
        showToast(err.reason, 'error')
    })
      
    let projectsString = newChosenProjectNamesArray.join(", ")
    logActivity("asset.project",  `now in projects ${projectsString}`, null, this.props.asset);
  },

  handleDeleteClick() {
    let newIsDeletedState = !this.props.asset.isDeleted;
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isDeleted: newIsDeletedState}, (err, res) => {
      if (err)
        showToast(err.reason, 'error')
    })
    
    if (newIsDeletedState)
      logActivity("asset.delete",  "Delete asset", null, this.props.asset);
    else
      logActivity("asset.undelete",  "Undelete asset", null, this.props.asset); 
  },

  handleCompletedClick() {
    let newIsCompletedStatus = !this.props.asset.isCompleted
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isCompleted: newIsCompletedStatus}, (err, res) => {
      if (err)
        showToast(err.reason, 'error')
    })
    
    if (newIsCompletedStatus)
      logActivity("asset.stable",  "Mark asset as stable", null, this.props.asset);
    else
      logActivity("asset.unstable",  "Mark asset as unstable", null, this.props.asset); 
  },

  handleEditClick(e) {
    const asset = this.props.asset
    const url = "/u/" + asset.dn_ownerName + "/asset/" + asset._id
    // middle click - mouseUp reports buttons == 0; button == 1
    if(e.buttons == 4 || e.button == 1)
      window.open(url + (window.location.search ? window.location.search : ''))
    else
      utilPushTo(this.context.urlLocation.query, url)
  }
})