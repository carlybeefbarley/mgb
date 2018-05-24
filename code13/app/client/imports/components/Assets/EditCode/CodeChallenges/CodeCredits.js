import PropTypes from 'prop-types'
import React from 'react'
import { Popup } from 'semantic-ui-react'

export default class CodeCredits extends React.Component {
  static propTypes = {
    console: PropTypes.string,
  }

  render() {
    return (
      <a
        href="https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#bbb', float: 'right' }}
      >
        <small>(based on FreeCodeCamp.com content)</small>
      </a>
    )
  }
}
