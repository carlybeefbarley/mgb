import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon, Menu } from 'semantic-ui-react'

const styles = {
  button: {
    flexGrow: 1,
    margin: '0',
    // paddingLeft: '0',
    // paddingRight: '0',
    width: 'calc(100% * (1/2))',
    // height: '4rem',
    textAlign: 'center',
  },
  label: {
    display: 'block',
    margin: '0.75em 0 0',
    fontWeight: 'normal',
  },
}

const EditorToolItem = props => {
  const { content, icon, iconOnly, ...rest } = props

  const buttonStyle = { ...styles.button }

  // if (iconOnly) {
  //   delete buttonStyle.width
  //   delete buttonStyle.height
  //   delete buttonStyle.paddingLeft
  //   delete buttonStyle.paddingRight
  // }

  return (
    <Menu.Item as="a" style={buttonStyle} {...rest} icon>
      {/* Some icon names are not SUI names, use className */}
      <Icon className={icon} size="large" />
      {!iconOnly && <span style={styles.label}>{content}</span>}
    </Menu.Item>
  )
}

EditorToolItem.propTypes = {
  /** The button text */
  content: PropTypes.string.isRequired,

  /** SUIR Icon shorthand */
  icon: PropTypes.string.isRequired,

  /** Reduce to a small icon button */
  iconOnly: PropTypes.bool,
}

export default EditorToolItem
