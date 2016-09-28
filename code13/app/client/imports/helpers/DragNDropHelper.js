"use strict";

const DragNDropHelper = {
  getAssetFromEvent: (e) => {
    e.preventDefault()
    const dataStr = e.dataTransfer.getData("text")
    if (!dataStr)
      return null
    
    let data
    try {
      data = JSON.parse(dataStr);
    }
    catch (e) {
      /* json failed to parse */
      return null
    }
    return data.asset
  },

  preventDefault: (e) => {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'copy'
  }
}

export default DragNDropHelper