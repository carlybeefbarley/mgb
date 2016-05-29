import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {Link, browserHistory} from 'react-router';
import {AssetKinds} from '../../schemas/assets';
import moment from 'moment';
import {logActivity} from '../../schemas/activity';
import ProjectMembershipEditor from './ProjectMembershipEditor';
import AssetUrlGenerator from './AssetUrlGenerator.js';


//TODO: Toast/error

export default AssetCard = React.createClass({
  
  propTypes: {
    showHeader: PropTypes.bool,                 // If false, just have a very MINI asset card
    asset: PropTypes.object,
    ownersProjects: PropTypes.array,            // Project array for Asset Owner. Can include ones they are a member of, so watch out!
    currUser: PropTypes.object,                 // currently Logged In user (not always provided)
    canEdit: PropTypes.bool,                    // Whether changes (like stable, delete etc) are allowed. Can be false
    showEditButton: PropTypes.bool              // Shall we *show* the Edit button
  },

  getDefaultProps: function()  {
    return {
      canEdit: false,
      showEditButton: true,
      showHeader: true
    };  
  },

  loadThumbnail(asset)
  {
    if (this.props.showHeader && asset.hasOwnProperty("thumbnail"))
      this.loadPreviewFromDataURI(asset.thumbnail)
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

  componentDidUpdate(prevProps,  prevState)
  {
    this.loadThumbnail(this.props.asset)
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
      _img.onload = function() {
        _ctx.clearRect(0 , 0, _img.width, _img.height)
        _ctx.drawImage(_img,0,0); // needs to be done in onload...
      }
    }
    else {
      console.log("Unrecognized graphic data URI")
    }
  },

  render() {
    if (!this.props.asset)
      return null;
      
    const {asset, showEditButton, currUser, canEdit } = this.props;
    const assetKindIcon = AssetKinds.getIconClass(asset.kind);
    const assetKindLongName = AssetKinds.getLongName(asset.kind)
    const c2 = asset.content2 || { width:64, height:64, nframes:0 }
    const iw = c2.hasOwnProperty("width") ? c2.width : 64
    const ih = c2.hasOwnProperty("height") ? c2.height : 64
    const nframes = c2.hasOwnProperty("frameNames") ? c2.frameNames.length : 2
    const dimension = asset.kind === "graphic" ? `${iw}x${ih} ` : ''
    const info2 = asset.kind === "graphic" ? `${nframes} frames` : ''
    const ago = moment(asset.updatedAt).fromNow()                                 // TODO: Make reactive
    const ownerName = asset.dn_ownerName
    
    
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
                          

    return (
      <div key={asset._id} className="ui fluid card">
        <div className="content">
          
          { /* CONTENT */ }
          { !this.props.showHeader ?
            ( canEdit ? <a className="ui right floated mini green label">editable</a> : <a className="ui mgbReadOnlyReminder right floated mini red label">read-only</a> )
            : 
            <div className="ui right floated image">
              <div className="ui move left reveal">
                <div className="visible content">
                      <canvas ref="thumbnailCanvas" className="ui image" width={iw} height={ih} style={{backgroundColor: '#ffffff'}} >
                      </canvas> 
                </div>
                <div className="hidden content meta">
                  <small>
                    <p>{assetKindLongName}</p>
                    <p>{dimension}</p>
                    <p>{info2}</p>
                  </small>
                </div>
              </div>
            </div>
          }
          
          { !this.props.showHeader ? null : 
          <div className="header" style={{ "color": asset.name ? 'black' : '#888'}}>
            <i style={{"color": "black"}} className={assetKindIcon}></i>
            <small>{asset.name || "(untitled)"}</small>
          </div>
          }
        
          <div className="meta">
            <small>
              {asset.isDeleted ? <p style={{color: "red"}}>[DELETED]<br></br></p> : null }              
              Owner:&nbsp; 
              <Link to={`/user/${asset.ownerId}`}>
                {ownerName ? ownerName : `#${asset.ownerId}`}
              </Link>
            </small>
          </div>
          <div className="meta">
            <small>          
              {editProjects}
              { !this.props.showHeader ? null : "Updated " + ago }
            </small>
          </div>
        </div>     
        { /* End Content */}
        

        { !this.props.showHeader ? null : 
        <div className="extra content">
          <div className="ui four small buttons">
            <div className={(this.props.showEditButton ? "" : "disabled ") + "ui basic green compact button"} 
                 onClick={this.handleEditClick}>
              <i className="ui edit icon"></i>
              <small>Edit</small>
            </div>
            <div className={(canEdit ? "" : "disabled ") + "ui basic blue compact button"} 
                 onClick={this.handleCompletedClick} >
              <i className={ asset.isCompleted ? "ui toggle on icon" : "ui toggle off icon"}></i>
              <small>Stable</small>
            </div>
            <div className={(this.props.showEditButton ? "" : "disabled ") + "ui basic red compact button"}
                 onClick={this.handleDeleteClick}>
              <i className={!asset.isDeleted ? "ui red trash icon" : "ui grey trash outline icon"}></i>
              <small>{asset.isDeleted ? "Undelete" : "Delete" }</small>
            </div>
            <div className="ui basic black compact button" >
            <AssetUrlGenerator asset={asset} /><small>URL</small>
            </div>
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
    browserHistory.push(`/assetEdit/${this.props.asset._id}`)
  }
  
})