import React, { PropTypes } from 'react'

import EditActorMap from './EditActorMap/EditActorMap'
import EditActor from './EditActor/EditActor'
import EditMap from './EditMap/EditMap'
import EditDoc from './EditDoc/EditDoc'
import EditCode from './EditCode/EditCode'
import EditGame from './EditGame/EditGame'
import EditMusic from './EditAudio/EditMusic/EditMusic'
import EditSound from './EditAudio/EditSound/EditSound'
import EditGraphic from './EditGraphic/EditGraphic'
import EditUnknown from './EditUnknown'

const editElementsForKind = {
  'graphic':   EditGraphic,
  'tutorial':  EditCode,
  'code':      EditCode,
  'map':       EditMap,
  'actormap':  EditActorMap,
  'actor':     EditActor,
  'doc':       EditDoc,
  'sound':     EditSound,
  'music':     EditMusic,
  'game':      EditGame
}

export default AssetEdit = React.createClass({
  propTypes: {
    asset:                PropTypes.object,
    canEdit:              PropTypes.bool.isRequired,
    currUser:             PropTypes.object,
    handleContentChange:  PropTypes.func,
    editDeniedReminder:   PropTypes.func,
    activitySnapshots:    PropTypes.array,              // can be null whilst loading
    hasUnsentSaves:       PropTypes.bool,               // True if saves are unsent. However, if sent, then return can be pending - see asset.isUnconfirmedSave
    handleSaveNowRequest: PropTypes.func                // Asset editor can do this to request a flush now. For example to play a game in the editor
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
