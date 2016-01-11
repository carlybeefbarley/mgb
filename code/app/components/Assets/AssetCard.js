import React, { PropTypes } from 'react';
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

  render() {
    if (!this.props.asset)
      return null;

    const {asset, showEditButton  } = this.props;
    const assetKindIcon = AssetKinds.getIconClass(asset.kind);

    return (
      <div key={asset._id} className="ui card">
        <div className="content">
          <img className="right floated mini ui image"
               src="/images/avatar/large/elliot.jpg">
          </img>
          <div className="header">
            <i className={assetKindIcon}></i>
            {asset.name}
          </div>
          <div className="meta">
            {asset.text}
          </div>
          <div className="description">
            Elliot requested permission to view your contact details
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
