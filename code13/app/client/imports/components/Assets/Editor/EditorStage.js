import React from 'react'

const styles = {
  stage: {
    display: 'flex',
    justifyContent: 'space-around',
    flex: '1',
    background: '#fff',
  },
}

const EditorStage = ({ children, showCheckerboard, ...rest }) => {
  const style = { ...styles.stage }

  if (showCheckerboard) {
    style.background =
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJ0lEQVQoU2O8e/fufwYkoKSkhMxlYKSDgv///6O44d69e6huoL0CALpMKlF6PO5uAAAAAElFTkSuQmCC)'
    style.backgroundPosition = 'center'
  }

  return (
    <div style={style} {...rest}>
      {children}
    </div>
  )
}

export default EditorStage
