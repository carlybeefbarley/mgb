import React, { PropTypes } from 'react';
import moment from 'moment';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../Icons/Icon.js';
import styles from './assetCard.css';
import EditImage from './EditImage/EditImage.js';
import EditUnknown from './EditImage/EditUnknown.js';


@reactMixin.decorate(History)
export default class AssetEdit extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.handleEditAssetClick = this.handleEditAssetClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handlePrivateClick = this.handlePrivateClick.bind(this);
  }

  getEditorForAsset(asset)
  {
    switch (asset.kind) {
      case 'image':
        return (<EditImage asset={asset}/>);
      default:
        return (<EditUnknown asset={asset}/>);
    }
  }

  render() {
    if (!this.props.asset) return null;

    let asset = this.props.asset;

    return (
      <div key={asset._id} className="ui segment">
        <div className={styles.text}>{asset.text}</div>
        <div className={styles.right}>
          <div className={styles.item}>
            {asset.isCompleted ?
              <Icon size="1.2em" icon="check" color='green' onClick={this.handleEditAssetClick} /> :
              <Icon size="1.2em" icon="check" color='#ddd' onClick={this.handleEditAssetClick} />
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
          {this.getEditorForAsset(asset)}
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

  handleEditAssetClick() {
    Meteor.call('Azzets.update', this.props.asset._id, this.props.canEdit, {isCompleted: !this.props.asset.isCompleted}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }
    });
  }
}
