import PropTypes from 'prop-types'
import React from 'react'
import { Menu } from 'semantic-ui-react'

import EditorToolItem from './EditorToolItem'

const styles = {
  menu: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    margin: 0,
  },
  menuItem: {
    flex: '0 0 auto',
    margin: 0,
    width: '50%',
  },
}

const EditorToolMenu = props => {
  const { iconOnly, items, ...rest } = props

  const menuStyle = {
    ...styles.menu,
    width: iconOnly ? '8em' : '12em',
  }

  return (
    <Menu
      {...rest}
      borderless
      inverted
      vertical
      style={menuStyle}
      icon={iconOnly || 'labeled'}
      // TODO: move to item component and support tooltips
      items={items.map(item => ({
        key: `${item.icon}-${item.content}`,
        icon: {
          name: item.icon,
          size: iconOnly ? 'large' : null,
        },
        color: 'teal',
        content: !iconOnly && item.content,
        style: styles.menuItem,
      }))}
    />
  )
}

EditorToolMenu.propTypes = {
  /** Reduce items to icons only */
  iconOnly: PropTypes.bool,

  /** Reduce items to icons only */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default EditorToolMenu
