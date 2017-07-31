import React from 'react'

const styles = {
  panel: {},
}

const EditorPanel = ({ children, ...rest }) => (
  <div style={styles.panel} {...rest}>
    {children}
  </div>
)

export default EditorPanel
