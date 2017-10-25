import _ from 'lodash'
import { Tracker } from 'meteor/tracker'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'

import { getFeatureLevel } from '/imports/schemas/settings-client'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { Popup, Button } from 'semantic-ui-react'
import { expectedToolbars } from './expectedToolbars.js'

const keyModifiers = {
  CTRL: 1 << 8,
  SHIFT: 1 << 9,
  ALT: 1 << 10,
  META: 1 << 11, // Mac CMD key / Windows 'windows' key. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/metaKey
}

const _keyMaps = {
  SPACE: 32,
  ENTER: 13,
  LEFT: 37,
  TOP: 38,
  RIGHT: 39,
  DOWN: 40,
  PLUS: 187, // numpad has 107
  MINUS: 189, // numpad has 109
  '\\': 220, // backslash
}

const _defaultToolbarButtonSize = 'small'

// Make Toolbar Level Key using a well-known prefix on the Toolbar name
export const makeLevelKey = name => `toolbar-level-${name}`

// Make Toolbar Data Key using a well-known prefix on the Toolbar name
export const makeTDataKey = name => `toolbar-data-${name}`

export default class Toolbar extends React.Component {
  constructor(...args) {
    super(...args)
    this.keyActions = {}
    this.buttons = []

    // Level Slider values..
    this.lsActiveFeatureLevelName = this.props.levelName || this.props.name
    this.lsLevelKey = makeLevelKey(this.lsActiveFeatureLevelName)

    if (!_.includes(expectedToolbars.scopeNames, this.props.name))
      console.trace(
        `Unexpected Toolbar name "${this.props
          .name}" in Toolbar.js. Devs should add new ones to expectedToolbars.scopeNames"`,
      )

    this.maxLevel = expectedToolbars.getMaxLevel(this.lsActiveFeatureLevelName) + 1

    this.state = {
      // TODO is this param actually in use?
      activeButtonIndex: null, // null, or an index into the list of buttons provided in props.config
      level: this.getEffectiveFeatureLevel(), // current featureLevel slider value. This will be updated magically by _trackerComputationContext and Meteor
    }

    this._onKeyDown = e => {
      // don't steal events from input fields
      // Textarea is exception - because of Codemirror textarea
      // make sure to have proper modifiers (ctrl, alt...) - otherwise Toolbar will steal event
      if (
        _.includes(['INPUT', 'SELECT', 'TEXTAREA'], e.target.tagName) &&
        !e.target.classList.contains('allow-toolbar-shortcuts')
      )
        return
      const keyval = this.getKeyval(e)
      if (this.keyActions[keyval]) e.preventDefault()
    }

    this._onKeyUp = e => {
      // don't steal events from input fields
      // TODO(@stauzs): Maybe worth using something like https://github.com/madrobby/keymaster to handle the edge cases like meta (cmd), input etc.
      if (
        _.includes(['INPUT', 'SELECT', 'TEXTAREA'], e.target.tagName) &&
        !e.target.classList.contains('allow-toolbar-shortcuts')
      )
        return

      let keyval = this.getKeyval(e)
      if (this.keyActions[keyval]) {
        const b = this.getButtonFromAction(this.keyActions[keyval].action)

        if (!b || b.disabled) return

        e.preventDefault()

        // saves prev tool idx so after undo/redo we can set back tool
        // Ctrl+Z or Ctrl+Shift+Z
        if (keyval == 346 || keyval == 858) {
          if (this.props.setPrevToolIdx) {
            this.props.setPrevToolIdx(this.getActiveButtonIdx())
          }
        }

        const action = this.keyActions[keyval].action
        joyrideCompleteTag(`mgbjr-CT-toolbar-${this.props.name}-${action}-keypress`)
        joyrideCompleteTag(`mgbjr-CT-toolbar-${this.props.name}-${action}-invoke`)
        this.keyActions[keyval](e)

        const pageName = this.props.name
        const actionName = b.name
        // analytics.track( actionName, { page: pageName } )
        ga('send', 'event', pageName, actionName, 'shortcut')
      }
    }
  }

  getEffectiveFeatureLevel() {
    return (
      getFeatureLevel(this.context.settings, this.lsLevelKey) ||
      expectedToolbars.getDefaultLevel(this.lsActiveFeatureLevelName)
    )
  }

  /* Lifecycle functions */
  componentDidMount() {
    this.keyActions = {}
    window.addEventListener('keyup', this._onKeyUp)
    window.addEventListener('keydown', this._onKeyDown)
    // Set up an observer so we know when the featureLevel setting changes for this user.
    this._trackerComputationContext = Tracker.autorun(() => {
      this.setState({ level: this.getEffectiveFeatureLevel() })
    })
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this._onKeyUp)
    window.removeEventListener('keydown', this._onKeyDown)
    // Stop listening to changes in this toolbar level setting
    if (this._trackerComputationContext) this._trackerComputationContext.stop()

