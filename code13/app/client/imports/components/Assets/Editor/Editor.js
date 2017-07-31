import PropTypes from 'prop-types'
import React from 'react'

import EditorActionMenu from './EditorActionMenu'
import EditorPanels from './EditorPanels'
import EditorStage from './EditorStage'
import EditorToolMenu from './EditorToolMenu'

const styles = {
  editor: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}

const Editor = ({ actionMenu, iconOnly, panels, stage, toolMenu, ...rest }) => (
  <div style={styles.editor} {...rest}>
    {actionMenu && <EditorActionMenu {...actionMenu} iconOnly={iconOnly} />}
    {toolMenu && <EditorToolMenu {...toolMenu} iconOnly={iconOnly} />}
    {stage && <EditorStage {...stage} />}
    {panels && <EditorPanels {...panels} />}
  </div>
)

Editor.ActionMenu = EditorActionMenu
Editor.Panels = EditorPanels
Editor.Stage = EditorStage
Editor.ToolMenu = EditorToolMenu

Editor.propTypes = {
  /** EditorActionMenu props */
  actionMenu: PropTypes.shape(EditorActionMenu.propTypes).isRequired,

  /** Reduce controls to icons only */
  iconOnly: PropTypes.bool,

  /** EditorPanels props */
  panels: PropTypes.shape(EditorPanels.propTypes),

  /** Main content area */
  stage: PropTypes.element.isRequired,

  /** EditorToolMenu props */
  toolMenu: PropTypes.shape(EditorToolMenu.propTypes).isRequired,
}

export default Editor
