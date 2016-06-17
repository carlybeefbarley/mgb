import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import QLink, { utilPushTo } from "../../routes/QLink";
import {AssetKinds} from '../../schemas/assets';
import moment from 'moment';
import {logActivity} from '../../schemas/activity';
import ProjectMembershipEditor from './ProjectMembershipEditor';
import AssetUrlGenerator from './AssetUrlGenerator.js';


//TODO: Toast/error

export default AssetCard = React.createClass({
  
  propTypes: {
    showHeader: PropTypes.bool,                 // If false, just have a very MINI asset card (used by AssetEditRoute only at present)
    asset: PropTypes.object,
    ownersProjects: PropTypes.array,            // Project array for Asset Owner. Can be null. Can include ones they are a member of, so watch out!
    currUser: PropTypes.object,                 // currently Logged In user (not always provided)
    canEdit: PropTypes.bool,                    // Whether changes (like stable, delete etc) are allowed. Can be false
    showEditButton: PropTypes.bool,             // Shall we *show* the Edit button
    renderType: PropTypes.string                // One of null/undefined  OR  "short"
  },


  contextTypes: {
    urlLocation: React.PropTypes.object
  },


  getDefaultProps: function()  {
    return {
      canEdit: false,
      showEditButton: true,
      showHeader: true
    };  
  },
  
  getInitialState: function () {
    return {
      discoveredImageWidth: undefined,     // If we don't have the full asset with .content2 then we only know the width after we've loaded the thumbnail
      discoveredImageHeight: undefined    // If we don't have the full asset with .content2 then we only know the width after we've loaded the thumbnail      
    }
  },


  componentDidMount()
  {
    if (this.props.showHeader)
    {
      this.previewCanvas =  ReactDOM.findDOMNode(this.refs.thumbnailCanvas);
      this.previewCtx = this.previewCanvas.getContext('2d');
      this.loadThumbnail(this.props.asset)
    }
  },

  componentDidUpdate(prevProps, prevState)
  {
    this.loadThumbnail(this.props.asset)
  },
  
  loadThumbnail(asset)
  {
    if (this.props.showHeader && asset.hasOwnProperty("thumbnail"))
      this.loadPreviewFromDataURI(asset.thumbnail)
  },
  
  loadPreviewFromDataURI(dataURI)
  {
    if (dataURI === undefined || dataURI.length == 0)
      return;
    if (dataURI.startsWith("data:image/png;base64,"))
    {
      var _img = new Image;
      var _ctx = this.previewCtx;
      _img.src = dataURI;   // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
      _img.onload = () => {
        if (this.previewCanvas.width !== _img.width || this.previewCanvas.height !== _img.height)
        {          
          this.previewCanvas.width = _img.width
          this.previewCanvas.height = _img.height
          this.setState( { discoveredImageWidth: _img.width, discoveredImageHeight: _img.height} )
        }
        _ctx.clearRect(0 , 0, _img.width, _img.height)
        _ctx.drawImage(_img,0,0); // needs to be done in onload...
        // TODO - there may be an event leak of _img. to see this, comment out the width check guards on setState()
      }
    }
    else {
      console.log("Unrecognized graphic data URI")
    }
  },

  // probably we could set global map<asset._id> Asset and escape stringifying;
  startDrag(asset, e){
    const url  = `/api/asset/png/${asset._id}`;
    console.log("Start dragging Asset  url=", url);

    e.dataTransfer.setData("link", url);
    e.dataTransfer.setData("asset", JSON.stringify(asset));

    $(document.body).addClass("dragging");
  },

  endDrag(asset, e){
    $(document.body).removeClass("dragging");
  },

  render() {
    if (!this.props.asset)
      return null;
      
    const {renderType, asset, showEditButton, currUser, canEdit, showHeader } = this.props;
    const assetKindIcon = AssetKinds.getIconClass(asset.kind);
    const assetKindLongName = AssetKinds.getLongName(asset.kind)
    const assetKindName = AssetKinds.getName(asset.kind)
    const c2 = asset.content2 || { width:64, height:64 }
    const renderShort = renderType === "short"

    const iw = c2.hasOwnProperty("width") ? c2.width : 64
    const ih = c2.hasOwnProperty("height") ? c2.height : 64
    const pw = this.state.discoveredImageWidth || iw 
    const ph = this.state.discoveredImageHeight || ih
    let info2 = " "
    switch (asset.kind)
    {
    case "graphic":
      info2 = `Size: ${pw} x ${ph} pixels`
    }
    const ago = moment(asset.updatedAt).fromNow()                      // TODO: Make reactive
    const ownerName = asset.dn_ownerName
    
    const contentStyle = showHeader ? {} : { padding: "8px"}

    // Project Membership editor
    
    const chosenProjectNamesArray = asset.projectNames || [];

    const availableProjectNamesArray = 
        this.props.ownersProjects ? 
          _.map(_.filter(this.props.ownersProjects, {"ownerId": asset.ownerId}), 'name')
        : []
    const editProjects = <ProjectMembershipEditor 
                            canEdit={this.props.canEdit}
                            availableProjectNamesArray={availableProjectNamesArray}
                            chosenProjectNames={chosenProjectNamesArray}
                            handleChangeChosenProjectNames={this.handleChangeChosenProjectNames}
                            />
                          


    // TODO: add allowDrag to props.. and walk through AssetCard use cases;
    return (
      <div key={asset._id} className="ui card" draggable="true"
           onDragStart={this.startDrag.bind(this, asset)}
           onDragEnd={this.endDrag.bind(this, asset)}
        >
      
          { showHeader &&
            <div className="ui centered image" onClick={this.handleEditClick}>
              <canvas 
                ref="thumbnailCanvas" 
                width={iw} 
                height={ih} 
                style={{backgroundColor: '#ffffff', minHeight:"150px", maxHeight:"150px", maxWidth:"290px", width:"auto"}} >
              </canvas> 
              </div>
          }
        <div className="content" style={contentStyle}>
          
          { /* CONTENT */ }
          {
             ( !showHeader && 
              (canEdit ? 
                <a className="ui right floated mini green label">editable</a> : 
                <a className="ui mgbReadOnlyReminder right floated mini red label">read-only</a> 
              )
            )
          }

          { showHeader && 
              <i className="right floated star icon"></i>
          }
          
          { showHeader && 
          <div className="header" style={{ "color": asset.name ? 'black' : '#888'}}  onClick={this.handleEditClick}>
            <small>{asset.name || "(untitled)"}</small>
          </div>
          }
        
          { asset.isDeleted &&            
            <div className="meta">
              <p className="ui small red label">DELETED</p>           
            </div>
          }

          { showHeader && info2 && !renderShort &&
            <div className="meta">
              <small>{info2}</small>
            </div>
          }

          { !renderShort && 
            <div className="meta">
              <small>          
                {editProjects}
                { !this.props.showHeader ? null : "Updated " + ago }
              </small>
            </div>
          }
        </div>     
        { /* End Content */}
        
        { showHeader && 
          <div className="extra content">
            <span className="left floated icon label">
              <i className={"large " + assetKindIcon}></i>
              { assetKindName }
            </span>                           
            <QLink to={`/user/${asset.ownerId}`}>
              <div className="right floated author">
                <img className="ui avatar image" src={`/api/user/${asset.ownerId}/avatar`}>
                </img> {ownerName ? ownerName : `#${asset.ownerId}`}
              </div>
            </QLink>
          </div>
        }
        
        { showHeader && !renderShort &&         
          <div className="ui four small bottom attached icon buttons">
            <QLink 
                  to={`/user/${asset.ownerId}/asset/${asset._id}`} 
                  className={(this.props.showEditButton ? "" : "disabled ") + "ui green compact button"} 
                  onClick={this.handleEditClick}>
              <i className="ui edit icon"></i>
              <small>&nbsp;Edit</small>
            </QLink>
            <div className={(canEdit ? "" : "disabled ") + "ui blue compact button"} 
                  onClick={this.handleCompletedClick} >
              <i className={ asset.isCompleted ? "ui checkmark icon" : "ui remove icon"}></i>
              <small>&nbsp;Done</small>
            </div>
            <div className={(canEdit? "" : "disabled ") + "ui red compact button"}
                  onClick={this.handleDeleteClick}>
              {asset.isDeleted ? null : <i className="ui trash icon"></i>}
              <small>&nbsp;{asset.isDeleted ? "Undelete" : "Delete" }</small>
            </div>            
            <div className="ui black compact button" >
              <AssetUrlGenerator asset={asset} /><small>&nbsp;URL</small>
            </div>
          </div>
        }
      </div>
      );
  },


  handleChangeChosenProjectNames(newChosenProjectNamesArray)
  {
    newChosenProjectNamesArray.sort()
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {projectNames: newChosenProjectNamesArray}, (err, res) => {
        if (err) {
          this.props.showToast(err.reason, 'error')
        }        
      });
      
    let projectsString = newChosenProjectNamesArray.join(", ")
    logActivity("asset.project",  `now in projects ${projectsString}`, null, this.props.asset);
  },


  handleDeleteClick() {
    let newIsDeletedState = !this.props.asset.isDeleted;
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isDeleted: newIsDeletedState}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }        
    });
    
    if (newIsDeletedState)
      logActivity("asset.delete",  "Delete asset", null, this.props.asset);
    else
      logActivity("asset.undelete",  "Undelete asset", null, this.props.asset); 
    
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

  handleEditClick() {
    const asset = this.props.asset
    utilPushTo(this.context.urlLocation.query, "/user/" + asset.ownerId + "/asset/" + asset._id)
  }
  
})
