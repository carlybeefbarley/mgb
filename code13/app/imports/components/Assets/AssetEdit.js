import React, { PropTypes } from 'react';

import EditGraphic from './EditGraphic/EditGraphic.js';
import EditCode from './EditCode/EditCode.js';
import EditMap from './EditMap/EditMap.js';
import EditUnknown from './EditUnknown.js';

import {logActivity} from '../../schemas/activity';

const editElementsForKind = {
  'graphic': EditGraphic,
  'code':    EditCode,
  'map':     EditMap
}

export default class AssetEdit extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object.isRequired
  //   canEdit" PropTypes.bool.isRequired
  //   currUser: PropTypes.object,
  //   editDeniedReminder: PropTypes.function
  //   activitySnapshots: PropTypes.array               // can be null whilst loading
  // }

  constructor(props) {
    super(props);
  }
  

  getEditorForAsset(asset) {
    const Element = editElementsForKind[asset.kind] || EditUnknown    
    return <Element
              asset={asset}
              canEdit={this.props.canEdit}
              currUser={this.props.currUser}
              editDeniedReminder={this.props.editDeniedReminder}
              handleContentChange={this.handleContentChange.bind(this) }
              activitySnapshots={this.props.activitySnapshots}
              />   
  }


  handleContentChange(content2Object, thumbnail, changeText="content change")
  {
    const asset = this.props.asset;
    Meteor.call('Azzets.update', asset._id, this.props.canEdit, {content2: content2Object, thumbnail: thumbnail}, (err, res) => {
      if (err) {
        // TODO: NOT alert() ! !
        alert('error: ' + err.reason)
      }
    });
    
    logActivity("asset.edit", changeText, null, asset);
  }

  render() {
    const asset = this.props.asset;
    return asset ? this.getEditorForAsset(asset) : <div>loading...</div>
  }

}
