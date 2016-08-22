import React, { PropTypes } from 'react'
import EditGraphic from './EditGraphic/EditGraphic'
import EditCode from './EditCode/EditCode'
import EditMap from './EditMap/EditMap'
import EditDoc from './EditDoc/EditDoc'
import EditSound from './EditAudio/EditSound/EditSound'
import EditMusic from './EditAudio/EditMusic/EditMusic'
import EditMGBUI from './EditMGBUI/EditMGBUI'
import EditUnknown from './EditUnknown'


const editElementsForKind = {
  'graphic': EditGraphic,
  'code':    EditCode,
  'map':     EditMap,
  'doc':     EditDoc,
  'sound':   EditSound,
  'music':   EditMusic,
  '_mgbui':  EditMGBUI
}

export default AssetEdit = React.createClass({
  propTypes: {
    asset: PropTypes.object,
    canEdit: PropTypes.bool.isRequired,
    currUser: PropTypes.object,
    handleContentChange: PropTypes.func,
    editDeniedReminder: PropTypes.func,
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