import PropTypes from 'prop-types'
import React from 'react'

import EditorActionItem from './EditorActionItem'

const styles = {
  menu: {
    flex: '0 0 auto',
    width: '100%',
    marginBottom: '1em',
  },
}

const EditorActionMenu = props => {
  const { iconOnly, items = [], ...rest } = props

  return (
    <div style={styles.menu} {...rest}>
      {items.map(item => (
        <EditorActionItem {...item} key={`${item.icon}-${item.content}`} iconOnly={iconOnly} />
      ))}
    </div>
  )
}

EditorActionMenu.propTypes = {
  /** Reduce items to icons only */
  iconOnly: PropTypes.bool,

  /** Reduce items to icons only */
  items: PropTypes.arrayOf(PropTypes.shape(EditorActionItem.propTypes)),
}

export default EditorActionMenu
