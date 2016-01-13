import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reactMixin from 'react-mixin';
import Router, {History} from 'react-router';
import Icon from '../Icons/Icon.js';
import {AssetKinds} from '../../schemas/assets';


@reactMixin.decorate(History)
export default class AssetCard extends React.Component {
  static PropTypes = {
    asset: PropTypes.object,
    showEditButton: PropTypes.boolean
  }

  static defaultProps = {
    showEditButton: true,
  };

  constructor(props) {
    super(props);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handlePrivateClick = this.handlePrivateClick.bind(this);
  }

  componentDidMount()
  {
    let asset = this.props.asset;

    this.previewCanvas =  ReactDOM.findDOMNode(this.refs.thumbnailCanvas);
    this.previewCtx = this.previewCanvas.getContext('2d');
    this.previewCtx.fillStyle = '#a0c0c0';
    this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

    if (asset.kind === "graphic" && asset.hasOwnProperty("content"))
      this.loadPreviewFromDataURI(asset.content)
  }


  componentDidUpdate(prevProps,  prevState)
  {
    let asset = this.props.asset;

    if (asset.kind === "graphic" && asset.hasOwnProperty('content'))
      this.loadPreviewFromDataURI(asset.content)
  }

  loadPreviewFromDataURI(dataURI)
  {
    if (dataURI.startsWith("data:image/png;base64,"))
    {
      var _img = new Image;
      var _ctx = this.previewCtx;
      var self = this;
      _img.src = dataURI;   // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
      _img.onload = function() {
        _ctx.drawImage(_img,0,0); // needs to be done in onload...
      }
    }
    else {
      console.log("Unrecognized graphic data URI")
    }
  }

  render() {
    if (!this.props.asset)
      return null;

    const {asset, showEditButton  } = this.props;
    const assetKindIcon = AssetKinds.getIconClass(asset.kind);
    const assetKindLongName = AssetKinds.getLongName(asset.kind)

    return (
      <div key={asset._id} className="ui card">
        <div className="content">
          <canvas ref="thumbnailCanvas" className="right floated mini ui image"
               src="/images/avatar/large/elliot.jpg" width="64" height="32" >
          </canvas>
          <div className="header">
            <i className={assetKindIcon}></i>
            {asset.name}
          </div>
          <div className="meta">
            {assetKindLongName}
          </div>
          <div className="description">
            Lorem ipsum foo bar lah-di-dah
          </div>
        </div>
        <div className="extra content">
          <div className="ui three buttons">
            <div className={ (showEditButton ? "" : " disabled") + "ui basic green compact button"} onClick={this.handleEditClick}>
                <i className=" edit icon"></i>
            </div>
            <div className="ui basic blue compact button" onClick={this.handlePrivateClick} >
              {asset.isPrivate ?
                <Icon size="1.2em" icon="lock" color='#000' /> :
                <Icon size="1.2em" icon="lock" color='#ddd' />
              }
            </div>
            <div className="ui basic red compact button" onClick={this.handleDeleteClick}>
              {asset.isDeleted ?
                <Icon size="1.2em" icon="delete" color='red'  /> :
                <Icon size="1.2em" icon="delete" color='#ddd' />
              }
            </div>
          </div>
        </div>
      </div>);

  }

  handleDeleteClick() {
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isDeleted: !this.props.asset.isDeleted}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }
    });
  }

  handlePrivateClick() {
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isPrivate: !this.props.asset.isPrivate}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }
    });
  }

  handleEditClick() {
    this.history.pushState(null, `/assetEdit/${this.props.asset._id}`)
  }
}
