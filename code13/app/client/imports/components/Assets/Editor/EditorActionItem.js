import PropTypes from 'prop-types'
import React from 'react'

import { Button } from 'semantic-ui-react'

const EditorActionItem = ({ content, icon, iconOnly, ...rest }) => (
  <Button
    {...rest}
    content={iconOnly ? null : content}
    icon={icon}
    compact
  />
)

EditorActionItem.propTypes = {
  /** The button text */
  content: PropTypes.string.isRequired,

  /** SUIR Icon shorthand */
  icon: PropTypes.string.isRequired,

  /** Reduce to a small icon button */
  iconOnly: PropTypes.bool,
}

export default EditorActionItem
