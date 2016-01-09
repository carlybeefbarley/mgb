import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import Router, {History} from 'react-router';
import Icon from '../Icons/Icon.js';
import styles from './assetCard.css';
import {AssetKinds} from '../../schemas/assets';


@reactMixin.decorate(History)
export default class AssetCard extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handlePrivateClick = this.handlePrivateClick.bind(this);
  }

  render() {
    if (!this.props.asset) return null;

    const asset = this.props.asset;
    const assetKindIcon = AssetKinds.getIconClass(asset.kind);

    return (
      <div key={asset._id} className={styles.border} >
<<<<<<< HEAD
        <h4><i className={AssetKinds[asset.kind].icon + " icon"}></i></h4>
        <div className={styles.text}><b>{asset.name}</b> - {asset.text}</div>
=======
        <i className={assetKindIcon}></i>
        <div className={styles.text}>{asset._id}: {asset.name} / {asset.kind} / {asset.text}</div>
>>>>>>> 8fdc442b8b9b8138150c5902b9737cc8bae7a5f1
        <div className={styles.right}>
          <div className={styles.item}>
            <i className="edit icon" onClick={this.handleClick}></i>
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
    this.history.pushState(null, `/assetEdit/${this.props.asset._id}`)
  }
}
