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

const AssetEdit = ( props ) => {
  const Element = editElementsForKind[props.asset.kind] || EditUnknown
  return <Element {...props}/>
}

AssetEdit.propTypes = {
  asset:                    PropTypes.object.isRequired,    // The invoker of this component must ensure that there is a valid Asset object
  canEdit:                  PropTypes.bool.isRequired,      // The invoker provides
  currUser:                 PropTypes.object,               // Can be null/undefined. This is the currently Logged-in user (or null if not logged in)
  handleContentChange:      PropTypes.func.isRequired,      // Asset Editors call this to deferred-save content2 & thumbnail changes: deferContentChange(content2Object, thumbnail, changeText="content change")
  handleMetadataChange:     PropTypes.func.isRequired,      // Asset Editors call this to perform IMMEDIATE save of newMetadata
  handleDescriptionChange:  PropTypes.func.isRequired,      // Asset Editors call this to perform IMMEDIATE save of description change
  editDeniedReminder:       PropTypes.func.isRequired,      // Asset Editors call this to give User a UI warning that they do not have write access to the current asset
  getActivitySnapshots:     PropTypes.func.isRequired,      // Activity snapshots causes very heavy re-rendering
  hasUnsentSaves:           PropTypes.bool.isRequired,      // True if there are deferred saves yet to be sent. HOWEVER, even if sent, then server accept + server ack/nack can be pending - see asset.isUnconfirmedSave for the flag to indicate that 'changes are in flight' status
  handleSaveNowRequest:     PropTypes.func.isRequired       // Asset Editor call this to request a flush now (but it does not wait or have a callback). An example of use for this: Flushing an ActorMap asset to play a game in the actorMap editor
}

export default AssetEdit
