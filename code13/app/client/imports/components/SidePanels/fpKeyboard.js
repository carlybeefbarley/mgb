import React, { PropTypes } from 'react'
import KeyBindings from '/client/imports/components/Skills/Keybindings'


// TODO: Allow these to be edited using https://github.com/florian/react-shortcut-chooser

// TODO: Have a nicer way to catch keypresses in app, such as
//       https://github.com/zzarcon/react-keypress   (kinda simple)
//       https://github.com/avocode/react-shortcuts  (a real keypress manager)

export default fpUsers = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },

  render: function () {
    return (
      <KeyBindings commandContext="editor.text." currUser={this.props.currUser} />
    )
  }  
})