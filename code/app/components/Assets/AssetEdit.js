import React, { PropTypes } from 'react';
import moment from 'moment';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../Icons/Icon.js';
import EditGraphic from './EditImage/EditGraphic.js';
import EditUnknown from './EditImage/EditUnknown.js';
import AssetCard from './AssetCard.js';


@reactMixin.decorate(History)
export default class AssetEdit extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }

  constructor(props) {
    super(props);
  }

  getEditorForAsset(asset)
  {
    switch (asset.kind) {
      case 'graphic':
        return (<EditGraphic asset={asset} handleContentChange={this.handleContentChange.bind(this)}/>);
      default:
        return (<EditUnknown asset={asset}/>);
    }
  }

  handleContentChange(contentString)
  {
    alert("yay");
    let asset = this.props.asset;

    let canEdit = true; // TODO: Something based on this.props.ownsProfile ??

    debugger

    Meteor.call('Azzets.update', asset._id, canEdit, {text: contentString}, (err, res) => {
      if (err) {
        alert('error: ' + err.reason)
      }
    });
  }

  render() {
    if (!this.props.asset) return null;

    let asset = this.props.asset;

    return (
      <div key={asset._id} className="ui segment">
        <AssetCard asset={asset} showEditButton={false} />
        {this.getEditorForAsset(asset)}
      </div>
    );
  }


}
