import ToolPen from './ToolPen.js'
import ToolEraser from './ToolEraser.js'
import ToolFill from './ToolFill.js'
import ToolMove from './ToolMove.js'
import ToolCircle from './ToolCircle.js'
import ToolRect from './ToolRect.js'
import ToolEyedropper from './ToolEyedropper.js'
import ToolSelect from './ToolSelect.js'
import ToolPaste from './ToolPaste.js'
import ToolSeparator from './ToolSeparator.js'

// We have attempted to put many of the drawing tools in a well-separated interface,
// with the intent to one day let users write and plug-in their own drawing tools.

// Some tools are not so easily separated and it's more sensible at this stage to keep them in the main Code editor.

// Items of the form {label: STRING } represent the tools in the main edit codebase (CodeEdit.js).

const Tools = [
  { label: 'Undo' },
  { label: 'Redo' },

  ToolSeparator,

  ToolEyedropper,

  ToolSeparator,

  ToolPen,
  ToolEraser,
  { label: 'EraseFrame' },
  ToolFill,
  ToolMove,
  ToolCircle,
  ToolRect,

  ToolSeparator,

  ToolSelect,
  { label: 'Cut' },
  { label: 'Copy' },
  ToolPaste,

  ToolSeparator,
]

export default Tools
