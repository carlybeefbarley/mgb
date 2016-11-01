"use strict";

const DragNDropHelper = {
  getAssetFromEvent: (e) => {
    const data = DragNDropHelper.getDataFromEvent(e)
    return data ? data.asset : null
  },

  getDataFromEvent: (e) => {
    e.preventDefault()
    const dataStr = e.dataTransfer.getData("text")
    if (!dataStr)
      return null

    try {
      return JSON.parse(dataStr);
    }
    catch (e) {
      /* json failed to parse */
      return null
    }
  },
  preventDefault: (e) => {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'copy'
  }
}

export default DragNDropHelper
