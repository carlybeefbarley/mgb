import _ from 'lodash';
import React, { PropTypes } from 'react';


// TODO: use full list from view-source:https://codemirror.net/demo/search.html


export default  KeyBindingAssist = React.createClass({ 

propTypes: {
  commandContext: PropTypes.string
},

makeList: function(cmdContext)
{
  return keysDB.filter(v => v.command.startsWith(cmdContext)).map( v2 =>
    <a className="item" key={v2.command}>
      <div className="ui horizontal label">{v2.pcKey}</div>
      {v2.description}
    </a>
  )
},

render: function() {
  return (
    <div className="ui divided selection list">
        {this.makeList(this.props.commandContext)}
    </div>)
}

})


export const keysDB = [
  
  { 
    macKey: "Cmd-Z",
    pcKey: "Ctrl-Z",
    command: "editor.text.undo",
    description: "Undo"
  },

  { 
    macKey: "Cmd-Shift-Z",
    pcKey: "Ctrl-Y",
    command: "editor.text.redo",
    description: "Redo"
  },

  { 
    macKey: ".",
    pcKey: ".",
    command: "editor.text.autocomplete",
    description: "Instant AutoComplete at cursor"
  },

  { 
    macKey: "Ctrl-I",
    pcKey: "Ctrl-I",
    command: "editor.text.showType",
    description: "Show 'type' of thing at cursor"
  },

  { 
    macKey: "Ctrl-D",
    pcKey: "Ctrl-D",
    command: "editor.text.showDocs",
    description: "Show 'Docs' of thing at cursor"
  },

  { 
    macKey: "Alt-J",
    pcKey: "Alt-J",
    command: "editor.text.jumpToDef",
    description: "Jump to definition of thing at cursor"
  },

  { 
    macKey: "Ctrl-B",
    pcKey: "Ctrl-B",
    command: "editor.text.Beautify",
    description: "Beautify source code (full file)"
  },

  { 
    macKey: "Alt-,",
    pcKey: "Alt-,",
    command: "editor.text.jumpBack",
    description: "jump Back"
  },

  { 
    macKey: "Ctrl-Q",
    pcKey: "Ctrl-Q",
    command: "editor.text.refactorRename",
    description: "Rename (smart refactor)"
  },

  { 
    macKey: "Ctrl-S",
    pcKey: "Ctrl-S",
    command: "editor.text.showReferences",
    description: "Show other references to current variable/property"
  },

  { 
    macKey: "Alt-F",
    pcKey: "Alt-F",
    command: "editor.text.findText",
    description: "Find text in file"
  },

  { 
    macKey: "Alt-G",
    pcKey: "Alt-G",
    command: "editor.text.gotoLine",
    description: "Goto Line number"
  },

  { 
    macKey: "Ctrl-Q",
    pcKey: "Ctrl-Q",
    command: "editor.text.foldToggle",
    description: "Open/close fold at current line"
  }

]
