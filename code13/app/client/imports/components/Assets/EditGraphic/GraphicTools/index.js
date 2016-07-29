import ToolColorPicker from './ToolColorPicker.js';
import ToolPen from './ToolPen.js';
import ToolEraser from './ToolEraser.js';
import ToolFill from './ToolFill.js';
import ToolMove from './ToolMove.js';
import ToolCircle from './ToolCircle.js';
import ToolRect from './ToolRect.js';
import ToolEyedropper from './ToolEyedropper.js';
import ToolSelect from './ToolSelect.js';
import ToolPaste from './ToolPaste.js';
import ToolSeparator from './ToolSeparator.js';

const Tools = [
  ToolColorPicker,
  ToolSeparator,

  {label: "Undo"},
  {label: "Redo"},
  ToolSeparator,

  ToolSelect,
  ToolEyedropper,
  ToolSeparator,

  ToolPen,
  ToolEraser,
  ToolFill,
  ToolMove,
  ToolCircle,
  ToolRect,
  ToolSeparator,
  
  {label: "Cut"},
  {label: "Copy"},
  ToolPaste,

];

export default Tools