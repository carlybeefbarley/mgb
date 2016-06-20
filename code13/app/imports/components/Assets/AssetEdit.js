import React, { PropTypes } from 'react';

import EditGraphic from './EditGraphic/EditGraphic.js';
import EditCode from './EditCode/EditCode.js';
import EditMap from './EditMap/EditMap.js';
import EditMGBUI from './EditMGBUI/EditMGBUI.js';
import EditUnknown from './EditUnknown.js';


const editElementsForKind = {
  'graphic': EditGraphic,
  'code':    EditCode,
  'map':     EditMap,
  '_mgbui':  EditMGBUI
}


export default class AssetEdit extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object.isRequired
  //   canEdit" PropTypes.bool.isRequired
  //   currUser: PropTypes.object,
  //   handleContentChange: PropTypes.function
  //   editDeniedReminder: PropTypes.function
  //   activitySnapshots: PropTypes.array               // can be null whilst loading
  // }
  

  getEditorForAsset(asset) {
    const Element = editElementsForKind[asset.kind] || EditUnknown    
    return <Element
              asset={asset}
              canEdit={this.props.canEdit}
              currUser={this.props.currUser}
              editDeniedReminder={this.props.editDeniedReminder}
              handleContentChange={this.props.handleContentChange}
              activitySnapshots={this.props.activitySnapshots}
              />   
  }


  render() {
    const asset = this.props.asset;
    return asset ? this.getEditorForAsset(asset) : <div>loading...</div>
  }
}