import React from 'react'

const styles = {
  panels: {
    display: 'flex',
    flexDirection: 'column',
    width: '250px',
  },
}

const EditorPanels = ({ children, ...rest }) => (
  <div style={styles.panels} {...rest}>
    {children}
  </div>
)

export default EditorPanels
