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

const pathDelimiter = '.'
function flatten(source, flattened = {}, keySoFar = '') {
  function getNextKey(key) {
    return `${keySoFar}${keySoFar ? pathDelimiter : ''}${key}`
  }
  if (typeof source === 'object' ) {
    for (const key in source) {
      flatten(source[key], flattened, getNextKey(key))
    }
  } else {
    flattened[keySoFar] = source
  }
  return flattened
}

function diff(a, b){
  const fa = flatten(a)
  const fb = flatten(b)
  const ret = {}
  for(let ai in fa){
    if(fa[ai] != fb[ai]){
      ret[ai] = [fa[ai], fb[ai]]
    }
  }
  return ret
}


export default AssetEdit = React.createClass({
  propTypes: {
    asset:                PropTypes.object,
    canEdit:              PropTypes.bool.isRequired,
    currUser:             PropTypes.object,
    handleContentChange:  PropTypes.func,
    editDeniedReminder:   PropTypes.func,
    // activitySnapshots:    PropTypes.array,           // can be null whilst loading
    getActivitySnapshots:    PropTypes.func,            // Activity snapshots causes very heavy re-rendering
    hasUnsentSaves:       PropTypes.bool,               // True if saves are unsent. However, if sent, then return can be pending - see asset.isUnconfirmedSave
    handleSaveNowRequest: PropTypes.func                // Asset editor can do this to request a flush now. For example to play a game in the editor
  },

  // sometimes in the AssetEditRoute getMeteorData is calling forceUpdate without any real reason - there were activity snapshots
  /*shouldComponentUpdate: function(nextProps, nextState){
    return true
    const pd = diff(this.props, nextProps)
    if(Object.keys(pd).length > 0){
      console.log("props", pd)
      return true
    }
    return false
  },*/
  getEditorForAsset: function(asset) {
    const Element = editElementsForKind[asset.kind] || EditUnknown
    return <Element {...this.props}/>   
  },

  render: function() {
    const asset = this.props.asset
    return asset ? this.getEditorForAsset(asset) : <div>loading...</div>
  }
})
