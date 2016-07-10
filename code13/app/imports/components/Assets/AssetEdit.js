import React, { PropTypes } from 'react';

import EditGraphic from './EditGraphic/EditGraphic.js';
import EditCode from './EditCode/EditCode.js';
import EditMap from './EditMap/EditMap.js';
import EditDoc from './EditDoc/EditDoc.js';
import EditMGBUI from './EditMGBUI/EditMGBUI.js';
import EditUnknown from './EditUnknown.js';


const editElementsForKind = {
  'graphic': EditGraphic,
  'code':    EditCode,
  'map':     EditMap,
  'doc':     EditDoc,
  '_mgbui':  EditMGBUI
}

export default AssetEdit = React.createClass({
  propTypes: {
    asset: PropTypes.object,
    canEdit: PropTypes.bool.isRequired,
    currUser: PropTypes.object,
    handleContentChange: PropTypes.function,
    editDeniedReminder: PropTypes.function,
    activitySnapshots: PropTypes.array               // can be null whilst loading
  },  

  getEditorForAsset: function(asset) {
    const Element = editElementsForKind[asset.kind] || EditUnknown
    return <Element {...this.props}/>   
  },

  render: function() {
    const asset = this.props.asset
    return asset ? this.getEditorForAsset(asset) : <div>loading...</div>
  }
})