import React, { PropTypes } from 'react';

import EditGraphic from './EditGraphic/EditGraphic.js';
import EditCode from './EditCode/EditCode.js';
import EditMap from './EditMap/EditMap.js';
import EditUnknown from './EditUnknown.js';

import {logActivity} from '../../schemas/activity';


export default class AssetEdit extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object
  // }

  constructor(props) {
    super(props);
  }
  

  getEditorForAsset(asset)
  {
    switch (asset.kind) {
      case 'graphic':
        return (<EditGraphic asset={asset} handleContentChange={this.handleContentChange.bind(this)}/>);
      case 'code':
        return (<EditCode asset={asset} handleContentChange={this.handleContentChange.bind(this)}/>);
      case 'map':
        return (<EditMap asset={asset} handleContentChange={this.handleContentChange.bind(this)}/>);
      default:
        return (<EditUnknown asset={asset}/>);
    }
  }

  handleContentChange(content2Object, thumbnail, changeText="content change")
  {
    let asset = this.props.asset;
    let canEdit = true; // TODO: Something based on this.props.ownsProfile ??

    Meteor.call('Azzets.update', asset._id, canEdit, {content2: content2Object, thumbnail: thumbnail}, (err, res) => {
      if (err) {
        alert('error: ' + err.reason)
      }
    });
    
    logActivity("asset.edit", changeText, null, this.props.asset);
  }

  render() {
    if (!this.props.asset) 
      return <div>loading...</div>;

    let asset = this.props.asset;

    return this.getEditorForAsset(asset)
  }

}
