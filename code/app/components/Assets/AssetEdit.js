import React, { PropTypes } from 'react';
import moment from 'moment';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../Icons/Icon.js';
import styles from './assetCard.css';
import EditImage from './EditImage/EditImage.js';

@reactMixin.decorate(History)
export default class AssetEdit extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handlePrivateClick = this.handlePrivateClick.bind(this);
  }

  render() {
    if (!this.props.asset) return null;

    let asset = this.props.asset;

    return (
      <div key={asset._id} className={styles.border} >
        <div className={styles.text}>ASSET-EDIT {asset.name} / {asset.kind} / {asset.text}</div>
        <div className={styles.right}>
          <div className={styles.item}>
            {asset.isCompleted ?
              <Icon size="1.2em" icon="check" color='green' onClick={this.handleClick} /> :
              <Icon size="1.2em" icon="check" color='#ddd' onClick={this.handleClick} />
            }
          </div>
          <div className={styles.item}>
            {asset.isPrivate ?
              <Icon size="1.2em" icon="lock" color='#000' onClick={this.handlePrivateClick} /> :
              <Icon size="1.2em" icon="lock" color='#ddd' onClick={this.handlePrivateClick} />
            }
          </div>
          <div className={styles.item}>
            {asset.isDeleted ?
              <Icon size="1.2em" icon="delete" color='red' onClick={this.handleDeleteClick} /> :
              <Icon size="1.2em" icon="delete" color='#ddd' onClick={this.handleDeleteClick} />
            }
          </div>
        </div>
        <div >
        <EditImage/>
        </div>
      </div>
    );
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

  handleClick() {
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isCompleted: !this.props.asset.isCompleted}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }
    });
  }
}