    // clean up cached keyActions
    this.keyActions = null
  }

  getKeyval(e) {
    let keyval = e.which
    e.metaKey && (keyval |= keyModifiers.META)
    e.shiftKey && (keyval |= keyModifiers.SHIFT)
    e.ctrlKey && (keyval |= keyModifiers.CTRL)
    e.altKey && (keyval |= keyModifiers.ALT)
    return keyval
  }

  getButtonFromAction(action) {
    return _.find(this.props.config.buttons, o => o.name == action)
  }

  getActiveButtonIdx() {
    let idx = null
    for (let i = 0; i < this.props.config.buttons.length; i++) {
      const button = this.props.config.buttons[i]
      if (button.active) idx = i
    }
    return idx
  }

  registerShortcut(shortcut, action) {
    const keys = shortcut.split('+')
    // create unique index where first 8 bits is keycode
    // 9th-12th bits are Ctrl/Shift/Alt/Meta - See keyModifiers.*

    let keyval = 0

    _.each(keys, rawkey => {
      const key = rawkey.toUpperCase().trim()

      // some special cases
      //switch (key)
      if (_.has(_keyMaps, key)) keyval |= _keyMaps[key]
      else if (key.length > 1) {
        if (_.has(keyModifiers, key)) keyval |= keyModifiers[key]
        else console.error(`Unknown key modifier [${key}] in shortcut '${shortcut}'`)
      } else if (key.length === 1) keyval |= key.toUpperCase().charCodeAt(0)
    })

    if (!this.props.actions[action]) {
      console.trace(`Missing Toolbar action '${action}' for shortcut'${shortcut}'`)
      return
    }

    // nice warning for conflicting shortcuts
    if (
      this.keyActions[keyval] &&
      action != this.keyActions[keyval].action &&
      !this.getButtonFromAction(action).disabled &&
      !this.getButtonFromAction(this.keyActions[keyval].action).disabled
    )
      console.error(
        `Multiple Keyboard shortcuts detected: '${this.keyActions[keyval]
          .action}' and ${action}.. overwriting`,
      )

    this.keyActions[keyval] = this.props.actions[action].bind(this.props.actions)
    this.keyActions[keyval].action = action
  }

  render() {
    return (
      <div className="mgb-toolbar">
        {_.map(
          this.props.config.buttons,
          (b, i) =>
            b.name == 'separator' ? (
              <span style={{ width: '2px' }} key={i}>
                {' '}
              </span>
            ) : (
              <Button.Group key={i} style={{ marginRight: '0px', marginBottom: '2px', marginTop: '2px' }}>
                {this._renderButton(b, i)}
              </Button.Group>
            ),
        )}

        {this.state.level < this.maxLevel - 1 && (
          <QLink query={{ _fp: 'settings' }}>
            <Popup
              trigger={
                <Button
                  active={false}
                  compact
                  basic
                  style={{ marginLeft: '4px' }}
                  id="mgbjr-toolbar-optionsButton"
                  // Basic comes out a little smaller than normal, so don't need: size={_defaultToolbarButtonSize}
                  icon="setting"
                />
              }
              header="More Tools"
              content="Click here to enable additional tools in Settings"
            />
          </QLink>
        )}
      </div>
    )
  }

  _handleClick(action, index, e) {
    if (this.state.activeButtonIndex === index) return

    if (this.props.actions[action]) {
      // saves prev tool idx so after undo/redo we can set back tool
      if (action == 'toolHandleUndo' || action == 'toolHandleRedo' || action == 'eyedropperTool') {
        if (this.props.setPrevToolIdx) {
          this.props.setPrevToolIdx(this.getActiveButtonIdx())
        }
      }

      joyrideCompleteTag(`mgbjr-CT-toolbar-${this.props.name}-${action}-click`)
      joyrideCompleteTag(`mgbjr-CT-toolbar-${this.props.name}-${action}-invoke`)
      this.props.actions[action](e)

      const pageName = this.props.name
      // analytics.track( action, { page: pageName } )
      ga('send', 'event', pageName, action, 'button')
    } else console.error(`Cannot find action for button '${action}'`, this.props.actions)
  }

  _renderButton(b, index) {
    const label = b.label && (this.state.level <= 2 || this.state.level === b.level) ? ' ' + b.label : ''
    const joyrideId = 'mgbjr-' + this.props.name + '-' + b.name // Auto-create an id for react-joyride purposes
    if (b.shortcut && !b.disabled) this.registerShortcut(b.shortcut, b.name)

    if (b.component) {
      const ElComponent = b.component
      return <ElComponent id={joyrideId} label={label} button={b} key={index} />
    }

    const hidden = b.level > this.state.level ? ' invisible' : ' isvisible' // isvisible because visible is reserved
    const className = 'animate new ' + hidden

    return (
      <Popup
        trigger={
          <Button
            compact
            icon
            className={className}
            primary={!!b.active}
            id={joyrideId}
            disabled={b.disabled}
            size={_defaultToolbarButtonSize}
            style={{ position: 'relative' }}
            onClick={this._handleClick.bind(this, b.name, index)}
            data-index={index}
          >
            <i className={(b.icon ? b.icon : b.name) + ' icon'} />
            {b.iconText ? b.iconText : ''}
          </Button>
        }
        key={index}
        header={b.label}
        position="top center"
        content={b.tooltip + (b.shortcut ? ' [' + b.shortcut + ']' : '')}
      />
    )
  }
}

Toolbar.propTypes = {
  name: PropTypes.string.isRequired, // Name of this toolbar instance. Should be one of expectedToolbars.scopeNames
  config: PropTypes.object.isRequired, // Config.. { buttons: {}, vertical: bool }
  levelName: PropTypes.string, // Use this if you want to share active level with other toolbars - default = name
  level: PropTypes.number, // Default level if not specified in the user settings
}

Toolbar.contextTypes = {
  settings: PropTypes.object,
}
