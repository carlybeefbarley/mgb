import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import QLink, { utilPushTo } from "/client/imports/routes/QLink";
import {AssetKinds} from '/imports/schemas/assets';
import moment from 'moment';
import {logActivity} from '/imports/schemas/activity';
import ProjectMembershipEditor from './ProjectMembershipEditor';
import AssetUrlGenerator from './AssetUrlGenerator.js';


// TODO: Toast/error is a mess

// TODO: I think showHeader===false is no longer required, so clean this up by getting rid of all that mess

export default AssetCard = React.createClass({
  
  propTypes: {
    showHeader: PropTypes.bool,                 // If false, just have a very MINI asset card (used by AssetEditRoute only at present)
    asset: PropTypes.object,
    ownersProjects: PropTypes.array,            // Project array for Asset Owner. Can be null. Can include ones they are a member of, so watch out!
    currUser: PropTypes.object,                 // currently Logged In user (not always provided)
    canEdit: PropTypes.bool,                    // Whether changes (like stable, delete etc) are allowed. Can be false
    showEditButton: PropTypes.bool,             // Shall we *show* the Edit button
    renderType: PropTypes.string,               // One of null/undefined  OR  "short"
    allowDrag: PropTypes.bool.isRequired        // True if drag is allowed
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

    // IE supports only text.. so - encode everything in the "text"
    e.dataTransfer.setData("text", JSON.stringify({
      link: url,
      asset: asset
    }));

    // IE needs this!!!
    e.dataTransfer.effectAllowed = "copy";

    $(document.body).addClass("dragging");
  },

  endDrag(asset, e){
    $(document.body).removeClass("dragging");
  },

  render() {
    if (!this.props.asset)
      return null;
      
    const { renderType, asset, showEditButton, canEdit, showHeader, allowDrag, ownersProjects } = this.props;
    const assetKindIcon = AssetKinds.getIconClass(asset.kind);
    const assetKindDescription = AssetKinds.getDescription(asset.kind)
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
        ownersProjects ? 
          _.map(_.filter(ownersProjects, {"ownerId": asset.ownerId}), 'name')
        : []
    const editProjects = <ProjectMembershipEditor 
                            canEdit={canEdit}
                            availableProjectNamesArray={availableProjectNamesArray}
                            chosenProjectNames={chosenProjectNamesArray}
                            handleChangeChosenProjectNames={this.handleChangeChosenProjectNames}
                            />
                          

    // TODO: Find how to add style={overflow: "hidden"} back to the div style of 'ui card' without hitting the off-window-images-dont-get-rendered problem that seems unique to Chrome
    return (
      <div key={asset._id} className="ui card" style={ { minWidth: "200px"} }>
      
          { showHeader &&
            <div className="ui centered image" onClick={this.handleEditClick}>
              <canvas 
                className="mgb-pixelated"
                ref="thumbnailCanvas" 
                width={iw} 
                height={ih} 
                style={{backgroundColor: '#ffffff', minHeight:"150px", maxHeight:"150px", maxWidth:"290px", width:"auto"}}
                draggable={allowDrag ? "true" : "false"}
                onDragStart={this.startDrag.bind(this, asset)}
                onDragEnd={this.endDrag.bind(this, asset)}
                >
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
            <div className="header" style={{ "color": asset.name ? 'black' : '#888'}}  onClick={this.handleEditClick} title="Asset Name">
              <small>{asset.name || "(untitled)"}</small>
            </div>
          }
          { (showHeader && asset.text && asset.text !== "") && 
            <div className="meta" style={{ "color": 'black'}}  onClick={this.handleEditClick} title="Asset Description">
              <small>{asset.text}</small>
            </div>
          }
        
          { asset.isDeleted &&            
            <div className="ui massive red corner label"><span style={{fontSize: "10px", paddingLeft: "10px"}}>DELETED</span></div>
          }

          { showHeader && info2 && !renderShort &&
            <div className="meta">
              <small>{info2}</small>
            </div>
          }

          { !renderShort && 
            <div className="meta">
              <small>          
                { editProjects }
                { !showHeader ? null : "Updated " + ago }
              </small>
            </div>
          }
        </div>     
        { /* End Content */}
        
        { showHeader && 
          <div className="extra content">
            <span className="left floated icon label" title={assetKindDescription}>
              <i className={"large " + assetKindIcon}></i>
              { assetKindName }
            </span>                           
            <QLink to={`/u/${asset.dn_ownerName}`} title="Asset Owner. Click to go to their profile page.">
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
                  to={`/u/${asset.dn_ownerName}/asset/${asset._id}`} 
                  className={(showEditButton ? "" : "disabled ") + "ui green compact button"} 
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
    utilPushTo(this.context.urlLocation.query, "/u/" + asset.dn_ownerName + "/asset/" + asset._id)
  }
  
})
