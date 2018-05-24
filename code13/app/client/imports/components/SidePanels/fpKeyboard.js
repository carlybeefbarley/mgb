import PropTypes from 'prop-types'
import React from 'react'
import KeyBindings from '/client/imports/components/Skills/Keybindings'

// TODO: Allow these to be edited using https://github.com/florian/react-shortcut-chooser

// TODO: Have a nicer way to catch keypresses in app, such as
//       https://github.com/zzarcon/react-keypress   (kinda simple)
//       https://github.com/avocode/react-shortcuts  (a real keypress manager)

const fpKeyboard = props => <KeyBindings commandContext="editor.text." currUser={props.currUser} />

fpKeyboard.propTypes = {
  currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
}

export default fpKeyboard
