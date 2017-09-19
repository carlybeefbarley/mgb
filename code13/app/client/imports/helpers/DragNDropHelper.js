'use strict'
import dragAndDropSimulator from './dragAndDropSimulator.js'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

const DragNDropHelper = {
  getAssetFromEvent(e) {
    const data = DragNDropHelper.getDataFromEvent(e)
    return data ? data.asset : null
  },

  getDataFromEvent(e) {
    e.preventDefault()
    const dataStr = e.dataTransfer.getData('text')
    if (!dataStr) return null

    try {
      return JSON.parse(dataStr)
    } catch (e) {
      /* json failed to parse */
      return null
    }
  },
  preventDefault(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'copy'
    // without this drop on FF won't work
    try {
      e.dataTransfer.dropEffect = 'copy'
    } catch (e) {
      console.log('Caught error:', e)
    }
    return false
  },
  startSyntheticDrag(e) {
    dragAndDropSimulator.startDragOnTouch(e)
  },
  simulateDragAndDrop: (src, target) => dragAndDropSimulator.simulateDragAndDrop(src, target),
}

// or should be expose this manually - as DnD tests will need this
registerDebugGlobal('dnd', DragNDropHelper, __filename, 'Allows to simulate drag and drop events..')

export default DragNDropHelper
