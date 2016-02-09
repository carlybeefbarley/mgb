import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';

import 'brace/mode/javascript';
import 'brace/theme/github';

import moment from 'moment';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../Icons/Icon.js';
import EditGraphic from './EditGraphic/EditGraphic.js';
import EditUnknown from './EditUnknown.js';
import AssetCard from './AssetCard.js';

@reactMixin.decorate(History)
export default class AssetEdit extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }

  constructor(props) {
    super(props);
  }
  
  handleOnChange() {}

  getEditorForAsset(asset)
  {
    switch (asset.kind) {
      case 'graphic':
        return (<EditGraphic asset={asset} handleContentChange={this.handleContentChange.bind(this)}/>);
      case 'code':
        return (<AceEditor
          mode="javascript"
          theme="github"
          onChange={this. handleOnChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{$blockScrolling: true}}
        />);
      default:
        return (<EditUnknown asset={asset}/>);
    }
  }

  handleContentChange(content2Object, thumbnail)
  {
    let asset = this.props.asset;
    let canEdit = true; // TODO: Something based on this.props.ownsProfile ??

    Meteor.call('Azzets.update', asset._id, canEdit, {content2: content2Object, thumbnail: thumbnail}, (err, res) => {
      if (err) {
        alert('error: ' + err.reason)
      }
    });
  }

  render() {
    if (!this.props.asset) return null;

    let asset = this.props.asset;

    return (
      this.getEditorForAsset(asset)
    );
  }

}
