import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reactMixin from 'react-mixin';
import {Link, History} from 'react-router';
import {AssetKinds} from '../../schemas/assets';
import moment from 'moment';
import {logActivity} from '../../schemas/activity';


export default AssetCard = React.createClass({
  mixins: [History],
  
  propTypes: {
    asset: PropTypes.object
  },

  getDefaultProps: function()  {
    return {
      showEditButton: true
    };  
  },

  loadThumbnail(asset)
  {
    if (asset.hasOwnProperty("thumbnail"))
      this.loadPreviewFromDataURI(asset.thumbnail)
  },

  componentDidMount()
  {
    this.previewCanvas =  ReactDOM.findDOMNode(this.refs.thumbnailCanvas);
    this.previewCtx = this.previewCanvas.getContext('2d');
    this.loadThumbnail(this.props.asset)
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

    const {asset, showEditButton  } = this.props;
    const assetKindIcon = AssetKinds.getIconClass(asset.kind);
    const assetKindLongName = AssetKinds.getLongName(asset.kind)
    const c2 = asset.content2 || { width:64, height:64, nframes:0 }
    const iw = c2.hasOwnProperty("width") ? c2.width : 64
    const ih = c2.hasOwnProperty("height") ? c2.height : 64
    const nframes = c2.hasOwnProperty("frameNames") ? c2.frameNames.length : 2
    const dimension = asset.kind === "graphic" ? `${iw}x${ih} ` : ''
    const ago = moment(asset.updatedAt).fromNow()
    const info2 = asset.kind === "graphic" ? `${nframes} frames` : ''

    const ownerName = asset.dn_ownerName

    return (
      <div key={asset._id} className="ui fluid card">
        <div className="content">
          
          { /* CONTENT */ }
          <div className="ui right floated image">
            <div className="ui move left reveal">
              <div className="visible content">
                    <canvas ref="thumbnailCanvas" className="ui image" width={iw} height={ih} style={{backgroundColor: '#ffffff'}} >
                    </canvas> 
              </div>
              <div className="hidden content meta">
                <small>
                  <p>{`${dimension}${assetKindLongName}`}</p>
                  <p>{info2}</p>
                </small>
              </div>
            </div>
          </div>
          
          
          <div className="header">
            <i className={assetKindIcon}></i>
            <small>{asset.name}</small>
          </div>
          
        
          <div className="meta">
            <small>
              {asset.isDeleted ? <p style={{color: "red"}}>[DELETED]</p> : null }
              <br></br>
              Owner: 
              <Link to={`/user/${asset.ownerId}`}>
                {ownerName ? ownerName : `#${asset.ownerId}`}
              </Link>
              <br></br>
              Updated{ago}
            </small>
          </div>
        </div>     { /* End Content */}
        { /* TODO: Add content section maybe editable. Also improve how meta looks above - less space between lines*/}
        <div className="extra content">
          <div className="ui three small buttons">
            <div className="ui basic green compact button" onClick={this.handleEditClick}>
              <i className="ui edit icon"></i>
              <small>Edit</small>
            </div>
            <div className="ui basic blue compact button" onClick={this.handleCompletedClick} >
              <i className={ asset.isCompleted ? "ui toggle on icon" : "ui toggle off icon"}></i>
              <small>Stable</small>
            </div>
            { !showEditButton ? null :
              <div className="ui basic red compact button" onClick={this.handleDeleteClick}>
                <i className={asset.isDeleted ? "ui red trash icon" : "ui grey trash outline icon"}></i>
                <small>{asset.isDeleted ? "Undelete" : "Delete" }</small>
              </div>
            }
          </div>
        </div>
      </div>
      );
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
    this.history.pushState(null, `/assetEdit/${this.props.asset._id}`)
  }
  
})